
import React, { useState } from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface ResultComparisonProps {
  id: string;
  originalImage: string;
  generatedImage: string;
  label: string;
  language: Language;
  isFavorite?: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  id,
  originalImage,
  generatedImage,
  label,
  language,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const t = UI_TEXT[language];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          {t.resultLabel}: <span className="text-brand-600 line-clamp-1 max-w-[150px]">{label}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleFavorite(id)}
            className={`p-2 rounded-full transition-all ${
              isFavorite 
                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle Favorite"
          >
            <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium bg-slate-100 px-2 py-1 rounded">{t.compareLabel}</span>
        </div>
      </div>
      
      <div 
        className="relative w-full h-96 select-none cursor-ew-resize group"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchEnd={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Background Image (Original) */}
        <img 
          src={originalImage} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-contain bg-slate-50 pointer-events-none" 
        />

        {/* Foreground Image (Generated) - Clipped */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={generatedImage} 
            alt="Generated" 
            className="absolute inset-0 w-full h-full object-contain bg-slate-50" 
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center group-hover:bg-brand-400 transition-colors"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200 text-slate-400 group-hover:text-brand-500 group-hover:scale-110 transition-transform">
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
             </svg>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex justify-between items-center bg-slate-50">
        <p className="text-sm text-slate-500">{t.compareTip}</p>
        <a 
          href={generatedImage} 
          download={`hairswap-${label.toLowerCase().replace(/\s+/g, '-')}.png`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          {t.downloadBtn}
        </a>
      </div>
    </div>
  );
};
