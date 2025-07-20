'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAudioUrl('');
    setImageUrl('');
    
    try {
      // Call both APIs simultaneously
      const [audioResponse, imageResponse] = await Promise.all([
        fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        }),
        fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
      ]);
      
      if (!audioResponse.ok) throw new Error('Failed to generate audio');
      if (!imageResponse.ok) throw new Error('Failed to generate image');
      
      const audioData = await audioResponse.json();
      const imageData = await imageResponse.json();
      
      setAudioUrl(audioData.audioUrl);
      setImageUrl(imageData.imageUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              About ℹ️
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            ✨ One Minute Bulletin ✨
          </h1>
          <p className="text-gray-300 text-lg font-medium">Inspired by Fireship 🔥</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-semibold text-white mb-3">
                💭 What&apos;s the news you want to deliver?
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                placeholder="Paste the news here and click Generate"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 rounded-xl shadow-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating magic...
                </>
              ) : (
                <>
                   ✨ Generate
                </>
              )}
            </button>
          </form>
        </div>

        {(audioUrl || imageUrl) && (
          <div className="mt-8 space-y-6">
            {/* Video Bulletin Section */}
            {imageUrl && audioUrl && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🎥 Your Video Bulletin is Ready!
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Generated bulletin thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button 
                          onClick={() => {
                            const audio = new Audio(audioUrl);
                            audio.play();
                          }}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                        >
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href={imageUrl}
                      download="bulletin-thumbnail.png"
                      className="flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      🖼️ Image
                    </a>
                    <a
                      href={audioUrl}
                      download="bulletin.mp3"
                      className="flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      🎧 Audio
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback: Show individual sections if only one is available */}
            {imageUrl && !audioUrl && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🖼️ Your Thumbnail is Ready!
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <img 
                      src={imageUrl} 
                      alt="Generated bulletin thumbnail" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <a
                    href={imageUrl}
                    download="bulletin-thumbnail.png"
                    className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                  >
                    📥 Download Image
                  </a>
                </div>
              </div>
            )}

            {audioUrl && !imageUrl && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🎧 Your Audio is Ready!
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                  <a
                    href={audioUrl}
                    download="bulletin.mp3"
                    className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                  >
                    📥 Download Audio
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
