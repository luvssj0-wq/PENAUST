import { SaveSlot, TimeOfDay, LocationId, Position } from '../types';

const STORAGE_KEY = 'peanuts_game_saves_v1';

export const DEFAULT_SLOTS: SaveSlot[] = [
  {
    id: 'slot_1',
    label: 'Ranura 1',
    savedAt: '',
    timestamp: 0,
    locationId: 'neighborhood',
    locationName: 'El Barrio Residencial',
    playerPos: { x: 190, y: 310 },
    playerDir: 'down',
    timeOfDay: 'day',
    inGameMinutes: 540, // 09:00 AM
    dayNumber: 1,
    notebookEntriesCount: 0,
    thoughtsCount: 0,
    saveReason: 'Sin partida guardada'
  },
  {
    id: 'slot_2',
    label: 'Ranura 2',
    savedAt: '',
    timestamp: 0,
    locationId: 'neighborhood',
    locationName: 'El Barrio Residencial',
    playerPos: { x: 190, y: 310 },
    playerDir: 'down',
    timeOfDay: 'day',
    inGameMinutes: 540,
    dayNumber: 1,
    notebookEntriesCount: 0,
    thoughtsCount: 0,
    saveReason: 'Sin partida guardada'
  },
  {
    id: 'slot_3',
    label: 'Ranura 3',
    savedAt: '',
    timestamp: 0,
    locationId: 'neighborhood',
    locationName: 'El Barrio Residencial',
    playerPos: { x: 190, y: 310 },
    playerDir: 'down',
    timeOfDay: 'day',
    inGameMinutes: 540,
    dayNumber: 1,
    notebookEntriesCount: 0,
    thoughtsCount: 0,
    saveReason: 'Sin partida guardada'
  },
  {
    id: 'autosave',
    label: 'Autoguardado',
    savedAt: '',
    timestamp: 0,
    locationId: 'neighborhood',
    locationName: 'El Barrio Residencial',
    playerPos: { x: 1170, y: 3380 },
    playerDir: 'down',
    timeOfDay: 'day',
    inGameMinutes: 540,
    dayNumber: 1,
    notebookEntriesCount: 0,
    thoughtsCount: 0,
    saveReason: 'Sin autoguardado reciente'
  }
];

export function getSavedSlots(): SaveSlot[] {
  if (typeof window === 'undefined') return DEFAULT_SLOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SLOTS;
    const parsed = JSON.parse(raw) as SaveSlot[];
    // Ensure all 4 slots exist
    return DEFAULT_SLOTS.map((def) => {
      const found = parsed.find((p) => p.id === def.id);
      return found || def;
    });
  } catch (err) {
    console.error('Error loading save slots:', err);
    return DEFAULT_SLOTS;
  }
}

export function saveGameSlot(
  slotId: string,
  data: {
    locationId: LocationId;
    locationName: string;
    playerPos: Position;
    playerDir: 'down' | 'up' | 'left' | 'right';
    timeOfDay: TimeOfDay;
    inGameMinutes: number;
    dayNumber: number;
    notebookEntriesCount: number;
    thoughtsCount: number;
    saveReason?: string;
  }
): SaveSlot {
  const currentSlots = getSavedSlots();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const slotLabel =
    slotId === 'autosave'
      ? 'Autoguardado'
      : slotId === 'slot_1'
      ? 'Ranura 1'
      : slotId === 'slot_2'
      ? 'Ranura 2'
      : 'Ranura 3';

  const updatedSlot: SaveSlot = {
    id: slotId,
    label: slotLabel,
    savedAt: formattedDate,
    timestamp: now.getTime(),
    locationId: data.locationId,
    locationName: data.locationName,
    playerPos: data.playerPos,
    playerDir: data.playerDir,
    timeOfDay: data.timeOfDay,
    inGameMinutes: data.inGameMinutes,
    dayNumber: data.dayNumber,
    notebookEntriesCount: data.notebookEntriesCount,
    thoughtsCount: data.thoughtsCount,
    saveReason: data.saveReason || 'Guardado manual'
  };

  const newSlots = currentSlots.map((s) => (s.id === slotId ? updatedSlot : s));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots));
  } catch (err) {
    console.error('Error saving slot:', err);
  }

  return updatedSlot;
}

export function clearSaveSlot(slotId: string): SaveSlot[] {
  const currentSlots = getSavedSlots();
  const def = DEFAULT_SLOTS.find((d) => d.id === slotId) || {
    id: slotId,
    label: slotId,
    savedAt: '',
    timestamp: 0,
    locationId: 'neighborhood',
    locationName: 'El Barrio Residencial',
    playerPos: { x: 190, y: 310 },
    playerDir: 'down',
    timeOfDay: 'day',
    inGameMinutes: 540,
    dayNumber: 1,
    notebookEntriesCount: 0,
    thoughtsCount: 0,
    saveReason: 'Sin partida guardada'
  };

  const newSlots = currentSlots.map((s) => (s.id === slotId ? def : s));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlots));
  } catch (err) {
    console.error('Error clearing slot:', err);
  }
  return newSlots;
}

// Time helpers
export function formatInGameClock(minutes: number): {
  timeStr: string;
  period: 'AM' | 'PM';
  hours: number;
  mins: number;
} {
  const normalized = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;

  const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const timeStr = `${hours12.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')} ${period}`;

  return { timeStr, period, hours: hours24, mins };
}

export function getTimeOfDayFromMinutes(minutes: number): TimeOfDay {
  const normalized = ((Math.floor(minutes) % 1440) + 1440) % 1440;

  // 05:00 (300m) to 08:30 (510m) -> Dawn
  if (normalized >= 300 && normalized < 510) {
    return 'dawn';
  }
  // 08:30 (510m) to 17:30 (1050m) -> Day
  if (normalized >= 510 && normalized < 1050) {
    return 'day';
  }
  // 17:30 (1050m) to 20:45 (1245m) -> Sunset
  if (normalized >= 1050 && normalized < 1245) {
    return 'sunset';
  }
  // 20:45 to 05:00 -> Night
  return 'night';
}

export const getDayPhaseFromMinutes = getTimeOfDayFromMinutes;

export function getMinutesForTimeOfDay(timeOfDay: TimeOfDay): number {
  switch (timeOfDay) {
    case 'dawn':
      return 390; // 06:30 AM
    case 'day':
      return 600; // 10:00 AM
    case 'sunset':
      return 1140; // 07:00 PM
    case 'night':
      return 1320; // 10:00 PM
  }
}

export interface ActiveSessionData {
  locationId: LocationId;
  playerPos: Position;
  playerDir: 'down' | 'up' | 'left' | 'right';
  timeOfDay: TimeOfDay;
  inGameMinutes: number;
  dayNumber: number;
}

const ACTIVE_SESSION_KEY = 'peanuts_active_session_v4';

export function getActiveSession(): ActiveSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.locationId === 'string' &&
      parsed.playerPos &&
      typeof parsed.playerPos.x === 'number' &&
      typeof parsed.playerPos.y === 'number'
    ) {
      return parsed as ActiveSessionData;
    }
  } catch (e) {
    console.warn('Failed to parse active session:', e);
  }
  return null;
}

export function saveActiveSession(data: ActiveSessionData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save active session:', e);
  }
}

