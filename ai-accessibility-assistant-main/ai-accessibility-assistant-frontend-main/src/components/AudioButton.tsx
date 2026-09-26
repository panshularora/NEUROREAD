import { useState, useRef, useEffect } from 'react';
import { BASE_URL, fetchTTSAudio } from '../services/api';

const ttsCache = new Map();

export default function AudioButton({ src, text, autoPlay = false, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef(null);

  const performPlay = async () => {
    if (isLoading) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    let targetUrl = src?.startsWith('/') ? `${BASE_URL}${src}` : src;

    if (text && !targetUrl) {
      setIsLoading(true);
      try {
        if (!ttsCache.has(text)) {
          const blob = await fetchTTSAudio(text);
          ttsCache.set(text, URL.createObjectURL(blob));
        }
        targetUrl = ttsCache.get(text);
      } catch {
        setIsLoading(false);
        setFailed(true);
        return;
      }
      setIsLoading(false);
    }

    if (!targetUrl) return;

    try {
      const audio = new Audio(targetUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      await audio.play();
    } catch {
      setIsPlaying(false);
      setFailed(true);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        performPlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [src, text, autoPlay]);

  if (!src && !text) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setFailed(false);
        performPlay();
      }}
      type="button"
      disabled={isLoading}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isPlaying 
          ? 'bg-clay text-white animate-pulse' 
          : 'bg-charcoal/5 text-charcoal/40 hover:bg-clay/10 hover:text-clay'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''} ${className}`}
      aria-label={failed ? 'Audio unavailable, try again' : isPlaying ? 'Stop audio' : 'Play audio'}
      title={failed ? 'Audio is unavailable right now' : 'Play audio'}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-charcoal/20 border-t-charcoal/60 rounded-full animate-spin" />
      ) : (
        <span 
          className="iconify text-lg" 
          data-icon={isPlaying ? 'solar:stop-circle-bold' : 'solar:volume-loud-bold-duotone'} 
        />
      )}
    </button>
  );
}
