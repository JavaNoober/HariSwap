
export enum Gender {
  FEMALE = 'Female',
  MALE = 'Male',
}

export type Language = 'en' | 'zh';

export type GenerationMode = 'preset' | 'custom' | 'reference';

export interface HairstyleOption {
  id: string;
  label: Record<Language, string>;
  prompt: string; // The prompt fragment for AI (always English)
  description: Record<Language, string>; // The display description for UI
  gender: Gender[];
  previewColor: string;
}

export interface GeneratedImage {
  id: string;
  originalImage: string;
  generatedImageUrl: string;
  styleId: string; // 'custom' or 'reference' or preset ID
  label: string; 
  description: string; 
  timestamp: number;
  isFavorite?: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}
