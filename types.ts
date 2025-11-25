
export type Tab = 'brain' | 'focus' | 'forum' | 'archive' | 'settings';

export type Language = 'en' | 'zh';

export type CreatureType = 'dream' | 'nightmare';

export interface SlimePoint {
  x?: number; // Calculated during render
  y?: number; // Calculated during render
  angle: number;
  baseRadius: number;
  originalAngle: number;
  weight: number;
}

export interface VisualParams {
  baseRadius: number;
  baseColor: [number, number, number];
  colors: [number, number, number][]; // 3 layers
  points: SlimePoint[];
  features: string[]; // 'spots' | 'rainbowEdge' | 'flowers'
  spotParams?: {
    count: number;
    spots: { angle: number; dist: number; size: number }[];
    spotColor: [number, number, number];
  };
  flowerParams?: {
    count: number;
    flowers: { idealAngle: number; size: number; color: [number, number, number]; x?: number; y?: number }[];
  };
  eyeOffset: { x: number; y: number };
  eyeColors?: {
    sclera: string;
    pupil: string;
  };
}

export interface Creature {
  id: string;
  type: CreatureType;
  emojis: string[];
  createdAt: number;
  size: number; // scale factor 0.5 to 1.5
  color: string; // Legacy Tailwind color class, kept for fallback
  visualParams?: VisualParams; // New procedural data
  x: number; // Position percentage 0-100
  y: number; // Position percentage 0-100
  name?: string; // Optional name
  interpretation?: string; // Dream interpretation
  isArchived?: boolean; // Whether creature is archived
  archivedAt?: number; // Timestamp when archived
}

export interface ForumPost {
  id: string;
  author: string;
  creature: Creature;
  caption?: string; // User written caption
  likes: number;
  reactions: Record<string, number>;
  comments: ForumComment[];
  timestamp: number;
}

export interface ForumComment {
  id: string;
  user: string;
  text: string;
}

export interface Translations {
  brain: string;
  focus: string;
  forum: string;
  archive: string;
  settings: string;
  startFocus: string;
  giveUp: string;
  focusing: string;
  timeRemaining: string;
  creatureBorn: string;
  nightmareBorn: string;
  share: string;
  language: string;
  selectLanguage: string;
  minutes: string;
  myCreatures: string;
  noCreatures: string;
  nightmareDesc: string;
  dreamDesc: string;
  writeCaption: string;
  post: string;
  cancel: string;
  selectCreature: string;
  noCreaturesToShare: string;
  creatureSize: string;
  addToArchive: string;
  dissolve: string;
  dissolveConfirm: string;
  noArchivedCreatures: string;
  archivedOn: string;
  willDissolveIn: string;
  dissolving: string;
  removeFromArchive: string;
  transformNightmare: string;
  transforming: string;
  transformSuccess: string;
  transformGiveUp: string;
}