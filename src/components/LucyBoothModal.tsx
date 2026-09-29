import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Coins, Sparkles, X, MessageSquareQuote } from 'lucide-react';

interface LucyBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LUCY_ADVICES = [
  'El problema contigo es que piensas demasiado en las consecuencias. ¡A veces hay que chutar la pelota aunque te caigas de espaldas!',
  'La vida es como una baraja de cartas. Si no te gusta tu mano, exige otra baraja. ¡Son cinco centavos bien invertidos!',
  '¿Sabes cuál es el secreto de la felicidad? Tener una convicción inquebrantable y hablar más alto que los demás.',
  'La melancolía es un invento de Charlie Brown. Sal a tomar el sol, camina por la acera y cómprate un helado.',
  'Si las cosas no salen como quieres, culpa a las circunstancias o a tu hermano menor. ¡Siguiente paciente!'
];

export const LucyBoothModal: React.FC<LucyBoothModalProps> = ({ isOpen, onClose }) => {
  const [hasPaid, setHasPaid] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayNickel = () => {
    sound.playPianoNote(659.25, 0.2); // Coin clink sound
    setTimeout(() => sound.playPianoNote(880, 0.3), 100);
    setHasPaid(true);
    const chosen = LUCY_ADVICES[Math.floor(Math.random() * LUCY_ADVICES.length)];
    setAdvice(chosen);
  };

  const handleReset = () => {
    setHasPaid(false);
    setAdvice(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-lg bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-900/40 overflow-hidden flex flex-col">
        {/* Iconic wooden booth header */}
        <div className="bg-[#1E40AF] text-white px-3 py-2.5 sm:p-4 border-b-4 border-amber-950/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl shrink-0">👩‍⚕️</span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold font-['Caveat',cursive] tracking-wide truncate">
                PSYCHIATRIC HELP 5¢
              </h3>
              <p className="text-[10px] sm:text-xs text-blue-200 truncate">THE DOCTOR IS REAL IN</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-stone-950/80 hover:bg-stone-900 active:bg-stone-950 text-white rounded-xl border border-white/30 shadow-md text-xs font-black flex items-center gap-1.5 transition active:scale-95"
            title="Salir del puesto"
          >
            <X className="w-4 h-4 text-blue-300" />
            <span>Salir</span>
          </button>
        </div>

        {/* Booth body */}
        <div className="p-6 text-stone-800 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-400 flex items-center justify-center text-4xl shadow-inner">
            🪙
          </div>

          <div>
            <h4 className="text-lg font-bold font-['Lora',serif] text-blue-950">
              Consultorio Psiquiátrico de Lucy Van Pelt
            </h4>
            <p className="text-xs text-stone-600 mt-1 max-w-sm">
              Deposita 5 centavos en la lata de hojalata para recibir un diagnóstico honesto,
              directo y sin anestesia.
            </p>
          </div>

          {!hasPaid ? (
            <button
              onClick={handlePayNickel}
              className="mt-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Coins className="w-4 h-4" />
              <span>Depositar 5¢ (Moneda Peanuts)</span>
            </button>
          ) : (
            <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-left animate-in zoom-in-95 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                <span>Lucy dice con los brazos en jarras:</span>
              </div>
              <p className="text-sm sm:text-base font-['Lora',serif] italic text-stone-800 leading-relaxed pl-2 border-l-2 border-blue-400">
                "{advice}"
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-500">
                  Diagnóstico emitido con éxito. ¡Vuelva pronto!
                </span>
                <button
                  onClick={handlePayNickel}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Otra consulta (5¢)</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              Dar las gracias y marcharse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
