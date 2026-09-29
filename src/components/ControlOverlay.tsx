import React from 'react';
import { TimeOfDay } from '../types';
import { sound } from '../utils/audio';
import { CircularJoystick } from './CircularJoystick';
import {
  BookOpen,
  Map,
  Volume2,
  VolumeX,
  Save,
  DoorOpen,
  Sparkles
} from 'lucide-react';

interface ControlOverlayProps {
  locationName: string;
  isInterior?: boolean;
  onExitLocation?: () => void;
  timeOfDay?: TimeOfDay;
  inGameClockStr?: string;
  dayNumber?: number;
  timeSpeed?: 'paused' | 'normal' | 'fast';
  onCycleTimeOfDay?: () => void;
  onToggleTimeSpeed?: () => void;
  onOpenSaveLoad: (mode?: 'save' | 'load') => void;
  onOpenNotebook: () => void;
  onOpenMap: () => void;
  onOpenAiConfig: () => void;
  hasAiKey?: boolean;
  onActionA: () => void;
  onActionB: () => void;
  promptA?: string;
  promptB?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onMoveDirection: (dir: 'up' | 'down' | 'left' | 'right' | null) => void;
  onJoystickVector?: (vector: { x: number; y: number } | null) => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  locationName,
  isInterior = false,
  onExitLocation,
  onOpenSaveLoad,
  onOpenNotebook,
  onOpenMap,
  onOpenAiConfig,
  hasAiKey = false,
  onActionA,
  onActionB,
  promptA,
  promptB,
  isMuted,
  onToggleMute,
  onMoveDirection,
  onJoystickVector
}) => {
  return (
    <>
      {/* TOP STATUS & SHORTCUTS BAR - MOBILE-ORGANIZED */}
      <header className="fixed top-[max(0.5rem,env(safe-area-inset-top))] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] z-30 flex items-center justify-between pointer-events-none gap-1.5 sm:gap-2">
        {/* Location Name badge with quick Exit button if inside */}
        <div className="flex items-center gap-1.5 pointer-events-auto min-w-0">
          <div className="bg-amber-50/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-stone-900/40 shadow-[2px_2px_0px_rgba(0,0,0,0.18)] flex items-center min-w-0">
            <span className="text-xs sm:text-sm font-black text-stone-900 font-['Lora',serif] tracking-wide truncate max-w-[120px] sm:max-w-[200px]">
              {locationName}
            </span>
          </div>

          {/* Prominent Quick Exit Button when inside an interior or sub-area */}
          {isInterior && (
            <button
              onClick={() => {
                if (onExitLocation) onExitLocation();
                else onActionA();
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-2xl border-2 border-rose-900/50 shadow-lg font-black text-xs flex items-center gap-1.5 transition active:scale-95 animate-in fade-in shrink-0"
              title="Salir al exterior"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          )}
        </div>

        {/* Action icons bar - Space-conscious on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* AI Settings [Certainty Companion / Lucia AI] */}
          <button
            onClick={() => {
              sound.playTypewriterClick();
              onOpenAiConfig();
            }}
            className={`p-2 sm:px-3 sm:py-1.5 backdrop-blur-md rounded-xl border-2 shadow-md font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              hasAiKey
                ? 'bg-amber-300/95 hover:bg-amber-400 text-stone-950 border-amber-900/60 ring-2 ring-amber-500/40'
                : 'bg-amber-100/95 hover:bg-amber-200 text-stone-900 border-stone-900/30'
            }`}
            title="Configuración de IA (Certainty Companion / Lucia AI)"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span className="hidden sm:inline font-black text-stone-950">IA</span>
            {hasAiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" title="API Key conectada" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-stone-400" title="Configurar API Key" />
            )}
          </button>

          {/* Save & Load Game [G] */}
          <button
            onClick={() => {
              sound.playTypewriterClick();
              onOpenSaveLoad();
            }}
            className="p-2 sm:px-3 sm:py-1.5 bg-amber-100/95 hover:bg-amber-200 backdrop-blur-md text-stone-900 rounded-xl border-2 border-stone-900/30 shadow-md font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Guardar / Cargar Partida [G]"
          >
            <Save className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">Guardar</span>
          </button>

          {/* Open Ari's Notebook */}
          <button
            onClick={() => {
              sound.playTypewriterClick();
              onOpenNotebook();
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-amber-100/95 hover:bg-amber-200 backdrop-blur-md text-stone-900 rounded-xl border-2 border-amber-900/40 shadow-md font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 ring-2 ring-amber-400/50"
            title="Cuaderno de Ari [N]"
          >
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span className="font-black text-amber-950 text-xs">Cuaderno</span>
          </button>

          {/* Open World Map */}
          <button
            onClick={() => {
              sound.playDoor();
              onOpenMap();
            }}
            className="p-2 sm:px-3 sm:py-1.5 bg-amber-100/95 hover:bg-amber-200 backdrop-blur-md text-stone-900 rounded-xl border-2 border-stone-900/30 shadow-md font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Abrir Mapa del Barrio [M]"
          >
            <Map className="w-4 h-4 text-amber-800" />
            <span className="hidden md:inline">Mapa</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-amber-100/95 hover:bg-amber-200 backdrop-blur-md text-stone-900 rounded-xl border-2 border-stone-900/30 shadow-md transition active:scale-95"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-700" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-800" />
            )}
          </button>
        </div>
      </header>

      {/* FLOATING ACTION PROMPTS (When standing near a trigger or character) */}
      {(promptA || promptB) && (
        <div className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 animate-in zoom-in-90 duration-150">
          {promptA && (
            <div className="bg-amber-950/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500/50 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-tight">
                E / Espacio
              </span>
              <span>{promptA.replace(/^[AB]\s*-\s*/, '')}</span>
            </div>
          )}
          {promptB && (
            <div className="bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg border border-rose-500/50 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black uppercase tracking-tight">
                B / Q
              </span>
              <span>{promptB.replace(/^[AB]\s*-\s*/, '')}</span>
            </div>
          )}
        </div>
      )}

      {/* MOBILE TOUCH CONTROLS (CIRCULAR JOYSTICK + A/B BUTTONS) */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 flex items-end justify-between pointer-events-none">
        {/* Circular Virtual Joystick */}
        <div className="pointer-events-auto">
          <CircularJoystick
            onMoveDirection={onMoveDirection}
            onVectorChange={onJoystickVector}
            size={126}
          />
        </div>

        {/* Action Buttons A & B */}
        <div className="pointer-events-auto flex items-end gap-2.5 sm:gap-3">
          {/* Action Button B (Sit, Sleep, Piano, Write, Special) */}
          <button
            onClick={onActionB}
            className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full font-black text-base sm:text-xl shadow-xl flex flex-col items-center justify-center active:scale-90 transition select-none touch-none ${
              promptB
                ? 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white border-4 border-rose-900/60 ring-4 ring-rose-400/40 animate-pulse'
                : 'bg-rose-800/80 hover:bg-rose-700 active:bg-rose-900 text-rose-100 border-4 border-rose-950/60'
            }`}
            title="Botón B [B, Q o Shift] - Acción Especial (Sentarse, Escribir, Tocar Piano, Dormir)"
          >
            <span>B</span>
            <span className="text-[7.5px] sm:text-[8px] opacity-90 uppercase tracking-tighter">
              {promptB ? 'Especial' : 'B'}
            </span>
          </button>

          {/* Action Button A (Talk, Enter, Interact, Examine) */}
          <div className="flex flex-col items-end gap-2">
            {isInterior && (
              <button
                onClick={() => {
                  if (onExitLocation) onExitLocation();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-2xl shadow-xl border-2 border-rose-300 font-black text-xs flex items-center gap-1.5 active:scale-95 transition touch-none"
                title="Salir al Vecindario"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Salir afuera</span>
              </button>
            )}

            <button
              onClick={onActionA}
              className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full font-black text-base sm:text-xl shadow-xl flex flex-col items-center justify-center active:scale-90 transition select-none touch-none ${
                promptA
                  ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 border-4 border-amber-900/60 ring-4 ring-amber-300/40 animate-pulse'
                  : 'bg-amber-500 active:bg-amber-600 text-stone-950 border-4 border-amber-900/40'
              }`}
              title="Botón A [E, Espacio o Enter] - Interactuar / Hablar / Examinar"
            >
              <span>A</span>
              <span className="text-[7.5px] sm:text-[8px] opacity-90 uppercase tracking-tighter">
                Acción
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
