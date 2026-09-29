import React from 'react';
import { LocationId } from '../types';
import { LOCATIONS_DATA } from '../data/neighborhoodData';
import { sound } from '../utils/audio';
import { MapPin, Navigation, X } from 'lucide-react';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationId: LocationId;
  onTravelTo: (target: LocationId) => void;
}

interface MapSpot {
  id: LocationId;
  title: string;
  category: string;
  icon: string;
  desc: string;
}

const MAP_SPOTS: MapSpot[] = [
  {
    id: 'neighborhood',
    title: 'Barrio Residencial',
    category: 'Exterior principal',
    icon: '🏡',
    desc: 'Calles arboladas, aceras, buzones y el corazón del vecindario.'
  },
  {
    id: 'house_ari',
    title: 'Casa de Ari',
    category: 'Hogar',
    icon: '🛏️',
    desc: 'Tu acogedor hogar con escritorio de escribir, cocina y salón.'
  },
  {
    id: 'house_charlie_brown',
    title: 'Casa de Charlie Brown & Sally',
    category: 'Hogar',
    icon: '🛋️',
    desc: 'Salón con teléfono clásico, cocina y trofeos de béisbol.'
  },
  {
    id: 'doghouse_interior',
    title: 'Caseta de Snoopy (Interior Mágico)',
    category: 'Lugar secreto',
    icon: '✨',
    desc: 'Mansión imposible con tocadiscos, biblioteca de lujo y trofeos.'
  },
  {
    id: 'house_van_pelt',
    title: 'Casa de Lucy & Linus',
    category: 'Hogar',
    icon: '🧣',
    desc: 'Habitaciones de Linus con su manta azul y de Lucy.'
  },
  {
    id: 'house_schroeder',
    title: 'Espacio de Schroeder',
    category: 'Música',
    icon: '🎹',
    desc: 'El piano rojo de juguete dedicado a Beethoven.'
  },
  {
    id: 'house_peppermint_patty',
    title: 'Casa de Peppermint Patty',
    category: 'Hogar',
    icon: '⚾',
    desc: 'Banderines deportivos, bates y zapatillas de atletismo.'
  },
  {
    id: 'house_marcie',
    title: 'Casa de Marcie',
    category: 'Hogar',
    icon: '📚',
    desc: 'Ambiente tranquilo de lectura y estanterías de libros.'
  },
  {
    id: 'house_franklin',
    title: 'Casa de Franklin',
    category: 'Hogar',
    icon: '♟️',
    desc: 'Tablero de ajedrez noble, libros de historia y memorias de su abuelo.'
  },
  {
    id: 'house_pigpen',
    title: 'Casa de Pig-Pen',
    category: 'Hogar',
    icon: '📻',
    desc: 'Cómics apilados, radio clásica y un sillón acogedor con motas de sol.'
  },
  {
    id: 'school',
    title: 'Escuela Primaria',
    category: 'Educación',
    icon: '🏫',
    desc: 'Aulas, pupitres, pizarra verde y patio escolar.'
  },
  {
    id: 'baseball_field',
    title: 'Campo de Béisbol',
    category: 'Deportes',
    icon: '🧢',
    desc: 'El montículo de Charlie Brown y el diamante de tierra.'
  },
  {
    id: 'pumpkin_patch',
    title: 'Campo de Calabazas',
    category: 'Misterio otoñal',
    icon: '🎃',
    desc: 'Donde Linus aguarda a la Gran Calabaza en la noche más sincera.'
  },
  {
    id: 'daisy_hill',
    title: 'Daisy Hill Puppy Farm',
    category: 'Granja rural',
    icon: '🐕',
    desc: 'Granja natal de Snoopy y sus hermanos cachorros.'
  },
  {
    id: 'summer_camp',
    title: 'Campamento de Verano',
    category: 'Naturaleza',
    icon: '🏕️',
    desc: 'Cabañas entre pinos, literas y muelle sobre el lago.'
  },
  {
    id: 'lake',
    title: 'El Lago Sereno',
    category: 'Naturaleza',
    icon: '🌊',
    desc: 'Ondas cristalinas, sauces y piedras para escribir en calma.'
  },
  {
    id: 'beach',
    title: 'La Playa Dorada',
    category: 'Costa',
    icon: '🏖️',
    desc: 'Dunas de arena, sombrillas y el sonido de las olas.'
  },
  {
    id: 'ice_rink',
    title: 'Pista de Patinaje sobre Hielo',
    category: 'Deportes de invierno',
    icon: '⛸️',
    desc: 'Hielo liso para patinar con música de piano al aire libre.'
  }
];

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  currentLocationId,
  onTravelTo
}) => {
  if (!isOpen) return null;

  const handleSelect = (locId: LocationId) => {
    sound.playDoor();
    onTravelTo(locId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-amber-50 rounded-2xl shadow-2xl border-4 border-amber-900/40 flex flex-col overflow-hidden text-stone-800">
        {/* Header */}
        <div className="bg-amber-800 text-white px-3 py-2.5 sm:p-4 border-b-4 border-amber-950/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold font-['Caveat',cursive] truncate">
                Mapa del Barrio de Peanuts
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-200 truncate hidden xs:block">
                Selecciona cualquier escenario para viajar al instante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-stone-950/80 hover:bg-stone-900 active:bg-stone-950 text-white rounded-xl border border-white/30 shadow-md text-xs font-black flex items-center gap-1.5 transition active:scale-95"
            title="Cerrar mapa"
          >
            <X className="w-4 h-4 text-amber-300" />
            <span>Salir</span>
          </button>
        </div>

        {/* Spots grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MAP_SPOTS.map((spot) => {
            const isCurrent = spot.id === currentLocationId;
            return (
              <button
                key={spot.id}
                onClick={() => handleSelect(spot.id)}
                disabled={isCurrent}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isCurrent
                    ? 'bg-amber-200/90 border-amber-500 shadow-sm cursor-default'
                    : 'bg-white hover:bg-amber-100/70 border-amber-200 hover:border-amber-400 active:scale-98 shadow-xs'
                }`}
              >
                <span className="text-2xl pt-0.5">{spot.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs sm:text-sm font-bold text-amber-950 truncate font-['Lora',serif]">
                      {spot.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-800 text-white font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                        <MapPin className="w-2.5 h-2.5" />
                        Aquí
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-amber-800/70 font-semibold block">
                    {spot.category}
                  </span>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {spot.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-amber-100/70 border-t border-amber-200 p-3 text-center text-xs text-stone-500">
          Usa los senderos o la bicicleta para moverte de manera acogedora entre todos los lugares del universo de Schulz.
        </div>
      </div>
    </div>
  );
};
