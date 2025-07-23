'use client';

import { useEffect, useRef, useState } from 'react';

interface CanvasVideoProps {
  imageUrls: string[];
  audioUrl: string;
}

export default function CanvasVideo({ imageUrls, audioUrl }: CanvasVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = imageUrls.map((url) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          // No need for crossOrigin since we're using base64 data URLs
          img.onload = () => resolve(img);
          img.onerror = (error) => {
            console.error('Error loading image:', url, error);
            reject(error);
          };
          img.src = url;
        });
      });

      try {
        imagesRef.current = await Promise.all(imagePromises);
        setImagesLoaded(true);
        drawCurrentImage();
      } catch (error) {
        console.error('Error loading images:', error);
        setImagesLoaded(false);
      }
    };

    if (imageUrls.length > 0) {
      setImagesLoaded(false);
      loadImages();
    } else {
      setImagesLoaded(false);
    }
  }, [imageUrls]);

  const drawCurrentImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || imagesRef.current.length === 0) return;

    const img = imagesRef.current[currentImageIndex];
    if (!img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to maintain aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      // Image is taller than canvas
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const startAnimation = () => {
    if (!audioRef.current || imagesRef.current.length === 0) return;

    setIsPlaying(true);
    audioRef.current.play();

    // Set a faster image transition interval for looping effect
    const imageInterval = 2000; // Change image every 2 seconds for continuous looping

    let lastImageChange = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - lastImageChange;

      // Change image based on timing - loop continuously
      if (elapsed >= imageInterval) {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
        lastImageChange = currentTime;
      }

      // Continue animation while audio is playing
      if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setCurrentImageIndex(0);
        // Stop recording if it was active
        if (isRecording) {
          stopRecording();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const startRecording = async () => {
    if (!canvasRef.current || !audioRef.current) return;

    try {
      // Since we're using base64 images, canvas should not be tainted
      // But we'll keep a safety check just in case
      try {
        canvasRef.current.toDataURL();
      } catch (taintError) {
        throw new Error('Canvas is tainted. This should not happen with base64 images.');
      }

      // Get canvas stream
      const canvasStream = canvasRef.current.captureStream(30); // 30 FPS
      
      // Get audio stream from the audio element
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaElementSource(audioRef.current);
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSource.connect(audioDestination);
      audioSource.connect(audioContext.destination); // Keep audio playing
      
      // Combine canvas and audio streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);

      // Setup MediaRecorder with fallback mime types
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start the animation
      startAnimation();
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error starting video recording: ${errorMessage}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopAnimation();
  };

  const downloadVideo = () => {
    if (!recordedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = 'bulletin-video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const stopAnimation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentImageIndex(0);
  };

  // Update canvas when current image changes
  useEffect(() => {
    drawCurrentImage();
  }, [currentImageIndex, drawCurrentImage]);

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentImageIndex(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Stop recording if it was active
      if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🎥 Watch your One Minute Bulletin
      </h2>
      <div className="space-y-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && !isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!imagesLoaded}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-full p-4 transition-all duration-200 transform hover:scale-110 disabled:hover:scale-100"
                >
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (isPlaying || isRecording) ? (
                <button
                  onClick={stopRecording}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zM11 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : null}
              
              {isRecording && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Recording
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {imageUrls.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex ? 'bg-pink-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Video Recording Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
          {recordedVideoUrl && !isRecording && (
            <div className="space-y-3">
              <div className="text-center text-green-400 font-medium">
                ✅ Your download is ready!
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={downloadVideo}
                  className="flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  📥 Video
                </button>
              </div>
                <div className="flex justify-center">
                  <a
                    href={audioUrl}
                    download="bulletin.mp3"
                    className="flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    📥 Audio Only
                  </a>
                </div>
            </div>
          )}
          
          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-red-400 font-medium">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Recording in progress...
              </div>
            </div>
          )}
        </div>
      </div>
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
