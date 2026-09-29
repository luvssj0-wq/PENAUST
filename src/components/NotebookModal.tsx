import React, { useState, useEffect } from 'react';
import { NotebookEntry, NotebookCategory } from '../types';
import { sound } from '../utils/audio';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  X,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName: string;
  initialThought?: string;
}

const CATEGORIES: NotebookCategory[] = [
  'Poemas',
  'Cuentos',
  'Cartas',
  'Diarios',
  'Pensamientos',
  'Capítulos',
  'Textos Libres'
];

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  currentLocationName,
  initialThought
}) => {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<NotebookCategory>('Pensamientos');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Load entries from localStorage - ensure no pre-written poems exist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('peanuts_ari_notebook_entries');
      if (stored) {
        const parsed: NotebookEntry[] = JSON.parse(stored);
        // Filter out any default sample poems or pre-written poems to ensure the notebook is completely user-driven and clean
        const userOnlyEntries = parsed.filter(
          (e) =>
            !e.id.startsWith('entry_default_') &&
            e.category !== 'Poemas' &&
            !e.title.toLowerCase().includes('poema')
        );
        setEntries(userOnlyEntries);
        if (userOnlyEntries.length > 0 && !selectedEntryId) {
          setSelectedEntryId(userOnlyEntries[0].id);
        } else if (userOnlyEntries.length === 0) {
          setSelectedEntryId(null);
        }
        localStorage.setItem('peanuts_ari_notebook_entries', JSON.stringify(userOnlyEntries));
      } else {
        // Start completely empty as requested
        setEntries([]);
        setSelectedEntryId(null);
      }
    } catch (e) {
      console.error('Error loading notebook entries:', e);
    }
  }, []);

  // Handle initial thought injection if opened from "Escribir sobre esto"
  useEffect(() => {
    if (initialThought && isOpen) {
      const newEntry: NotebookEntry = {
        id: 'entry_' + Date.now(),
        title: 'Reflexión al pie del muro',
        category: 'Pensamientos',
        pages: [`"${initialThought}"\n\n- Escribo esto mientras el sol dora las hojas del barrio.\n`],
        updatedAt: new Date().toLocaleDateString('es-ES'),
        locationCreated: currentLocationName
      };
      setEntries((prev) => [newEntry, ...prev]);
      setSelectedEntryId(newEntry.id);
      setCurrentPageIndex(0);
      showSavedFeedback('¡Pensamiento añadido al cuaderno!');
    }
  }, [initialThought, isOpen]);

  const currentEntry = entries.find((e) => e.id === selectedEntryId);

  const saveEntriesToStorage = (updated: NotebookEntry[]) => {
    setEntries(updated);
    try {
      localStorage.setItem('peanuts_ari_notebook_entries', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving notebook:', e);
    }
  };

  const showSavedFeedback = (msg = 'Guardado') => {
    setSavedToast(msg);
    sound.playTypewriterClick();
    setTimeout(() => setSavedToast(null), 2400);
  };

  const handleCreateNewEntry = () => {
    const newEntry: NotebookEntry = {
      id: 'entry_' + Date.now(),
      title: 'Nuevo escrito en ' + currentLocationName,
      category: selectedCategory,
      pages: [''],
      updatedAt: new Date().toLocaleDateString('es-ES'),
      locationCreated: currentLocationName
    };
    const updated = [newEntry, ...entries];
    saveEntriesToStorage(updated);
    setSelectedEntryId(newEntry.id);
    setCurrentPageIndex(0);
    sound.playInspireChime();
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar esta página del cuaderno?')) return;
    const updated = entries.filter((item) => item.id !== id);
    saveEntriesToStorage(updated);
    if (selectedEntryId === id) {
      setSelectedEntryId(updated.length > 0 ? updated[0].id : null);
      setCurrentPageIndex(0);
    }
  };

  const handleUpdatePageText = (text: string) => {
    if (!currentEntry) return;
    sound.playTypewriterClick();
    const updatedPages = [...currentEntry.pages];
    updatedPages[currentPageIndex] = text;
    const updated = entries.map((entry) =>
      entry.id === currentEntry.id
        ? {
            ...entry,
            pages: updatedPages,
            updatedAt: new Date().toLocaleDateString('es-ES')
          }
        : entry
    );
    saveEntriesToStorage(updated);
  };

  const handleUpdateTitle = (title: string) => {
    if (!currentEntry) return;
    const updated = entries.map((entry) =>
      entry.id === currentEntry.id
        ? { ...entry, title, updatedAt: new Date().toLocaleDateString('es-ES') }
        : entry
    );
    saveEntriesToStorage(updated);
  };

  const handleUpdateCategory = (category: NotebookCategory) => {
    if (!currentEntry) return;
    const updated = entries.map((entry) =>
      entry.id === currentEntry.id ? { ...entry, category } : entry
    );
    saveEntriesToStorage(updated);
  };

  const handleAddPage = () => {
    if (!currentEntry) return;
    const updatedPages = [...currentEntry.pages, ''];
    const updated = entries.map((entry) =>
      entry.id === currentEntry.id ? { ...entry, pages: updatedPages } : entry
    );
    saveEntriesToStorage(updated);
    setCurrentPageIndex(updatedPages.length - 1);
    sound.playDoor();
    showSavedFeedback('¡Nueva página creada!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] max-h-[760px] bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-900/30 flex flex-col overflow-hidden text-stone-800">
        {/* Top Minimalist Header */}
        <div className="bg-amber-100/90 border-b border-amber-200/80 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center font-bold shadow-sm shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-amber-950 font-['Caveat',cursive] leading-tight flex items-center gap-1.5 truncate">
                Cuaderno de Ari
                <span className="text-[10px] sm:text-xs font-sans font-normal text-amber-800/70 bg-amber-200/60 px-1.5 py-0.5 rounded-full truncate hidden xs:inline-block">
                  {currentLocationName}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {savedToast && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full animate-in fade-in flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {savedToast}
              </span>
            )}
            <button
              onClick={() => showSavedFeedback('Escrito guardado con éxito')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-amber-50 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Guardar</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition active:scale-95"
              title="Cerrar cuaderno"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Content Layout: Left list + Right sheet (Real Page Margins) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Entries & Categories */}
          <div className="w-full md:w-64 bg-amber-100/40 border-r border-amber-200/80 p-3 flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900/70">
                Tus Escritos ({entries.length})
              </span>
              <button
                onClick={handleCreateNewEntry}
                className="text-xs px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-md font-bold flex items-center gap-1 shadow-xs transition active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Nuevo</span>
              </button>
            </div>

            {/* Entries list */}
            <div className="flex-1 space-y-1.5 pr-1 overflow-y-auto max-h-48 md:max-h-full">
              {entries.map((entry) => {
                const isSelected = entry.id === selectedEntryId;
                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntryId(entry.id);
                      setCurrentPageIndex(0);
                      sound.playTypewriterClick();
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition border text-left flex items-start justify-between group ${
                      isSelected
                        ? 'bg-amber-200/80 border-amber-400 shadow-sm'
                        : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-950 truncate font-['Lora',serif]">
                        {entry.title || 'Sin título'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-amber-800/80">
                        <span className="font-semibold px-1.5 py-0.2 bg-amber-300/60 rounded">
                          {entry.category}
                        </span>
                        <span>•</span>
                        <span>{entry.pages.length} pág.</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-700 text-amber-700/60 rounded transition ml-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: The Notebook Page (Point 23-25: Margins, Real Page numbers, Keyboard) */}
          {currentEntry ? (
            <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden relative">
              {/* Paper metadata bar */}
              <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <input
                  type="text"
                  value={currentEntry.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="flex-1 min-w-[200px] font-bold text-amber-950 font-['Lora',serif] bg-transparent border-b border-dashed border-amber-400/80 focus:border-amber-700 focus:outline-none px-1 text-sm sm:text-base"
                  placeholder="Título del escrito..."
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">Categoría:</span>
                  <select
                    value={currentEntry.category}
                    onChange={(e) => handleUpdateCategory(e.target.value as NotebookCategory)}
                    className="bg-amber-100/90 text-amber-900 border border-amber-300 text-xs rounded-md px-2 py-1 font-semibold focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* The Paper Sheet with strictly respected Margins (Point 23: margin superior, inferior, izquierdo, derecho) */}
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col justify-start items-center bg-[#FBF8EF]">
                <div className="w-full max-w-3xl min-h-[380px] flex-1 bg-white shadow-md border border-amber-200/80 rounded-lg p-6 sm:p-10 relative flex flex-col">
                  {/* Decorative faint notebook lines or subtle margin line */}
                  <div className="absolute top-0 bottom-0 left-10 sm:left-14 w-[1px] bg-rose-200/70 pointer-events-none" />

                  {/* Real Page Number Indicator (Point 24) */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-100 pb-2 mb-4 font-['Nunito',sans-serif]">
                    <span className="flex items-center gap-1 text-amber-900/60 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      Página {currentPageIndex + 1} de {currentEntry.pages.length}
                    </span>
                    <span className="flex items-center gap-1 text-stone-400">
                      <Clock className="w-3 h-3" />
                      {currentEntry.updatedAt}
                    </span>
                  </div>

                  {/* Textarea: Full keyboard support (all letters, ñ, tildes, punctuation, line breaks) */}
                  <textarea
                    value={currentEntry.pages[currentPageIndex] || ''}
                    onChange={(e) => handleUpdatePageText(e.target.value)}
                    placeholder="Comienza a escribir aquí... Las ideas se asoman cuando dejas que el lápiz toque la hoja."
                    className="w-full flex-1 resize-none bg-transparent text-stone-800 text-base sm:text-lg font-['Lora',serif] leading-relaxed focus:outline-none placeholder:text-stone-300 pl-4 sm:pl-6"
                    style={{ minHeight: '260px' }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Pagination bar (Point 24: Página 1, Página 2... con botones previo/siguiente y añadir) */}
              <div className="bg-amber-100/80 border-t border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPageIndex === 0}
                    onClick={() => {
                      setCurrentPageIndex((prev) => Math.max(0, prev - 1));
                      sound.playDoor();
                    }}
                    className="p-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 disabled:opacity-40 text-amber-900 font-bold transition"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {currentEntry.pages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentPageIndex(idx);
                          sound.playTypewriterClick();
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold text-xs transition ${
                          idx === currentPageIndex
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'bg-amber-200/70 text-amber-900 hover:bg-amber-300/80'
                        }`}
                      >
                        Pág. {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPageIndex >= currentEntry.pages.length - 1}
                    onClick={() => {
                      setCurrentPageIndex((prev) =>
                        Math.min(currentEntry.pages.length - 1, prev + 1)
                      );
                      sound.playDoor();
                    }}
                    className="p-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 disabled:opacity-40 text-amber-900 font-bold transition"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddPage}
                  className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg transition flex items-center gap-1 shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Página ({currentEntry.pages.length + 1})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FBF8EF]">
              <div className="w-20 h-20 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center mb-4 shadow-inner">
                <BookOpen className="w-10 h-10 text-amber-700/80" />
              </div>
              <h3 className="text-lg font-bold text-amber-950 font-['Lora',serif] mb-1">
                Cuaderno limpio y listo
              </h3>
              <p className="text-xs max-w-sm text-stone-600 mb-5 font-['Nunito',sans-serif]">
                El cuaderno está completamente vacío para que Ari y tú escriban sus propias historias, notas y reflexiones del barrio.
              </p>
              <button
                onClick={handleCreateNewEntry}
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Escribir primera página</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
