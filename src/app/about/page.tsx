'use client';

import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            ✨ About One Minute Bulletin ✨
          </h1>
          <p className="text-gray-300 text-lg font-medium">The story behind the magic 🔥</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
          <div className="space-y-6 text-white">
            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                🎯 What We Do
              </h2>
              <p className="text-gray-300 leading-relaxed">
                One Minute Bulletin transforms your text into professional audio bulletins in seconds. 
                Whether you&apos;re sharing news, updates, or announcements, we make it sound fire with AI-powered voice generation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                🚀 How It Works
              </h2>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  Drop your text into our sleek interface
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Our AI generates high-quality audio using ElevenLabs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  Get a professional bulletin with custom intro
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  Download and share your audio anywhere
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                💫 Inspiration
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Inspired by Fireship&apos;s fast-paced, informative content style, we bring that same energy 
                to audio bulletins. Perfect for content creators, educators, and anyone who wants to 
                deliver information with impact.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                🎨 Tech Stack
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-pink-400">Frontend</div>
                  <div className="text-gray-300">Next.js 15 + React 19</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-purple-400">Styling</div>
                  <div className="text-gray-300">Tailwind CSS</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-indigo-400">AI Voice</div>
                  <div className="text-gray-300">ElevenLabs API</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-teal-400">Deployment</div>
                  <div className="text-gray-300">Vercel Ready</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                🙏 Attribution
              </h2>
              <div className="space-y-3 text-gray-300">
                <div className="bg-white/10 rounded-lg p-4">
                  <a href="https://freesound.org/s/468539/" target="_blank" rel="noopener noreferrer">TV News Loop by SergeQuadrado -- License: Attribution NonCommercial 3.0</a>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 rounded-xl shadow-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
