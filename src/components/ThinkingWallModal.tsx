import React, { useState } from 'react';
import { QuoteData, PHILOSOPHICAL_QUOTES } from '../data/quotesData';
import { sound } from '../utils/audio';
import { getAiHeaders } from '../utils/aiConfig';
import {
  Sparkles,
  RefreshCw,
  PenTool,
  MessageCircle,
  Bookmark,
  LogOut,
  Quote,
  Send,
  Loader2,
  X
} from 'lucide-react';

interface ThinkingWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotebookWithThought: (thought: string) => void;
}

type ThinkingStep = 'menu' | 'thought' | 'choose_character' | 'chatting';

const CHARACTERS_LIST = [
  { id: 'Linus', name: 'Linus Van Pelt', avatar: '🧣', desc: 'Filósofo y amigo de las reflexiones' },
  { id: 'Charlie Brown', name: 'Charlie Brown', avatar: '🧢', desc: 'Bondadoso, sincero y melancólico' },
  { id: 'Lucy', name: 'Lucy Van Pelt', avatar: '🎀', desc: 'Directa y consejera de 5 centavos' },
  { id: 'Snoopy', name: 'Snoopy', avatar: '🐾', desc: 'Escritor bohemio y soñador' },
  { id: 'Schroeder', name: 'Schroeder', avatar: '🎹', desc: 'Devoto de Beethoven y la belleza' },
  { id: 'Sally', name: 'Sally Brown', avatar: '🌸', desc: 'Práctica y defensora del descanso' },
  { id: 'Peppermint Patty', name: 'Peppermint Patty', avatar: '⚾', desc: 'Enérgica y deportista honesta' },
  { id: 'Marcie', name: 'Marcie', avatar: '👓', desc: 'Intelectual serena y leal' }
];

