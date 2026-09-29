import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { BASE_CHARACTERS_DATA } from '../data/charactersData';
import { CharacterPortrait } from './CharacterPortrait';
import { X, Sprout, Sparkles, Gift, Heart, CheckCircle2, Award, Flame, Scissors, Star } from 'lucide-react';

export interface PumpkinPlant {
  id: string;
  slotIndex: number;
  stage: 'seed' | 'sprout' | 'growing' | 'mature' | 'giant';
  plantedAt: number;
  wateredCount: number;
  fertilized: boolean;
  name: string;
}

export interface CarvedLantern {
  id: string;
  style: 'charlie' | 'snoopy' | 'classic' | 'stars';
  name: string;
  lit: boolean;
  carvedAt: number;
}

interface PumpkinPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGiveGift?: (characterId: string, giftName: string, reactionText: string) => void;
}

const STORAGE_KEY = 'peanuts_ari_pumpkin_patch';
const HARVESTED_KEY = 'peanuts_ari_harvested_pumpkins';
const LANTERNS_KEY = 'peanuts_ari_carved_lanterns';
const SINCERITY_KEY = 'peanuts_ari_sincerity_score';

// NPC reactions when gifted a sincere pumpkin
const NPC_REACTIONS: Record<string, { quote: string; title: string }> = {
  linus: {
    title: '¡El huerto más sincero del mundo!',
    quote: '¡Oh, Ari! ¡Esta calabaza irradia una sinceridad absoluta! ¡Estoy seguro de que la Gran Calabaza elegirá nuestro huerto gracias a ti!'
  },
  charlie_brown: {
    title: 'Una sorpresa reconfortante',
    quote: '¿Para mí, Ari? ¡Nadie me había regalado nunca una calabaza tan hermosa! Casi me hace olvidar todas las cometas que perdí.'
  },
  snoopy: {
    title: '¡Baile de la alegría!',
    quote: '*Snoopy abraza la calabaza redonda, hace un giro acrobático de ballet sobre sus patitas traseras y te da un lametón amistoso en la mejilla.*'
  },
  woodstock: {
    title: '¡Pío pío piiit!',
    quote: '¡Pííit, pío pío! *Woodstock se posa encima del rabillo verde de la calabaza, aletea sus plumitas amarillas emocionado y hace una reverencia.*'
  },
  lucy: {
    title: 'Aprobación de Lucy',
    quote: 'Bueno, bueno... debo admitir que tiene una geometría impecable. Te daré cinco centavos de crédito en mi consultorio psiquiátrico por esto.'
  },
  sally: {
    title: '¡Es adorable!',
    quote: '¡Es preciosa, Ari! ¡Se la enseñaré a mi dulce cariñito Linus para demostrarle que las calabazas de verdad son mejores que las imaginarias!'
  },
  peppermint_patty: {
    title: '¡Trofeo de campeón!',
    quote: '¡Qué buena bola, Ari! Con un poco de entrenamiento podríamos usarla como mascota del equipo en el próximo campeonato.'
  },
  marcie: {
    title: 'Un gesto poético',
    quote: 'Es muy amable de su parte, señorita Ari. La forma suave y el tono anaranjado recuerdan a una estrofa de Robert Frost.'
  },
  schroeder: {
    title: 'Inspiración clásica',
    quote: 'Tiene la armonía y proporción de la Sexta Sinfonía Pastoral de Beethoven. La colocaré junto a mi busto de caoba.'
  }
};

