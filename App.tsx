
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { ResultComparison } from './components/ResultComparison';
import { Button } from './components/Button';
import { HAIRSTYLE_OPTIONS, UI_TEXT, RANDOM_COMPONENTS } from './constants';
import { GeneratedImage, GenerationState, Language, HairstyleOption, Gender, GenerationMode } from './types';
import { generateHairstyle } from './services/geminiService';

const RANDOM_STYLE_ID = 'random_ai_gen';
const FAVORITES_KEY = 'hairswap_favorites_v1';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  
  // Generation Settings State
  const [mode, setMode] = useState<GenerationMode>('preset');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [randomStyle, setRandomStyle] = useState<HairstyleOption | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [refImage, setRefImage] = useState<string | null>(null);

  // Results & Favorites
  const [generatedResults, setGeneratedResults] = useState<GeneratedImage[]>([]);
  const [favorites, setFavorites] = useState<GeneratedImage[]>([]);
  const [viewMode, setViewMode] = useState<'results' | 'favorites'>('results');
  
  // App Config
  const [language, setLanguage] = useState<Language>('zh');
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
  });

  const t = UI_TEXT[language];

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const handleToggleFavorite = (id: string) => {
    // Check if it's already in favorites
    const isFav = favorites.some(f => f.id === id);
    let newFavorites;

    if (isFav) {
      newFavorites = favorites.filter(f => f.id !== id);
    } else {
      // Find the item in generatedResults (or logic to persist it if cleared)
      // For now, we look in results or current favorites to support un-favoriting from Favorites tab
      const item = generatedResults.find(r => r.id === id) || favorites.find(f => f.id === id);
      if (item) {
        newFavorites = [{ ...item, isFavorite: true }, ...favorites];
      } else {
        return;
      }
    }

    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const handleImageSelected = (base64: string) => {
    setOriginalImage(base64);
    // Do not clear favorites
    setGeneratedResults([]);
    setSelectedStyleId(null);
    setRandomStyle(null);
    setGenerationState({ isGenerating: false, error: null });
    setViewMode('results');
  };

  const handleClear = () => {
    setOriginalImage(null);
    setGeneratedResults([]);
    setSelectedStyleId(null);
    setRandomStyle(null);
    setGenerationState({ isGenerating: false, error: null });
    // Reset custom inputs
    setCustomPrompt('');
    setRefImage(null);
  };

  const generateRandomStyleOption = (): HairstyleOption => {
    const r = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    const length = r(RANDOM_COMPONENTS.lengths);
    const texture = r(RANDOM_COMPONENTS.textures);
    const color = r(RANDOM_COMPONENTS.colors);
    const style = r(RANDOM_COMPONENTS.styles);

    // Dynamic prompt
    const prompt = `a ${length.en}, ${texture.en} ${color.en} ${style.en} hairstyle`;
    
    // Dynamic Labels
    const labelEn = `${color.en} ${style.en}`;
    const labelZh = `${color.zh}${style.zh}`;

    const descEn = `A ${length.en}, ${texture.en} style in ${color.en}`;
    const descZh = `${length.zh}、${texture.zh}${color.zh}造型`;

    return {
      id: RANDOM_STYLE_ID,
      label: { en: labelEn, zh: labelZh },
      prompt: prompt,
      description: { en: descEn, zh: descZh },
      gender: [Gender.FEMALE, Gender.MALE], // Random fits all
      previewColor: 'bg-gradient-to-r from-purple-500 to-pink-500', 
    };
  };

  const handleRandomStyle = () => {
    const newRandomStyle = generateRandomStyleOption();
    setRandomStyle(newRandomStyle);
    setSelectedStyleId(RANDOM_STYLE_ID);
  };

  const isGenerateDisabled = () => {
    if (generationState.isGenerating) return true;
    if (mode === 'preset') return !selectedStyleId;
    if (mode === 'custom') return !customPrompt.trim();
    if (mode === 'reference') return !refImage;
    return true;
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage || isGenerateDisabled()) return;

    let finalPrompt = '';
    let finalLabel = '';
    let finalDesc = '';
    let finalStyleId = '';
    let referenceImagePayload: string | null = null;

    // Prepare payload based on mode
    if (mode === 'preset') {
      let styleOption: HairstyleOption | undefined | null;
      if (selectedStyleId === RANDOM_STYLE_ID) {
        styleOption = randomStyle;
      } else {
        styleOption = HAIRSTYLE_OPTIONS.find(opt => opt.id === selectedStyleId);
      }
      if (!styleOption) return;
      
      finalPrompt = styleOption.prompt;
      finalLabel = styleOption.label[language];
      finalDesc = styleOption.description[language];
      finalStyleId = styleOption.id;

    } else if (mode === 'custom') {
      finalPrompt = customPrompt;
      finalLabel = t.tabCustom;
      finalDesc = customPrompt;
      finalStyleId = 'custom-' + Date.now();

    } else if (mode === 'reference') {
      if (!refImage) return;
      referenceImagePayload = refImage;
      finalPrompt = ""; // Service handles prompt logic for references
      finalLabel = t.tabReference;
      finalDesc = "Style transfer from image";
      finalStyleId = 'ref-' + Date.now();
    }

    setGenerationState({ isGenerating: true, error: null });
    setViewMode('results'); // Switch to results view

    try {
      const generatedUrl = await generateHairstyle(originalImage, finalPrompt, referenceImagePayload);
      
      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        originalImage: originalImage,
        generatedImageUrl: generatedUrl,
        styleId: finalStyleId,
        label: finalLabel,
        description: finalDesc,
        timestamp: Date.now(),
        isFavorite: false,
      };

      setGeneratedResults(prev => [newResult, ...prev]);
    } catch (error) {
      console.error(error);
      setGenerationState(prev => ({ 
        ...prev, 
        error: t.errorGeneric
      }));
    } finally {
      setGenerationState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [originalImage, selectedStyleId, randomStyle, language, mode, customPrompt, refImage, t.errorGeneric, isGenerateDisabled, t.tabCustom, t.tabReference]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const getCurrentStyleLabel = () => {
    if (mode === 'custom') return t.tabCustom;
    if (mode === 'reference') return t.tabReference;
    if (selectedStyleId === RANDOM_STYLE_ID) {
      return randomStyle ? randomStyle.label[language] : t.randomLabel;
    }
    return HAIRSTYLE_OPTIONS.find(s => s.id === selectedStyleId)?.label[language];
  };

  // Determine which list to show
  const displayList = viewMode === 'favorites' ? favorites : generatedResults;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-200">
              H
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-purple-800">
              {t.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleLanguage}
               className="text-sm font-medium text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
             >
               {language === 'en' ? '中文' : 'English'}
             </button>
             <div className="text-sm text-slate-500 hidden sm:block">
               {t.subtitle}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section - Only show if no image uploaded */}
        {!originalImage && (
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
              {t.heroTitle}
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              {t.heroDesc}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.step1}</h3>
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                currentImage={originalImage} 
                onClear={handleClear}
                language={language}
              />
            </div>

            {originalImage && (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animation-fade-in">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{t.step2}</h3>
                    {(selectedStyleId || mode !== 'preset') && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-medium truncate max-w-[150px]">
                        {getCurrentStyleLabel()}
                      </span>
                    )}
                 </div>
                 
                 <StyleSelector 
                   options={HAIRSTYLE_OPTIONS}
                   selectedId={selectedStyleId}
                   onSelect={(id) => { setSelectedStyleId(id); setRandomStyle(null); }}
                   onRandom={handleRandomStyle}
                   disabled={generationState.isGenerating}
                   language={language}
                   mode={mode}
                   setMode={setMode}
                   customPrompt={customPrompt}
                   setCustomPrompt={setCustomPrompt}
                   refImage={refImage}
                   setRefImage={setRefImage}
                 />

                 <div className="mt-6 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                   <Button 
                     onClick={handleGenerate}
                     disabled={isGenerateDisabled()}
                     isLoading={generationState.isGenerating}
                     className="w-full h-12 text-lg shadow-xl shadow-brand-200 hover:shadow-brand-300 transition-shadow"
                   >
                     {generationState.isGenerating ? t.generatingBtn : t.generateBtn}
                   </Button>
                   {generationState.error && (
                     <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                       {generationState.error}
                     </p>
                   )}
                 </div>
               </div>
            )}
          </div>

          {/* Right Column: Results & Favorites */}
          <div className="lg:col-span-7 space-y-6">
             {/* View Toggles */}
             {(generatedResults.length > 0 || favorites.length > 0) && (
               <div className="flex items-center gap-4 border-b border-slate-200 pb-2 mb-4">
                 <button 
                    onClick={() => setViewMode('results')}
                    className={`text-lg font-bold transition-colors ${viewMode === 'results' ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {t.resultsTitle} <span className="text-sm font-normal text-slate-400">({generatedResults.length})</span>
                 </button>
                 <div className="h-6 w-px bg-slate-300"></div>
                 <button 
                    onClick={() => setViewMode('favorites')}
                    className={`text-lg font-bold transition-colors ${viewMode === 'favorites' ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {t.favoritesTitle} <span className="text-sm font-normal text-slate-400">({favorites.length})</span>
                 </button>
               </div>
             )}

             {displayList.length > 0 ? (
               <div className="space-y-8 animate-fade-in">
                 {displayList.map((result) => (
                   <ResultComparison
                     key={result.id}
                     id={result.id}
                     originalImage={result.originalImage}
                     generatedImage={result.generatedImageUrl}
                     label={result.label || t.resultLabel}
                     language={language}
                     isFavorite={favorites.some(f => f.id === result.id)}
                     onToggleFavorite={handleToggleFavorite}
                   />
                 ))}
               </div>
             ) : (
                /* Empty State */
               <div className={`h-full flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 min-h-[400px] ${!originalImage && viewMode === 'results' ? 'hidden lg:flex' : ''}`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {viewMode === 'favorites' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    {viewMode === 'favorites' ? t.favoritesTitle : t.noResultsTitle}
                  </h3>
                  <p className="text-slate-400 max-w-sm">
                    {viewMode === 'favorites' ? t.noFavoritesDesc : t.noResultsDesc}
                  </p>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