export const ThinkingWallModal: React.FC<ThinkingWallModalProps> = ({
  isOpen,
  onClose,
  onOpenNotebookWithThought
}) => {
  const [step, setStep] = useState<ThinkingStep>('menu');
  const [currentThought, setCurrentThought] = useState<QuoteData | null>(null);
  const [selectedChar, setSelectedChar] = useState<string>('Linus');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [savedThoughtMessage, setSavedThoughtMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Fetch or pick a thought
  const handleThink = async () => {
    setIsLoadingAi(true);
    sound.playInspireChime();
    try {
      const res = await fetch('/api/think', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({ topic: 'vida, calma, amistad, tiempo, identidad' })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentThought(data);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Fallback
      const randomQuote =
        PHILOSOPHICAL_QUOTES[Math.floor(Math.random() * PHILOSOPHICAL_QUOTES.length)];
      setCurrentThought(randomQuote);
    } finally {
      setIsLoadingAi(false);
      setStep('thought');
    }
  };

  const handleSaveThought = () => {
    if (!currentThought) return;
    try {
      const savedList = JSON.parse(
        localStorage.getItem('peanuts_saved_thoughts') || '[]'
      );
      savedList.unshift({
        ...currentThought,
        savedAt: new Date().toLocaleDateString('es-ES')
      });
      localStorage.setItem('peanuts_saved_thoughts', JSON.stringify(savedList));
      sound.playTypewriterClick();
      setSavedThoughtMessage('¡Pensamiento guardado en tu memoria!');
      setTimeout(() => setSavedThoughtMessage(null), 2500);
    } catch (e) {
      console.error('Error saving thought:', e);
    }
  };

  const startChatWith = async (characterName: string) => {
    setSelectedChar(characterName);
    setStep('chatting');
    setChatMessages([]);
    setIsLoadingAi(true);
    sound.playDoor();

    const initialPrompt = currentThought
      ? `Ari comparte este pensamiento en el muro: "${currentThought.quote}" (${currentThought.author})`
      : 'Ari se sienta a tu lado en el muro de ladrillo.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          character: characterName,
          message: '¿Qué opinas sobre esto?',
          locationName: 'El Muro de Pensar',
          thoughtContext: initialPrompt
        })
      });
      const data = await res.json();
      setChatMessages([
        { sender: characterName, text: data.reply || 'Hola, Ari. Me alegro de verte aquí.' }
      ]);
    } catch {
      setChatMessages([
        {
          sender: characterName,
          text: `Hola Ari, es un buen momento para sentarse y mirar el cielo desde este muro.`
        }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoadingAi) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    sound.playTypewriterClick();

    setChatMessages((prev) => [...prev, { sender: 'Ari', text: userText }]);
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          character: selectedChar,
          message: userText,
          locationName: 'El Muro de Pensar',
          thoughtContext: currentThought ? currentThought.quote : undefined
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: selectedChar, text: data.reply || '¡Caramba! Tienes un punto de vista interesante.' }
      ]);
      sound.playDoor();
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: selectedChar, text: 'A veces el silencio entre dos amigos es la mejor respuesta.' }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-900/30 flex flex-col overflow-hidden text-stone-800">
        {/* Header - Brick pattern */}
        <div className="bg-[#B91C1C] border-b-4 border-amber-900/40 px-3 py-2.5 sm:px-5 sm:py-3 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="text-xl shrink-0">🧱</span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold font-['Caveat',cursive] leading-tight truncate">
                El Muro de Pensar
              </h3>
              <p className="text-[10px] sm:text-xs text-red-100/80 truncate hidden xs:block">
                Punto de reunión, filosofía y calma de Peanuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-stone-950/80 hover:bg-stone-900 active:bg-stone-950 text-white rounded-xl border border-white/30 shadow-md text-xs font-black flex items-center gap-1.5 transition active:scale-95"
            title="Levantarse y salir"
          >
            <X className="w-4 h-4 text-red-300" />
            <span>Salir</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col min-h-[360px] max-h-[520px] overflow-y-auto">
          {/* STEP 1: INITIAL MENU */}
          {step === 'menu' && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200">
                🍂
              </div>
              <div className="max-w-md">
                <h4 className="text-base font-bold text-amber-950 font-['Lora',serif]">
                  Ari se sienta sobre el muro de ladrillo
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Las ramas de los árboles se mecen con la brisa. Desde aquí el mundo parece
                  detenerse y las preguntas encuentran su propio compás.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2.5 pt-2">
                <button
                  onClick={handleThink}
                  disabled={isLoadingAi}
                  className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-amber-50 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
                >
                  {isLoadingAi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  )}
                  <span>Pensar</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNotebookWithThought('En el muro de ladrillo hoy...');
                  }}
                  className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Escribir</span>
                </button>

                <button
                  onClick={() => setStep('choose_character')}
                  className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hablar con alguien</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 text-stone-500 hover:text-stone-700 text-xs font-semibold"
                >
                  Levantarse
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: THOUGHT DISPLAY */}
          {step === 'thought' && currentThought && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="bg-white/90 border-2 border-amber-200 rounded-2xl p-6 shadow-sm relative my-auto">
                <Quote className="w-8 h-8 text-amber-400/40 absolute -top-3 -left-2" />
                <p className="text-base sm:text-lg font-['Lora',serif] italic text-stone-800 leading-relaxed pl-3">
                  "{currentThought.quote}"
                </p>
                <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">
                    — {currentThought.author}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wide">
                    {currentThought.theme}
                  </span>
                </div>
              </div>

              {savedThoughtMessage && (
                <p className="text-center text-xs font-bold text-emerald-700 animate-in fade-in">
                  ✓ {savedThoughtMessage}
                </p>
              )}

              {/* Action buttons following user specification:
                  Seguir pensando | Escribir sobre esto | Hablar con alguien | Guardar pensamiento | Levantarse */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold pt-2">
                <button
                  onClick={handleThink}
                  className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Seguir pensando</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNotebookWithThought(currentThought.quote);
                  }}
                  className="p-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Escribir sobre esto</span>
                </button>

                <button
                  onClick={() => setStep('choose_character')}
                  className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hablar con alguien</span>
                </button>

                <button
                  onClick={handleSaveThought}
                  className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Guardar pensamiento</span>
                </button>

                <button
                  onClick={() => setStep('menu')}
                  className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <span>Volver al menú</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <span>Levantarse</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE CHARACTER TO TALK WITH */}
          {step === 'choose_character' && (
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  ¿Con quién te gustaría conversar en el muro?
                </h4>
                <button
                  onClick={() => setStep(currentThought ? 'thought' : 'menu')}
                  className="text-xs text-stone-500 hover:text-stone-800 font-bold"
                >
                  Atrás
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[300px] pr-1">
                {CHARACTERS_LIST.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => startChatWith(char.id)}
                    className="p-3 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-xl text-left flex items-center gap-3 transition shadow-xs hover:border-amber-400 active:scale-98"
                  >
                    <span className="text-2xl">{char.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-950 truncate">
                        {char.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{char.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CHATTING */}
          {step === 'chatting' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200 text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-2">
                  <span>Conversando con {selectedChar}</span>
                </span>
                <button
                  onClick={() => setStep('choose_character')}
                  className="text-stone-500 hover:text-stone-800 font-bold"
                >
                  Cambiar de personaje
                </button>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-amber-100/30 rounded-xl border border-amber-200/60 max-h-[220px]">
                {chatMessages.map((msg, idx) => {
                  const isAri = msg.sender === 'Ari';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAri ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-stone-400 px-1 mb-0.5">
                        {msg.sender}
                      </span>
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-['Lora',serif] leading-relaxed shadow-xs ${
                          isAri
                            ? 'bg-amber-700 text-white rounded-br-xs'
                            : 'bg-white text-stone-800 border border-amber-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {isLoadingAi && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 italic px-2 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{selectedChar} está pensando...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Escribe a ${selectedChar}...`}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-amber-700"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoadingAi || !inputMessage.trim()}
                  className="p-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
