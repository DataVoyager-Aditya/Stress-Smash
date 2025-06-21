export interface Mood {
  id: string;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  intensity: number;
  description: string;
}

export interface GameSession {
  id: string;
  mood: Mood;
  gameType: string;
  duration: number;
  score: number;
  timestamp: Date;
  effectiveness: number;
}

export interface UserProgress {
  totalSessions: number;
  favoriteGame: string;
  averageStressReduction: number;
  streakDays: number;
  achievements: string[];
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  suitableForMoods: string[];
  category: 'breathing' | 'interactive' | 'creative' | 'rhythmic' | 'cognitive' | 'social' | 'celebration';
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}