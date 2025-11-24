
import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  currentImage: string | null;
  onClear: () => void;
  language: Language;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, currentImage, onClear, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = UI_TEXT[language];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    
    // Size limit check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelected(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (currentImage) {
    return (
      <div className="relative group w-full h-96 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
        <img 
          src={currentImage} 
          alt="Uploaded" 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
           <Button variant="secondary" onClick={onClear}>
              {t.changePhoto}
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 h-96 cursor-pointer
        ${isDragging ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{t.uploadTitle}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        {t.uploadDesc}
      </p>
      
      <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
        {t.uploadBtn}
      </Button>
    </div>
  );
};
