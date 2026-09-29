export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LocationId =
  | 'neighborhood'
  | 'house_ari'
  | 'house_charlie_brown'
  | 'doghouse_interior'
  | 'house_van_pelt'
  | 'house_schroeder'
  | 'house_peppermint_patty'
  | 'house_marcie'
  | 'house_franklin'
  | 'house_pigpen'
  | 'school'
  | 'baseball_field'
  | 'pumpkin_patch'
  | 'daisy_hill'
  | 'summer_camp'
  | 'lake'
  | 'beach'
  | 'ice_rink';

export interface InteractiveTrigger {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  promptA?: string; // e.g. "A - Hablar", "A - Entrar", "A - Examinar"
  promptB?: string; // e.g. "B - Sentarse", "B - Escribir", "B - Escuchar"
  actionType:
    | 'door_enter'
    | 'door_exit'
    | 'sit'
    | 'examine'
    | 'think_wall'
    | 'lucy_booth'
    | 'schroeder_piano'
    | 'baseball_bat'
    | 'pumpkin_farm'
    | 'fridge'
    | 'sink'
    | 'bed_rest'
    | 'desk_write'
    | 'bookshelf'
    | 'record_player'
    | 'kite_tree'
    | 'skate'
    | 'path_transition'
    | 'beach_chiringuito'
    | 'collect_shell'
    | 'save_point';
  targetLocation?: LocationId;
  targetPosition?: Position;
  examineText?: string;
  examineTitle?: string;
}

export interface Furniture {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  detail?: string;
  isSolid?: boolean;
}

export interface LocationData {
  id: LocationId;
  name: string;
  category: 'exterior' | 'interior';
  parentLocation?: LocationId;
  width: number;
  height: number;
  backgroundTheme: string;
  ambientSound: string;
  lightingType: 'outdoor' | 'indoor' | 'cozy';
  spawnPoint: Position;
  colliders: BoundingBox[];
  triggers: InteractiveTrigger[];
  furnishings?: Furniture[];
  description: string;
}

export interface NPCSchedule {
  locationId: LocationId;
  x: number;
  y: number;
  direction?: 'down' | 'up' | 'left' | 'right';
  currentActivity: string;
  dialoguePool: string[];
}

export interface CharacterNpc {
  id: string;
  name: string;
  locationId: LocationId;
  x: number;
  y: number;
  direction: 'down' | 'up' | 'left' | 'right';
  outfitColor: string;
  accentColor: string;
  hairStyle: string;
  accessory?: string;
  currentActivity: string;
  dialoguePool: string[];
  contextRules?: Record<string, string>;
  isSpecialRoutine?: boolean;
  schedules?: Partial<Record<TimeOfDay, NPCSchedule>>;
  isMoving?: boolean;
  walkStep?: number;
  socialState?: {
    partnerId: string;
    partnerName: string;
    text: string;
    emote?: string;
    isSpeaker?: boolean;
  };
}

export interface ThoughtItem {
  id: string;
  quote: string;
  author: string;
  theme: string;
  isOriginal: boolean;
  date: string;
  notes?: string;
}

export type NotebookCategory =
  | 'Poemas'
  | 'Cuentos'
  | 'Cartas'
  | 'Diarios'
  | 'Pensamientos'
  | 'Capítulos'
  | 'Textos Libres';

export interface NotebookEntry {
  id: string;
  title: string;
  category: NotebookCategory;
  pages: string[]; // Page 1, Page 2, Page 3...
  updatedAt: string;
  locationCreated?: string;
}

export interface SaveSlot {
  id: string; // 'slot_1' | 'slot_2' | 'slot_3' | 'autosave'
  label: string;
  savedAt: string; // "19 Sep 2026, 14:35"
  timestamp: number;
  locationId: LocationId;
  locationName: string;
  playerPos: Position;
  playerDir: 'down' | 'up' | 'left' | 'right';
  timeOfDay: TimeOfDay;
  inGameMinutes: number; // 0..1440
  dayNumber: number; // 1, 2, 3...
  notebookEntriesCount: number;
  thoughtsCount: number;
  saveReason?: string;
}