export const PumpkinPatchModal: React.FC<PumpkinPatchModalProps> = ({
  isOpen,
  onClose,
  onGiveGift
}) => {
  const [plants, setPlants] = useState<PumpkinPlant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'p_0', slotIndex: 0, stage: 'mature', plantedAt: Date.now() - 3600000, wateredCount: 3, fertilized: true, name: 'Calabaza Dorada de Otoño' },
      { id: 'p_1', slotIndex: 1, stage: 'giant', plantedAt: Date.now() - 7200000, wateredCount: 5, fertilized: true, name: '¡La Gran Calabaza Sincera!' },
      { id: 'p_2', slotIndex: 2, stage: 'growing', plantedAt: Date.now() - 1800000, wateredCount: 2, fertilized: false, name: 'Calabacita en Flor' },
      { id: 'p_3', slotIndex: 3, stage: 'sprout', plantedAt: Date.now() - 600000, wateredCount: 1, fertilized: false, name: 'Brote Silvestre' },
      { id: 'p_4', slotIndex: 4, stage: 'seed', plantedAt: Date.now() - 100000, wateredCount: 1, fertilized: false, name: 'Semilla Dulce' },
      { id: 'p_5', slotIndex: 5, stage: 'seed', plantedAt: 0, wateredCount: 0, fertilized: false, name: 'Tierra Preparada' }
    ];
  });

  const [inventoryCount, setInventoryCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(HARVESTED_KEY);
      return stored ? parseInt(stored, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [sincerityScore, setSincerityScore] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(SINCERITY_KEY);
      return stored ? Math.min(100, parseInt(stored, 10)) : 65;
    } catch {
      return 65;
    }
  });

  const [lanterns, setLanterns] = useState<CarvedLantern[]>(() => {
    try {
      const stored = localStorage.getItem(LANTERNS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // default initial lantern
    }
    return [
      { id: 'l_1', style: 'charlie', name: 'Linterna Zigzag de Charlie', lit: true, carvedAt: Date.now() - 50000 }
    ];
  });

  const [activeTab, setActiveTab] = useState<'huerto' | 'tallar' | 'regalar'>('huerto');
  const [giftResult, setGiftResult] = useState<{ characterName: string; quote: string; title: string; charId: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Save states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch (e) { console.error(e); }
  }, [plants]);

  useEffect(() => {
    try {
      localStorage.setItem(HARVESTED_KEY, inventoryCount.toString());
    } catch (e) { console.error(e); }
  }, [inventoryCount]);

  useEffect(() => {
    try {
      localStorage.setItem(LANTERNS_KEY, JSON.stringify(lanterns));
    } catch (e) { console.error(e); }
  }, [lanterns]);

  useEffect(() => {
    try {
      localStorage.setItem(SINCERITY_KEY, sincerityScore.toString());
    } catch (e) { console.error(e); }
  }, [sincerityScore]);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const addSincerity = (amount: number) => {
    setSincerityScore((prev) => {
      const next = Math.min(100, prev + amount);
      if (prev < 100 && next === 100) {
        sound.playPeanutsJingle();
        showNotification('🌟 ¡¡NIVEL MÁXIMO DE SINCERIDAD ALCANZADO!! ¡La Gran Calabaza bendice tu huerto!');
      }
      return next;
    });
  };

  // Plant a new seed
  const handlePlant = (slotIndex: number) => {
    sound.playFootstep('grass');
    setPlants((prev) =>
      prev.map((p) =>
        p.slotIndex === slotIndex
          ? {
              ...p,
              stage: 'seed',
              plantedAt: Date.now(),
              wateredCount: 1,
              name: 'Semilla recién sembrada'
            }
          : p
      )
    );
    addSincerity(4);
    showNotification('🌱 ¡Sembraste una nueva semilla de calabaza en la tierra sincera!');
  };

  // Water a plant
  const handleWater = (slotIndex: number) => {
    sound.playTypewriterClick();
    setPlants((prev) =>
      prev.map((p) => {
        if (p.slotIndex !== slotIndex) return p;
        const newWater = p.wateredCount + 1;
        let nextStage = p.stage;
        let nextName = p.name;

        if (p.stage === 'seed') {
          nextStage = 'sprout';
          nextName = 'Brote verde con zarcillos';
        } else if (p.stage === 'sprout') {
          nextStage = 'growing';
          nextName = 'Calabaza en flor dorada';
        } else if (p.stage === 'growing') {
          nextStage = 'mature';
          nextName = 'Calabaza Redonda Madura';
        } else if (p.stage === 'mature' && newWater >= 4) {
          nextStage = 'giant';
          nextName = '¡Gran Calabaza Sincera Gigante!';
        }

        return {
          ...p,
          stage: nextStage,
          wateredCount: newWater,
          name: nextName
        };
      })
    );
    addSincerity(5);
    showNotification('💧 ¡Regaste la calabaza! Las hojas reverdecen con agua fresca.');
  };

  // Harvest mature pumpkin
  const handleHarvest = (slotIndex: number) => {
    sound.playInspireChime();
    setPlants((prev) =>
      prev.map((p) =>
        p.slotIndex === slotIndex
          ? {
              ...p,
              stage: 'seed',
              plantedAt: 0,
              wateredCount: 0,
              name: 'Tierra preparada'
            }
          : p
      )
    );
    setInventoryCount((c) => c + 1);
    addSincerity(8);
    showNotification('🎃 ¡Cosechaste una hermosa calabaza! Añadida a tu cesta.');
  };

  // Carve a new pumpkin lantern
  const handleCarve = (style: 'charlie' | 'snoopy' | 'classic' | 'stars') => {
    if (inventoryCount <= 0) {
      showNotification('❌ No tienes calabazas en tu cesta. ¡Cosecha una primero!');
      return;
    }

    sound.playInspireChime();
    setInventoryCount((c) => c - 1);

    const names = {
      charlie: 'Sonrisa Zigzag de Charlie Brown',
      snoopy: 'Silueta Iluminada de Snoopy & Woodstock',
      classic: 'Sonrisa Clásica Radiante de Linus',
      stars: 'Linterna de Ojos Estelares'
    };

    const newLantern: CarvedLantern = {
      id: `l_${Date.now()}`,
      style,
      name: names[style],
      lit: true,
      carvedAt: Date.now()
    };

    setLanterns((prev) => [newLantern, ...prev]);
    addSincerity(10);
    showNotification(`✨ ¡Tallaste una linterna "${names[style]}" y encendiste su vela!`);
  };

  // Toggle candle in lantern
  const toggleLantern = (id: string) => {
    sound.playTypewriterClick();
    setLanterns((prev) =>
      prev.map((l) => (l.id === id ? { ...l, lit: !l.lit } : l))
    );
  };

  // Gift a pumpkin to an NPC
  const handleSendGift = (charId: string) => {
    if (inventoryCount <= 0) {
      showNotification('❌ No tienes calabazas en tu cesta. ¡Cosecha una primero!');
      return;
    }

    const recipient = BASE_CHARACTERS_DATA.find((c) => c.id === charId) || {
      id: charId,
      name: charId
    };

    const reaction = NPC_REACTIONS[charId] || {
      title: '¡Muchas gracias!',
      quote: `¡Muchas gracias, Ari! Es la calabaza más hermosa que he visto en todo el vecindario.`
    };

    sound.playInspireChime();
    setInventoryCount((c) => Math.max(0, c - 1));
    addSincerity(12);

    setGiftResult({
      charId,
      characterName: recipient.name,
      title: reaction.title,
      quote: reaction.quote
    });

    if (onGiveGift) {
      onGiveGift(charId, 'Calabaza Sincera de Otoño', reaction.quote);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="pumpkin-patch-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="pumpkin-patch-modal-card"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900 border-3 border-amber-600/80 rounded-3xl shadow-2xl overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-2xl shadow-inner">
              🎃
            </div>
            <div>
              <h2 className="text-xl font-black font-['Caveat',cursive] text-amber-200 tracking-wide flex items-center gap-2">
                El Huerto de Calabazas Sinceras
                {sincerityScore >= 100 && (
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-400/80 rounded-full">
                    ★ Bendecido por la Gran Calabaza
                  </span>
                )}
              </h2>
              <p className="text-xs text-amber-300/80">
                Un rincón sereno de fe, amistad y huerto otoñal junto a Linus y Snoopy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition active:scale-95"
            title="Cerrar huerto"
          >
            <X className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Linus Sincerity Meter & Stats Bar */}
        <div className="px-5 py-2.5 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Sincerometer */}
          <div className="flex-1 w-full max-w-md">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Sinceridad del Huerto (Linus):
              </span>
              <span className="font-extrabold text-amber-400">{sincerityScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-amber-900/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${sincerityScore}%` }}
              />
            </div>
          </div>

          {/* Basket Inventory & Tab Switches */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1 bg-amber-950/80 border border-amber-600/70 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-200 shadow-xs">
              <span>🧺 En tu cesta:</span>
              <span className="text-base text-amber-400 font-extrabold">{inventoryCount}</span>
              <span className="text-sm">🎃</span>
            </div>

            <div className="flex bg-stone-800/90 rounded-xl p-0.5 border border-stone-700">
              <button
                onClick={() => { setActiveTab('huerto'); setGiftResult(null); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'huerto'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🌱 Huerto
              </button>
              <button
                onClick={() => { setActiveTab('tallar'); setGiftResult(null); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'tallar'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                ✂️ Taller
              </button>
              <button
                onClick={() => { setActiveTab('regalar'); setGiftResult(null); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'regalar'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                🎁 Regalar
              </button>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold text-center animate-in slide-in-from-top-2 duration-200 flex items-center justify-center gap-2 shrink-0">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-900/60">
          {activeTab === 'huerto' ? (
            <div>
              <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-2xl flex items-center gap-3 text-xs text-amber-200">
                <span className="text-2xl">🍂</span>
                <div>
                  <strong className="text-amber-300">Un huerto sincero y paciente:</strong> Riega tus brotes con agua pura para verlos florecer hasta convertirse en calabazas redondas gigantescas. ¡La Gran Calabaza recompensa a los huertos humildes!
                </div>
              </div>

              {/* 6 Garden Beds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {plants.map((plant) => {
                  const isEmpty = plant.plantedAt === 0;
                  const isReady = plant.stage === 'mature' || plant.stage === 'giant';

                  return (
                    <div
                      key={plant.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isReady
                          ? 'bg-gradient-to-b from-amber-950/80 to-stone-950 border-amber-500/80 shadow-lg shadow-amber-950/40'
                          : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-[11px] text-stone-400">
                        <span>Bancal #{plant.slotIndex + 1}</span>
                        {isReady && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            ¡Lista!
                          </span>
                        )}
                      </div>

                      {/* Visual stage */}
                      <div className="py-4 flex flex-col items-center justify-center min-h-[90px]">
                        {plant.stage === 'giant' ? (
                          <div className="flex flex-col items-center animate-bounce duration-1000">
                            <span className="text-5xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">🎃</span>
                            <span className="text-[11px] text-yellow-300 font-extrabold mt-1">¡Gran Calabaza Gigante!</span>
                          </div>
                        ) : plant.stage === 'mature' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">🎃</span>
                            <span className="text-[10px] text-emerald-400 font-bold mt-1">Madura y lista</span>
                          </div>
                        ) : plant.stage === 'growing' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">🌼</span>
                            <span className="text-[10px] text-yellow-300 font-medium mt-1">Floración y zarcillos</span>
                          </div>
                        ) : plant.stage === 'sprout' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">🌱</span>
                            <span className="text-[10px] text-lime-300 font-medium mt-1">Brote verde tierno</span>
                          </div>
                        ) : isEmpty ? (
                          <div className="flex flex-col items-center text-stone-500">
                            <span className="text-2xl">🟤</span>
                            <span className="text-[10px] text-stone-400 mt-1">Tierra arada vacía</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-amber-600">
                            <span className="text-xl">🌰</span>
                            <span className="text-[10px] text-amber-300/80 mt-1">Semilla bajo tierra</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-stone-200 font-bold mb-3 truncate text-center">
                        {plant.name}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        {isEmpty ? (
                          <button
                            onClick={() => handlePlant(plant.slotIndex)}
                            className="col-span-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                          >
                            <Sprout className="w-3.5 h-3.5" />
                            Sembrar semilla
                          </button>
                        ) : isReady ? (
                          <button
                            onClick={() => handleHarvest(plant.slotIndex)}
                            className="col-span-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Cosechar calabaza
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleWater(plant.slotIndex)}
                              className="py-1.5 px-2 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                            >
                              💧 Regar ({plant.wateredCount})
                            </button>
                            <button
                              onClick={() => handleHarvest(plant.slotIndex)}
                              className="py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1"
                              title="Cosechar temprano"
                            >
                              🌾 Limpiar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'tallar' ? (
            <div>
              {/* Pumpkin Carving Workshop */}
              <div className="mb-4 p-3 bg-orange-950/50 border border-orange-800/50 rounded-2xl flex items-center justify-between text-xs text-orange-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">✂️</span>
                  <div>
                    <strong className="text-orange-300">Taller de Linternas de Schulz:</strong> Talla tus calabazas cosechadas con diseños icónicos de Peanuts y enciende su vela para iluminar la noche de otoño.
                  </div>
                </div>
                <div className="font-extrabold text-amber-400 shrink-0">
                  Cesta: {inventoryCount} 🎃
                </div>
              </div>

              {/* Carving Styles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { style: 'charlie' as const, title: 'Zigzag de Charlie', desc: 'Sonrisa con el chevron clásico', icon: '🧢' },
                  { style: 'snoopy' as const, title: 'Snoopy & Woodstock', desc: 'Silueta alegre del beagle y el pájaro', icon: '🐾' },
                  { style: 'classic' as const, title: 'Sonrisa de Linus', desc: 'La cara clásica de la Gran Calabaza', icon: '🧣' },
                  { style: 'stars' as const, title: 'Ojos Estelares', desc: 'Ojos de estrellas y sonrisa traviesa', icon: '⭐' }
                ].map((item) => (
                  <div
                    key={item.style}
                    className="p-3.5 bg-stone-950 border border-stone-800 rounded-2xl flex flex-col justify-between hover:border-amber-500/60 transition shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 bg-amber-950/80 rounded-full border border-amber-800">
                          1 Calabaza
                        </span>
                      </div>
                      <div className="text-xs font-bold text-amber-200">{item.title}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{item.desc}</div>
                    </div>

                    <button
                      onClick={() => handleCarve(item.style)}
                      disabled={inventoryCount <= 0}
                      className={`mt-3 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        inventoryCount > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Scissors className="w-3 h-3" />
                      Tallar ahora
                    </button>
                  </div>
                ))}
              </div>

              {/* Display Carved Lanterns */}
              <div className="border-t border-stone-800 pt-4">
                <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Tus Linternas Talladas ({lanterns.length})
                </h3>

                {lanterns.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    No has tallado ninguna linterna aún. ¡Usa una calabaza de tu cesta arriba para crear una!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {lanterns.map((l) => (
                      <div
                        key={l.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                          l.lit
                            ? 'bg-stone-950 border-amber-500/60 shadow-md shadow-orange-950/30'
                            : 'bg-stone-950/50 border-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition ${
                            l.lit ? 'bg-amber-500/20 text-yellow-300 animate-pulse' : 'bg-stone-900 text-stone-600'
                          }`}>
                            {l.lit ? '🕯️' : '🎃'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-200">{l.name}</div>
                            <div className="text-[10px] text-amber-400/80">
                              {l.lit ? 'Vela encendida ✨' : 'Apagada'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleLantern(l.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            l.lit
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                        >
                          {l.lit ? 'Apagar' : 'Encender'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Gift delivery tab */}
              <div className="mb-4 p-3 bg-amber-950/60 border border-amber-800/50 rounded-2xl text-xs text-amber-200">
                <span className="font-bold text-amber-300">🎁 Regalar a tus amigos:</span> Elige a uno de tus amigos del vecindario para obsequiarle una de tus calabazas sinceras cosechadas. Cada uno responderá con una frase original e inolvidable.
              </div>

              {/* Delivery dialogue modal overlay */}
              {giftResult ? (
                <div className="p-6 bg-stone-950 border-2 border-amber-500 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-fade-in my-2">
                  <div className="mb-3">
                    <CharacterPortrait characterId={giftResult.charId} size={70} className="shadow-lg" />
                  </div>
                  <h3 className="text-base font-bold text-amber-300 mb-1">
                    {giftResult.title}
                  </h3>
                  <div className="text-xs text-stone-400 mb-4">
                    Regalo entregado a <strong className="text-white">{giftResult.characterName}</strong>
                  </div>

                  <div className="p-4 bg-stone-900 border border-amber-700/40 rounded-2xl text-stone-200 text-sm italic max-w-lg mb-6 leading-relaxed">
                    "{giftResult.quote}"
                  </div>

                  <button
                    onClick={() => setGiftResult(null)}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Entregar otro regalo a otro amigo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'linus', name: 'Linus Van Pelt', desc: 'El más devoto de la Gran Calabaza' },
                    { id: 'charlie_brown', name: 'Charlie Brown', desc: 'Siempre agradecido de corazón' },
                    { id: 'snoopy', name: 'Snoopy', desc: 'Hará su famoso baile de la alegría' },
                    { id: 'woodstock', name: 'Woodstock', desc: 'Se posará en el rabillo de la calabaza' },
                    { id: 'lucy', name: 'Lucy Van Pelt', desc: 'Te dará crédito en su consultorio' },
                    { id: 'sally', name: 'Sally Brown', desc: 'Orgullosa de su huerto con Linus' },
                    { id: 'peppermint_patty', name: 'Peppermint Patty', desc: 'La entrenará como bola de béisbol' },
                    { id: 'marcie', name: 'Marcie', desc: 'Aprecia la belleza botánica' },
                    { id: 'schroeder', name: 'Schroeder', desc: 'La colocará junto a Beethoven' }
                  ].map((char) => (
                    <div
                      key={char.id}
                      className="p-3 bg-stone-950/80 border border-stone-800 rounded-2xl flex items-center justify-between hover:border-amber-600/60 transition shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CharacterPortrait characterId={char.id} size={42} />
                        <div>
                          <div className="text-xs font-bold text-stone-200">{char.name}</div>
                          <div className="text-[11px] text-stone-400">{char.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendGift(char.id)}
                        disabled={inventoryCount <= 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          inventoryCount > 0
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow active:scale-95'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Regalar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-950 border-t border-stone-800 text-stone-400 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span>Presiona</span>
            <kbd className="px-1.5 py-0.5 bg-stone-800 text-amber-300 font-bold rounded border border-stone-700 text-[10px]">ESC</kbd>
            <span>para volver al vecindario</span>
          </div>
          <div className="text-[11px] text-amber-300/80 italic hidden sm:block">
            "No hay nada más sincero que un huerto cuidado con cariño" — Linus
          </div>
        </div>
      </div>
    </div>
  );
};
