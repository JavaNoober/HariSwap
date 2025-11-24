
import React, { useRef } from 'react';
import { HairstyleOption, Language, GenerationMode } from '../types';
import { UI_TEXT } from '../constants';

interface StyleSelectorProps {
  options: HairstyleOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRandom: () => void;
  disabled: boolean;
  language: Language;
  
  // New props for modes
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  onRandom,
  disabled,
  language,
  mode,
  setMode,
  customPrompt,
  setCustomPrompt,
  refImage,
  setRefImage
}) => {
  const t = UI_TEXT[language];
  const isRandomSelected = selectedId === 'random_ai_gen';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'preset' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.tabPresets}
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'custom' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.tabCustom}
        </button>
        <button
          onClick={() => setMode('reference')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === 'reference' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.tabReference}
        </button>
      </div>

      {/* Mode Content */}
      {mode === 'preset' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {t.selectStyleHeader}
            </h3>
            <button
              onClick={onRandom}
              disabled={disabled}
              className={`
                text-xs flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-lg transition-all border
                ${isRandomSelected 
                  ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white border-transparent shadow-md' 
                  : 'bg-white text-brand-600 border-brand-200 hover:border-brand-400 hover:bg-brand-50'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <svg className={`w-4 h-4 ${isRandomSelected ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {t.randomStyle}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto hide-scrollbar">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                disabled={disabled}
                className={`
                  relative p-3 rounded-xl border text-left transition-all duration-200 group
                  flex flex-col gap-2 h-full
                  ${selectedId === option.id 
                    ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500' 
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`w-full h-20 rounded-lg ${option.previewColor} mb-1 overflow-hidden relative shadow-inner`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/hair.png')]"></div>
                    {selectedId === option.id && (
                      <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1 shadow-sm">
                          <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                </div>
                
                <div>
                  <p className={`text-sm font-semibold ${selectedId === option.id ? 'text-brand-900' : 'text-slate-700'}`}>
                    {option.label[language]}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {option.description[language]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'custom' && (
        <div className="animate-fade-in space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            {t.customPromptLabel}
          </label>
          <textarea
            className="w-full p-4 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 min-h-[120px] resize-none text-slate-700 placeholder:text-slate-400"
            placeholder={t.customPromptPlaceholder}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      {mode === 'reference' && (
        <div className="animate-fade-in space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            {t.refImageLabel}
          </label>
          
          {!refImage ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer transition-colors"
             >
                <input type="file" ref={fileInputRef} onChange={handleRefFileChange} accept="image/*" className="hidden" />
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 mb-2 font-medium">{t.refImageDesc}</p>
                <button className="text-xs text-brand-600 font-semibold hover:underline">{t.refImageBtn}</button>
             </div>
          ) : (
            <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden group border border-slate-200">
               <img src={refImage} alt="Reference" className="w-full h-full object-contain" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setRefImage(null)}
                    className="bg-white/90 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white"
                  >
                    Remove
                  </button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
