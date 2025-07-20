'use client';

import { useState } from 'react';
import Link from 'next/link';
import CanvasVideo from '../components/CanvasVideo';

export default function Home() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAudioUrl('');
    setImageUrls([]);
    
    try {
      // Call audio API and four image APIs simultaneously
      const [audioResponse, ...imageResponses] = await Promise.all([
        fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        }),
        // Generate 4 images simultaneously
        ...Array(4).fill(null).map(() => 
          fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          })
        )
      ]);
      
      if (!audioResponse.ok) throw new Error('Failed to generate audio');
      
      // Check if all image responses are ok
      const failedImages = imageResponses.filter(response => !response.ok);
      if (failedImages.length > 0) {
        throw new Error(`Failed to generate ${failedImages.length} image(s)`);
      }
      
      const audioData = await audioResponse.json();
      const imageDataArray = await Promise.all(
        imageResponses.map(response => response.json())
      );
      
      setAudioUrl(audioData.audioUrl);
      setImageUrls(imageDataArray.map(data => data.imageUrl));
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

        {(audioUrl || imageUrls.length > 0) && (
          <div className="mt-8 space-y-6">
            {/* Canvas Video Bulletin Section */}
            {imageUrls.length > 0 && audioUrl && (
              <CanvasVideo imageUrls={imageUrls} audioUrl={audioUrl} />
            )}

            {/* Fallback: Show individual sections if only one is available */}
            {imageUrls.length > 0 && !audioUrl && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🖼️ Your Images are Ready!
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 grid grid-cols-2 gap-2">
                    {imageUrls.map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Generated bulletin thumbnail ${index + 1}`} 
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {imageUrls.slice(0, 2).map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        download={`bulletin-thumbnail-${index + 1}.png`}
                        className="flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        🖼️ Image {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {audioUrl && imageUrls.length === 0 && (
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
