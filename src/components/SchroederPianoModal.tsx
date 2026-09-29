import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Music, Play, X, Heart } from 'lucide-react';

interface SchroederPianoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PianoKey {
  note: string;
  label: string;
  freq: number;
  isBlack?: boolean;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C4', label: 'Do', freq: 261.63 },
  { note: 'C#4', label: 'Do#', freq: 277.18, isBlack: true },
  { note: 'D4', label: 'Re', freq: 293.66 },
  { note: 'D#4', label: 'Re#', freq: 311.13, isBlack: true },
  { note: 'E4', label: 'Mi', freq: 329.63 },
  { note: 'F4', label: 'Fa', freq: 349.23 },
  { note: 'F#4', label: 'Fa#', freq: 369.99, isBlack: true },
  { note: 'G4', label: 'Sol', freq: 392.00 },
  { note: 'G#4', label: 'Sol#', freq: 415.30, isBlack: true },
  { note: 'A4', label: 'La', freq: 440.00 },
  { note: 'A#4', label: 'La#', freq: 466.16, isBlack: true },
  { note: 'B4', label: 'Si', freq: 493.88 },
  { note: 'C5', label: 'Do', freq: 523.25 },
  { note: 'D5', label: 'Re', freq: 587.33 },
  { note: 'E5', label: 'Mi', freq: 659.25 }
];

export const SchroederPianoModal: React.FC<SchroederPianoModalProps> = ({
  isOpen,
  onClose
}) => {
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [playingJingle, setPlayingJingle] = useState(false);

  if (!isOpen) return null;

  const handlePlayKey = (k: PianoKey) => {
    sound.playPianoNote(k.freq, 0.7);
    setLastNote(k.note);
    setTimeout(() => setLastNote(null), 300);
  };

  const handlePlayPeanutsTheme = () => {
    setPlayingJingle(true);
    sound.playPeanutsJingle();
    setTimeout(() => setPlayingJingle(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-2xl bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-950/40 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#B91C1C] text-white px-3 py-2.5 sm:p-4 border-b-4 border-amber-950/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl shrink-0">🎹</span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold font-['Caveat',cursive] truncate">
                Piano de Schroeder
              </h3>
              <p className="text-[10px] sm:text-xs text-red-200 truncate hidden xs:block">
                Dedicado a Ludwig van Beethoven
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-stone-950/80 hover:bg-stone-900 active:bg-stone-950 text-white rounded-xl border border-white/30 shadow-md text-xs font-black flex items-center gap-1.5 transition active:scale-95"
            title="Salir del piano"
          >
            <X className="w-4 h-4 text-red-300" />
            <span>Salir</span>
          </button>
        </div>

        {/* Interior piano stage */}
        <div className="p-6 text-stone-800 flex flex-col items-center text-center space-y-4">
          {/* Atmosphere text */}
          <div className="flex items-center justify-between w-full px-2 text-xs">
            <span className="flex items-center gap-1.5 text-red-900 font-semibold">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              Lucy está apoyada en el piano sonriendo
            </span>
            <button
              onClick={handlePlayPeanutsTheme}
              disabled={playingJingle}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{playingJingle ? 'Sonando...' : 'Tema de Peanuts (Guaraldi)'}</span>
            </button>
          </div>

          {/* Realistic Toy Piano Keyboard */}
          <div className="w-full bg-red-800 p-4 sm:p-6 rounded-2xl shadow-xl border-4 border-amber-950/50 flex flex-col items-center">
            <div className="mb-2 text-[11px] font-bold tracking-widest text-amber-100 uppercase">
              BEETHOVEN SPECIAL EDITION
            </div>

            {/* Keys strip */}
            <div className="flex justify-center items-start relative select-none overflow-x-auto py-2">
              {PIANO_KEYS.map((k) => {
                const isPressed = lastNote === k.note;
                if (k.isBlack) {
                  return (
                    <button
                      key={k.note}
                      onClick={() => handlePlayKey(k)}
                      className={`w-6 sm:w-8 h-20 sm:h-24 bg-stone-900 text-white rounded-b-md -mx-3 sm:-mx-4 z-10 border-x border-b border-black shadow-md transition-all active:bg-stone-700 flex flex-col justify-end pb-1 text-[9px] font-bold ${
                        isPressed ? 'bg-amber-600' : ''
                      }`}
                    >
                      <span className="opacity-70">{k.note}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={k.note}
                    onClick={() => handlePlayKey(k)}
                    className={`w-9 sm:w-12 h-32 sm:h-40 bg-white text-stone-700 rounded-b-lg border border-stone-300 shadow-sm transition-all hover:bg-amber-50 active:bg-amber-200 flex flex-col justify-end pb-2 items-center text-xs font-bold ${
                      isPressed ? 'bg-amber-300' : ''
                    }`}
                  >
                    <span className="text-[10px] text-stone-400">{k.label}</span>
                    <span>{k.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-stone-500 italic max-w-md">
            "Las teclas negras están pintadas, pero cuando el corazón tiene música, las notas
            suenan directas al alma." — Schroeder
          </p>

          <div>
            <button
              onClick={onClose}
              className="text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Cerrar y levantarse del taburete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
