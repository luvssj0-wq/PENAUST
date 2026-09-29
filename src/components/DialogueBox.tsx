import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/audio';
import { X, CornerDownLeft, Send, Sparkles, Loader2, MessageSquare, User } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

export interface DialogueMessageItem {
  id: string;
  sender: 'user' | 'npc';
  speakerName: string;
  avatarIcon?: string;
  characterId?: string;
  text: string;
}

interface DialogueBoxProps {
  speakerName: string;
  avatarIcon?: string;
  characterId?: string;
  text: string;
  onClose: () => void;
  actionHint?: string;
  onSendMessage?: (message: string) => Promise<void> | void;
  isReplying?: boolean;
  history?: DialogueMessageItem[];
  onOpenAiConfig?: () => void;
  aiProviderName?: string;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speakerName,
  avatarIcon = '💭',
  characterId,
  text,
  onClose,
  actionHint,
  onSendMessage,
  isReplying = false,
  history = [],
  onOpenAiConfig,
  aiProviderName = 'Certainty Companion'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Typewriter effect when current text changes
  useEffect(() => {
    let currentIdx = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      currentIdx++;
      if (currentIdx <= text.length) {
        setDisplayedText(text.slice(0, currentIdx));
        if (currentIdx % 3 === 0) {
          sound.playTypewriterClick();
        }
      } else {
        clearInterval(timer);
      }
    }, 12);

    return () => clearInterval(timer);
  }, [text]);

  // Focus input automatically so user can start typing right away
  useEffect(() => {
    if (onSendMessage && inputRef.current) {
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(focusTimer);
    }
  }, [onSendMessage]);

  // Scroll to bottom when history or reply status updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, text, isReplying, displayedText]);

  const handleBoxClick = (e: React.MouseEvent) => {
    // If clicking on input or button, don't trigger box click
    if ((e.target as HTMLElement).closest('input, button, form')) {
      return;
    }
    if (displayedText.length < text.length) {
      setDisplayedText(text);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isReplying) return;
    const msg = inputText.trim();
    setInputText('');
    sound.playTypewriterClick();
    if (onSendMessage) {
      onSendMessage(msg);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xl z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div
        onClick={handleBoxClick}
        className="bg-amber-50/98 backdrop-blur-md rounded-2xl border-4 border-amber-950/80 shadow-2xl p-4 sm:p-5 flex flex-col text-stone-900 relative max-h-[85vh] sm:max-h-[520px]"
      >
        {/* Comic balloon tail */}
        <div className="absolute -top-3 left-8 w-0 h-0 border-x-8 border-x-transparent border-b-12 border-b-amber-950/80" />
        <div className="absolute -top-2 left-8 w-0 h-0 border-x-7 border-x-transparent border-b-10 border-b-amber-50" />

        {/* Speaker Name Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/90 mb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            {characterId ? (
              <CharacterPortrait characterId={characterId} size={46} className="ring-2 ring-amber-400/80 shadow-md" />
            ) : (
              <span className="text-2xl select-none">{avatarIcon}</span>
            )}
            <div>
              <h4 className="text-lg font-black font-['Caveat',cursive] text-amber-950 tracking-wide flex items-center gap-2 leading-none">
                {speakerName}
                {onSendMessage && (
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-amber-200/90 text-amber-950 rounded-full border border-amber-400/80 uppercase tracking-wider shadow-xs">
                    Conversación viva
                  </span>
                )}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenAiConfig && onSendMessage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTypewriterClick();
                  onOpenAiConfig();
                }}
                className="px-2 py-0.5 bg-amber-200/80 hover:bg-amber-300 text-stone-900 border border-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1 transition shadow-xs"
                title="Configuración de IA (Certainty Companion / Lucia AI)"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                <span>{aiProviderName}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-stone-500 hover:text-stone-800 rounded-md transition hover:bg-amber-100/60"
              title="Cerrar diálogo [Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div 
          ref={scrollRef} 
          className="overflow-y-auto pr-1 my-1 space-y-2.5 max-h-[220px] sm:max-h-[280px] scrollbar-thin scrollbar-thumb-amber-300"
        >
          {/* Previous dialogue turns if any */}
          {history.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1 mb-0.5">
                {msg.sender === 'user' ? 'Ari' : msg.speakerName}
              </span>
              <div
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-['Lora',serif] leading-relaxed max-w-[85%] border shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-200/70 border-amber-400/80 text-amber-950 rounded-br-none'
                    : 'bg-white/90 border-amber-200/90 text-stone-900 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current / Latest Response */}
          <div className="flex flex-col items-start pt-1">
            {history.length > 0 && (
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1 mb-0.5">
                {speakerName}
              </span>
            )}
            {isReplying ? (
              <div className="flex items-center gap-2 text-stone-600 font-['Lora',serif] italic text-xs sm:text-sm py-2 px-3 bg-white/70 rounded-xl border border-amber-200/60">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                <span>{speakerName} está pensando su respuesta...</span>
              </div>
            ) : (
              <div
                className={`text-sm sm:text-base font-['Lora',serif] leading-relaxed text-stone-900 ${
                  history.length > 0
                    ? 'px-3 py-2 bg-white/95 border-2 border-amber-300 rounded-xl rounded-bl-none shadow-xs'
                    : 'py-1'
                }`}
              >
                {displayedText}
                {displayedText.length < text.length && (
                  <span className="inline-block w-2 h-4 bg-amber-700 ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Typing Form */}
        {onSendMessage && (
          <form
            onSubmit={handleSend}
            className="mt-2.5 pt-2.5 border-t border-amber-200/80 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-700/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation(); // prevent game movement keys while typing
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isReplying}
                placeholder={`Dile algo a ${speakerName} (ej. Hola, ¿jugamos béisbol?, ¿qué opinas?)...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white/95 rounded-xl border-2 border-amber-900/30 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-stone-900 placeholder:text-stone-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isReplying}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              {isReplying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Hint */}
        <div className="pt-2 mt-1 flex items-center justify-between text-[11px] text-stone-500 font-medium border-t border-amber-200/50 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {actionHint || 'Escribe con el teclado y pulsa Enter o Enviar para hablar'}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1 font-bold text-amber-900 hover:text-amber-950 transition"
          >
            <span>Cerrar</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
