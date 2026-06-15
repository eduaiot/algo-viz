// src/types.ts
export interface CardData {
  id: number;
  value: number;
  suit: string;
  display: string;
  faceUp: boolean;
  status: 'idle' | 'sorted' | 'active' | 'comparing';
}
