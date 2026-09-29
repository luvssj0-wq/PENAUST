import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { X, BookOpen, Feather, Trash2, Plus, Sparkles, Check, Bookmark } from 'lucide-react';

export interface WrittenNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  formattedDate: string;
  mood?: string;
}

interface WritingNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote?: (note: WrittenNote) => void;
}

const STORAGE_KEY = 'peanuts_ari_writing_notebook';

export const WritingNotebookModal: React.FC<WritingNotebookModalProps> = ({
  isOpen,
  onClose,
  onSaveNote
}) => {
  const [notes, setNotes] = useState<WrittenNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'note_1',
        title: 'Tarde tranquila en el porche',
        content: 'El viento mueve suavemente las hojas del árbol grande del patio trasero. Charlie Brown pasó con su cometa y Snoopy estaba dormitando arriba de la caseta. Hay días en los que simplemente observar cómo cae la luz de la tarde alcanza para encontrar serenidad.',
        createdAt: Date.now() - 86400000,
        formattedDate: 'Ayer por la tarde',
        mood: 'paz'
      },
      {
        id: 'note_2',
        title: 'Conversación en el muro con Linus',
        content: 'Linus me decía que la manta no es una debilidad, sino una forma de cuidar las pequeñas certezas que nos quedan. Me quedé pensando en eso mientras caminaba de vuelta a casa.',
        createdAt: Date.now() - 172800000,
        formattedDate: 'Hace dos días',
        mood: 'reflexión'
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNew = () => {
    sound.playTypewriterClick();
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newNote: WrittenNote = {
      id: `note_${Date.now()}`,
      title: 'Nueva página en blanco',
      content: '',
      createdAt: Date.now(),
      formattedDate: dateStr,
      mood: 'calma'
    };

    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent('');
    setIsEditing(true);
  };

  const handleStartEdit = () => {
    if (!activeNote) return;
    setEditTitle(activeNote.title);
    setEditContent(activeNote.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!activeNote) return;
    sound.playInspireChime();
    const updated: WrittenNote = {
      ...activeNote,
      title: editTitle.trim() || 'Nota sin título',
      content: editContent
    };

    const nextList = notes.map((n) => (n.id === updated.id ? updated : n));
    setNotes(nextList);
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);

    if (onSaveNote) {
      onSaveNote(updated);
    }
  };

  const handleDelete = (id: string) => {
    sound.playFootstep('wood');
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0]?.id || null);
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="writing-notebook-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-amber-50/98 rounded-3xl border-4 border-amber-950/80 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Notebook Top Spine */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 px-5 py-3 flex items-center justify-between text-amber-100 border-b-2 border-amber-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <Feather className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-black font-['Caveat',cursive] text-lg sm:text-xl text-amber-100 flex items-center gap-2">
                Cuaderno Personal de Ari
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-amber-200/20 text-amber-300 rounded-full border border-amber-400/40">
                  {notes.length} {notes.length === 1 ? 'página guardada' : 'páginas guardadas'}
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/80">
                Tu rincón silencioso junto a la ventana para escribir y reflexionar sin prisa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Escribir nueva página</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-amber-800/80 transition"
              title="Cerrar cuaderno"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Notebook Body: Sidebar of notes + Open Page */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-amber-50/95">
          {/* Sidebar index */}
          <div className="w-full sm:w-64 bg-amber-100/70 border-b sm:border-b-0 sm:border-r border-amber-300/80 p-3 overflow-y-auto shrink-0 flex flex-col gap-1.5 max-h-40 sm:max-h-full">
            <div className="text-[11px] font-bold text-amber-950/80 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-amber-700" />
              <span>Páginas archivadas</span>
            </div>

            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  sound.playTypewriterClick();
                  setActiveNoteId(n.id);
                  setIsEditing(false);
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition text-left border ${
                  activeNoteId === n.id
                    ? 'bg-amber-200/90 border-amber-600 shadow-xs'
                    : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <div className="text-xs font-bold text-amber-950 truncate">{n.title || 'Página sin título'}</div>
                <div className="text-[10px] text-stone-500 mt-0.5 flex items-center justify-between">
                  <span>{n.formattedDate}</span>
                  {activeNoteId === n.id && <span className="text-amber-700 font-bold">Abierta</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Open Page */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto relative bg-[radial-gradient(#fde68a_1px,transparent_1px)] [background-size:16px_16px]">
            {savedToast && (
              <div className="absolute top-3 right-6 bg-emerald-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 animate-in fade-in duration-150">
                <Check className="w-3.5 h-3.5" />
                <span>Página guardada en el escritorio</span>
              </div>
            )}

            {activeNote ? (
              <div className="flex-1 flex flex-col">
                {isEditing ? (
                  <div className="flex-1 flex flex-col gap-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título de tu reflexión..."
                      className="w-full text-lg sm:text-xl font-black font-['Caveat',cursive] bg-transparent border-b-2 border-amber-400 focus:outline-hidden pb-1 text-amber-950 placeholder:text-stone-400"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Escribí lo que estés pensando, lo que sentís o tus recuerdos del barrio..."
                      className="flex-1 w-full min-h-[220px] p-3 rounded-2xl bg-amber-100/50 border border-amber-300 focus:outline-hidden focus:border-amber-600 font-['Lora',serif] text-sm leading-relaxed text-stone-800 resize-none shadow-inner"
                    />
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-amber-200 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white shadow-md transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar en cuaderno</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-amber-300/80 mb-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black font-['Caveat',cursive] text-amber-950">
                            {activeNote.title}
                          </h2>
                          <div className="text-[11px] text-stone-500">{activeNote.formattedDate}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleStartEdit}
                            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
                          >
                            <Feather className="w-3.5 h-3.5" />
                            <span>Editar texto</span>
                          </button>
                          {notes.length > 1 && (
                            <button
                              onClick={() => handleDelete(activeNote.id)}
                              className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-xl transition"
                              title="Eliminar página"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="font-['Lora',serif] text-sm sm:text-base leading-relaxed text-stone-800 whitespace-pre-wrap">
                        {activeNote.content || (
                          <span className="italic text-stone-400">
                            Página en blanco. Tocá en "Editar texto" para plasmar tus pensamientos...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-amber-200/80 text-[11px] text-stone-500 italic flex items-center justify-between">
                      <span>"Escribir es una forma de ordenar el mundo cuando afuera todo parece moverse demasiado rápido"</span>
                      <span className="text-amber-800 font-bold">— Cuaderno de Ari</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-500">
                <BookOpen className="w-12 h-12 text-amber-300 mb-2" />
                <p className="text-sm font-semibold">No hay páginas abiertas</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-3 px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Comenzar a escribir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
