import React, { useState, useEffect } from 'react';
import {
  Save,
  UploadCloud,
  Trash2,
  X,
  Clock,
  MapPin,
  BookOpen,
  Sparkles,
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SaveSlot, LocationId, Position, TimeOfDay } from '../types';
import {
  getSavedSlots,
  saveGameSlot,
  clearSaveSlot,
  formatInGameClock
} from '../utils/saveManager';
import { sound } from '../utils/audio';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  currentLocationId: LocationId;
  currentLocationName: string;
  playerPos: Position;
  playerDir: 'down' | 'up' | 'left' | 'right';
  timeOfDay: TimeOfDay;
  inGameMinutes: number;
  dayNumber: number;
  notebookEntriesCount: number;
  thoughtsCount: number;
  saveReason?: string;
  onLoadSave: (slot: SaveSlot) => void;
  onSaveSuccess: (slot: SaveSlot) => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  currentLocationId,
  currentLocationName,
  playerPos,
  playerDir,
  timeOfDay,
  inGameMinutes,
  dayNumber,
  notebookEntriesCount,
  thoughtsCount,
  saveReason,
  onLoadSave,
  onSaveSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>(initialMode);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot_1');
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'overwrite' | 'load' | 'delete';
    slot: SaveSlot;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSlots(getSavedSlots());
      setActiveTab(initialMode);
      setConfirmDialog(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSaveToSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot && slot.timestamp > 0) {
      // Prompt overwrite
      setConfirmDialog({ type: 'overwrite', slot });
    } else {
      executeSave(slotId);
    }
  };

  const executeSave = (slotId: string) => {
    const saved = saveGameSlot(slotId, {
      locationId: currentLocationId,
      locationName: currentLocationName,
      playerPos,
      playerDir,
      timeOfDay,
      inGameMinutes,
      dayNumber,
      notebookEntriesCount,
      thoughtsCount,
      saveReason: saveReason || 'Guardado desde el menú del juego'
    });
    setSlots(getSavedSlots());
    setConfirmDialog(null);
    sound.playSaveGame();
    onSaveSuccess(saved);
  };

  const handleLoadSlot = (slot: SaveSlot) => {
    if (!slot.timestamp) return;
    setConfirmDialog({ type: 'load', slot });
  };

  const executeLoad = (slot: SaveSlot) => {
    sound.playLoadGame();
    onLoadSave(slot);
    setConfirmDialog(null);
    onClose();
  };

  const handleDeleteSlot = (slot: SaveSlot) => {
    if (!slot.timestamp) return;
    setConfirmDialog({ type: 'delete', slot });
  };

  const executeDelete = (slotId: string) => {
    const updated = clearSaveSlot(slotId);
    setSlots(updated);
    setConfirmDialog(null);
  };

  const getTimeIcon = (tod: TimeOfDay) => {
    switch (tod) {
      case 'dawn':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'day':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'sunset':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getTimeLabel = (tod: TimeOfDay) => {
    switch (tod) {
      case 'dawn':
        return 'Amanecer';
      case 'day':
        return 'Día Soleado';
      case 'sunset':
        return 'Atardecer';
      case 'night':
        return 'Noche Estrellada';
    }
  };

  return (
    <div
      id="save-load-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-900/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="save-load-modal-container"
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-amber-50 border-4 border-stone-900 rounded-3xl shadow-[8px_8px_0px_#1c1917] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-400 border-b-4 border-stone-900 px-3 py-2.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-lg sm:text-xl shadow-[2px_2px_0px_rgba(0,0,0,0.3)] shrink-0">
              <Save className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-stone-900 text-base sm:text-xl tracking-tight truncate">
                Guardar / Cargar Partida
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-stone-800 truncate hidden xs:block">
                Guarda tu viaje con Ari o retoma tus aventuras en el barrio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4 text-amber-300" />
            <span>Salir</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-stone-300 bg-amber-100/70 px-4 pt-3 gap-2">
          <button
            id="tab-save-btn"
            onClick={() => {
              setActiveTab('save');
              setConfirmDialog(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-black text-sm tracking-wide transition-all border-t-2 border-x-2 ${
              activeTab === 'save'
                ? 'bg-amber-50 border-stone-900 text-stone-900 -mb-[2px] shadow-[0_-2px_0px_#1c1917]'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-amber-200/50'
            }`}
          >
            <Save className="w-4 h-4 text-emerald-600" />
            Guardar Partida
          </button>
          <button
            id="tab-load-btn"
            onClick={() => {
              setActiveTab('load');
              setConfirmDialog(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-black text-sm tracking-wide transition-all border-t-2 border-x-2 ${
              activeTab === 'load'
                ? 'bg-amber-50 border-stone-900 text-stone-900 -mb-[2px] shadow-[0_-2px_0px_#1c1917]'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-amber-200/50'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-sky-600" />
            Cargar Partida
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Active status bar */}
          <div className="bg-amber-100/90 border-2 border-stone-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-stone-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-black text-stone-900 uppercase tracking-wider text-[11px] bg-amber-300 px-2 py-0.5 rounded-md border border-stone-900">
                Estado Actual
              </span>
              <span className="font-bold text-stone-900">{currentLocationName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-stone-600" />
                Día {dayNumber}
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                {formatInGameClock(inGameMinutes).timeStr}
              </div>
              <div className="flex items-center gap-1 font-bold">
                {getTimeIcon(timeOfDay)}
                <span>{getTimeLabel(timeOfDay)}</span>
              </div>
            </div>
          </div>

          {/* Slots List */}
          <div className="grid grid-cols-1 gap-3.5">
            {slots.map((slot) => {
              const isOccupied = slot.timestamp > 0;
              const isSelected = selectedSlotId === slot.id;
              const clockInfo = formatInGameClock(slot.inGameMinutes || 540);

              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`group relative p-4 rounded-2xl border-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 bg-white shadow-[4px_4px_0px_#1c1917]'
                      : 'border-stone-300 bg-amber-50/80 hover:border-stone-600 hover:bg-white/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                          slot.id === 'autosave'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : isOccupied
                            ? 'bg-amber-200 text-stone-900 border-stone-800'
                            : 'bg-stone-200 text-stone-600 border-stone-300'
                        }`}
                      >
                        {slot.label}
                      </span>
                      {isOccupied ? (
                        <span className="text-xs font-semibold text-stone-500">
                          {slot.savedAt}
                        </span>
                      ) : (
                        <span className="text-xs italic text-stone-400 font-medium">
                          Ranura vacía
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {activeTab === 'save' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveToSlot(slot.id);
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] active:translate-y-0.5 transition-transform"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isOccupied ? 'Sobrescribir' : 'Guardar aquí'}
                        </button>
                      )}

                      {activeTab === 'load' && isOccupied && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadSlot(slot);
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] active:translate-y-0.5 transition-transform"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          Cargar
                        </button>
                      )}

                      {isOccupied && slot.id !== 'autosave' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlot(slot);
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar partida de esta ranura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot Details preview */}
                  {isOccupied ? (
                    <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="font-bold truncate">{slot.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold">Día {slot.dayNumber || 1}</span>
                        <span className="text-stone-500 font-medium">· {clockInfo.timeStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        {getTimeIcon(slot.timeOfDay)}
                        <span className="font-medium text-stone-600">
                          {getTimeLabel(slot.timeOfDay)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-bold">{slot.notebookEntriesCount || 0}</span>
                        <span className="text-stone-500 font-medium">notas</span>
                      </div>
                      {slot.saveReason && (
                        <div className="col-span-2 sm:col-span-4 mt-1 text-[11px] text-stone-500 italic bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200">
                          📌 {slot.saveReason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-3 text-xs text-stone-400 italic">
                      Disponible para registrar tus pasos, poemas y descubrimientos con Ari.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-amber-100/90 border-t-2 border-stone-300 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-stone-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              💡 Puedes guardar en cualquier momento usando esta ventana (tecla <strong>G</strong>) o en los buzones y camas.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-800 transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmDialog && (
          <div className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-4 border-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-[6px_6px_0px_#1c1917] space-y-4 text-center animate-scale-up">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border-2 border-stone-900 flex items-center justify-center text-amber-600">
                {confirmDialog.type === 'delete' ? (
                  <Trash2 className="w-6 h-6 text-red-600" />
                ) : confirmDialog.type === 'load' ? (
                  <UploadCloud className="w-6 h-6 text-sky-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                )}
              </div>

              <h3 className="font-black text-stone-900 text-lg">
                {confirmDialog.type === 'overwrite' && '¿Sobrescribir partida?'}
                {confirmDialog.type === 'load' && '¿Cargar esta partida?'}
                {confirmDialog.type === 'delete' && '¿Eliminar partida?'}
              </h3>

              <p className="text-xs text-stone-600">
                {confirmDialog.type === 'overwrite' && (
                  <>
                    La ranura <strong>{confirmDialog.slot.label}</strong> ya contiene una partida guardada del {confirmDialog.slot.savedAt}. ¿Deseas reemplazarla?
                  </>
                )}
                {confirmDialog.type === 'load' && (
                  <>
                    Se restaurará tu posición en <strong>{confirmDialog.slot.locationName}</strong>, Día {confirmDialog.slot.dayNumber}. ¿Deseas continuar?
                  </>
                )}
                {confirmDialog.type === 'delete' && (
                  <>
                    ¿Estás segura de eliminar los datos de <strong>{confirmDialog.slot.label}</strong>? Esta acción no se puede deshacer.
                  </>
                )}
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                {confirmDialog.type === 'overwrite' && (
                  <button
                    onClick={() => executeSave(confirmDialog.slot.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] transition-all"
                  >
                    Sí, sobrescribir
                  </button>
                )}

                {confirmDialog.type === 'load' && (
                  <button
                    onClick={() => executeLoad(confirmDialog.slot)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] transition-all"
                  >
                    Sí, cargar ahora
                  </button>
                )}

                {confirmDialog.type === 'delete' && (
                  <button
                    onClick={() => executeDelete(confirmDialog.slot.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#1c1917] transition-all"
                  >
                    Sí, eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
