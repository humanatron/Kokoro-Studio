
export type CardStatus = 'PLANNED' | 'ORDERED' | 'SENT' | 'DELETED';

export interface Preference {
  id: string;
  category: 'like' | 'dislike' | 'fact' | 'ritual';
  content: string;
  timestamp: number;
}

export interface ImportantDate {
  id: string;
  label: string;
  date: string; // ISO format
  recurring: boolean;
  status: CardStatus;
  leadDays: number;
  notes?: string;
}

export interface ProductRecommendation {
  name: string;
  price?: string;
  url?: string;
  reason: string;
}

export interface Person {
  id: string;
  name: string;
  nickname?: string;
  relationship: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
  pinned: boolean;
  preferences: Preference[];
  dates: ImportantDate[];
  notes: string;
  lastInteraction?: number;
}
