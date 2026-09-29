import { CharacterNpc, LocationData, Position } from '../types';

export interface SocialDialoguePair {
  id?: string;
  char1: string;
  char2: string;
  speaker1Text: string;
  speaker2Text: string;
  emote1: string;
  emote2: string;
}

// Memory buffer for social exchanges to guarantee non-repetition
const recentSocialPairIds = new Set<string>();

// Extensive, authentic Peanuts comic dialogues across all character pairs
export const PEANUTS_SOCIAL_EXCHANGES: SocialDialoguePair[] = [
  // --- Charlie Brown & Lucy ---
  {
    id: 'cb_lucy_1',
    char1: 'charlie_brown',
    char2: 'lucy',
    speaker1Text: 'A veces el mundo parece demasiado grande para mí...',
    speaker2Text: '¡Cinco centavos por consejo, Charlie Brown! ¡Y ponte derecho!',
    emote1: '💭',
    emote2: '⚡'
  },
  {
    id: 'cb_lucy_2',
    char1: 'charlie_brown',
    char2: 'lucy',
    speaker1Text: '¿Alguna vez has sentido que no encajas, Lucy?',
    speaker2Text: '¡Por supuesto que no! Yo nací para mandar.',
    emote1: '💧',
    emote2: '👑'
  },
  {
    id: 'cb_lucy_3',
    char1: 'lucy',
    char2: 'charlie_brown',
    speaker1Text: '¡Oye, Charlie Brown! Tengo un balón de fútbol esperándote. Esta vez juro que no lo quitaré.',
    speaker2Text: '¡Sé exactamente lo que tramas, Lucy! Mis costillas aún recuerdan el otoño pasado...',
    emote1: '🏈',
    emote2: '😰'
  },
  {
    id: 'cb_lucy_4',
    char1: 'charlie_brown',
    char2: 'lucy',
    speaker1Text: '¿Crees que nuestro equipo de béisbol ganará algún día, Lucy?',
    speaker2Text: '¡No mientras sigas lanzando esas bolas flotantes de gelatina, capitán!',
    emote1: '⚾',
    emote2: '📢'
  },
  {
    id: 'cb_lucy_5',
    char1: 'lucy',
    char2: 'charlie_brown',
    speaker1Text: 'Por cinco centavos puedo curar tu complejo de inferioridad en dos minutos.',
    speaker2Text: 'No es un complejo, Lucy... es una certeza bien fundamentada.',
    emote1: '🪙',
    emote2: '🤦'
  },
  {
    id: 'cb_lucy_6',
    char1: 'charlie_brown',
    char2: 'lucy',
    speaker1Text: 'El árbol de las cometas se tragó mi cometa roja otra vez.',
    speaker2Text: '¡Ese árbol tiene mejor digestión que tú sentido común, Charlie Brown!',
    emote1: '🪁',
    emote2: '🌲'
  },
  {
    id: 'cb_lucy_7',
    char1: 'lucy',
    char2: 'charlie_brown',
    speaker1Text: '¡Oye Charlie Brown! ¿Sabías que las personas decididas nunca dudan?',
    speaker2Text: 'Yo dudo incluso de si dudar es lo correcto...',
    emote1: '👑',
    emote2: '💭'
  },

  // --- Lucy & Schroeder ---
  {
    id: 'lucy_schroeder_1',
    char1: 'lucy',
    char2: 'schroeder',
    speaker1Text: 'Schroeder, ¿sabías que las esposas de los grandes pianistas llevan abrigos de visón?',
    speaker2Text: 'Beethoven nunca se casó, Lucy. Y yo tampoco pienso hacerlo.',
    emote1: '💍',
    emote2: '🎹'
  },
  {
    id: 'lucy_schroeder_2',
    char1: 'lucy',
    char2: 'schroeder',
    speaker1Text: '¿Por qué no tocas algo bailable? ¡Tanta sonata seria me aburre!',
    speaker2Text: '¡Esto no es música bailable, Lucy! ¡Es la Sonata Patética en Do Menor!',
    emote1: '💃',
    emote2: '🎵'
  },
  {
    id: 'lucy_schroeder_3',
    char1: 'lucy',
    char2: 'schroeder',
    speaker1Text: 'Si me caso contigo, prometo dejar que tengas un piano pequeño en el sótano.',
    speaker2Text: '¡Fuera de mi piano de juguete, Lucy! ¡Estás bloqueando la acústica!',
    emote1: '🏡',
    emote2: '🎶'
  },
  {
    id: 'lucy_schroeder_4',
    char1: 'lucy',
    char2: 'schroeder',
    speaker1Text: 'El día del cumpleaños de Beethoven debería ser fiesta nacional en todo el mundo.',
    speaker2Text: '¡Por fin dices algo con sentido histórico, Lucy!',
    emote1: '🎂',
    emote2: '✨'
  },
  {
    id: 'lucy_schroeder_5',
    char1: 'lucy',
    char2: 'schroeder',
    speaker1Text: 'Pasear por el barrio mientras tocas hace que todo parezca una película romántica.',
    speaker2Text: 'Mientras no interrumpas el allegro con brio, me parece aceptable.',
    emote1: '💖',
    emote2: '🎼'
  },

  // --- Charlie Brown & Linus ---
  {
    id: 'cb_linus_1',
    char1: 'charlie_brown',
    char2: 'linus',
    speaker1Text: '¿Crees que algún día ganaremos un partido de béisbol, Linus?',
    speaker2Text: 'La esperanza, Charlie Brown, es una virtud teologal incombustible.',
    emote1: '⚾',
    emote2: '📖'
  },
  {
    id: 'cb_linus_2',
    char1: 'charlie_brown',
    char2: 'linus',
    speaker1Text: 'Amo este muro. Aquí todo tiene sentido.',
    speaker2Text: 'Es un buen muro. Filosofar con amigos hace la vida ligera.',
    emote1: '🍂',
    emote2: '✨'
  },
  {
    id: 'cb_linus_3',
    char1: 'linus',
    char2: 'charlie_brown',
    speaker1Text: 'Mira el cielo, Charlie Brown. Algún día la Gran Calabaza ascenderá.',
    speaker2Text: 'Te admiro por tener tanta fe en un vegetal, Linus.',
    emote1: '🎃',
    emote2: '🌌'
  },
  {
    id: 'cb_linus_4',
    char1: 'charlie_brown',
    char2: 'linus',
    speaker1Text: 'A veces siento que todo el mundo sabe hacia dónde va menos yo.',
    speaker2Text: 'San Agustín decía que quien busca la verdad ya ha comenzado a encontrarla.',
    emote1: '💭',
    emote2: '📜'
  },
  {
    id: 'cb_linus_5',
    char1: 'charlie_brown',
    char2: 'linus',
    speaker1Text: '¿Por qué no puedes soltar esa manta ni un segundo, Linus?',
    speaker2Text: 'Porque esta manta absorbe las dudas metafísicas del cosmos, Charlie Brown.',
    emote1: '❓',
    emote2: '🛡️'
  },

  // --- Linus & Lucy (Brother & Sister) ---
  {
    id: 'linus_lucy_1',
    char1: 'lucy',
    char2: 'linus',
    speaker1Text: '¡Linus! ¡Tienes siete años y todavía arrastras esa ridícula manta azul!',
    speaker2Text: '¡Los grandes emperadores romanos llevaban mantos, Lucy! Es una cuestión de dignidad.',
    emote1: '📢',
    emote2: '👑'
  },
  {
    id: 'linus_lucy_2',
    char1: 'lucy',
    char2: 'linus',
    speaker1Text: 'Voy a tirar esa manta a la lavadora con lejía hirviendo.',
    speaker2Text: '¡Si tocas mi manta llamaré a las Naciones Unidas por violación de tratados de paz!',
    emote1: '🧼',
    emote2: '🛡️'
  },
  {
    id: 'linus_lucy_3',
    char1: 'lucy',
    char2: 'linus',
    speaker1Text: 'La Gran Calabaza no existe, Linus. Pierdes tu tiempo helándote en el huerto.',
    speaker2Text: '¡No hay nada más noble en el universo que una creencia pura y sincera, Lucy!',
    emote1: '🙄',
    emote2: '🎃'
  },

  // --- Snoopy & Woodstock ---
  {
    id: 'snoopy_woodstock_1',
    char1: 'snoopy',
    char2: 'woodstock',
    speaker1Text: '*Hace señas de aviador ajustándose las gafas contra el viento.*',
    speaker2Text: '¡Piiit, pío! *Aletea simulando una ametralladora Spandau.*',
    emote1: '✈️',
    emote2: '🎯'
  },
  {
    id: 'snoopy_woodstock_2',
    char1: 'snoopy',
    char2: 'woodstock',
    speaker1Text: '*Da un giro de claqué sobre sus patas traseras y ofrece un tazón de comida.*',
    speaker2Text: '¡Pío, pío, piiiit! *Da tres brincos de alegría sobre el sombrero de paja.*',
    emote1: '🥣',
    emote2: '💃'
  },
  {
    id: 'snoopy_woodstock_3',
    char1: 'snoopy',
    char2: 'woodstock',
    speaker1Text: '*Pone cara de misterio y mira las copas de los árboles buscando al Barón Rojo.*',
    speaker2Text: '¡Pi-pi-piit! *Apunta con su ala hacia el horizonte crepuscular.*',
    emote1: '🛩️',
    emote2: '☁️'
  },

  // --- Linus & Sally ---
  {
    id: 'sally_linus_1',
    char1: 'sally',
    char2: 'linus',
    speaker1Text: '¡Hola, mi dulce cariñito! ¡Qué guapo te ves hoy!',
    speaker2Text: '¡Sally! ¡Ya te he dicho mil veces que no me llames así!',
    emote1: '💖',
    emote2: '💧'
  },
  {
    id: 'sally_linus_2',
    char1: 'sally',
    char2: 'linus',
    speaker1Text: '¿Me acompañas a comprar un helado, Linus?',
    speaker2Text: '¡Tengo que vigilar el huerto de la Gran Calabaza!',
    emote1: '🍦',
    emote2: '🎃'
  },
  {
    id: 'sally_linus_3',
    char1: 'sally',
    char2: 'linus',
    speaker1Text: '¿Me ayudas con mi tarea de matemáticas? Eres tan sabio...',
    speaker2Text: 'Las matemáticas exigen disciplina propia, Sally. No te haré la tarea.',
    emote1: '📐',
    emote2: '📚'
  },

  // --- Peppermint Patty & Marcie ---
  {
    id: 'patty_marcie_1',
    char1: 'peppermint_patty',
    char2: 'marcie',
    speaker1Text: '¡Vamos Marcie, corre un par de vueltas a las bases!',
    speaker2Text: 'Si usted lo dice, señor. Aunque prefiero leer a Homero.',
    emote1: '🏃',
    emote2: '📚'
  },
  {
    id: 'patty_marcie_2',
    char1: 'peppermint_patty',
    char2: 'marcie',
    speaker1Text: '¿Hiciste la tarea de historia, Marcie? ¡Se me olvidó!',
    speaker2Text: 'Siempre la hago, señor. Pero debe aprender a no dormirse en clase.',
    emote1: '⚾',
    emote2: '👓'
  },
  {
    id: 'patty_marcie_3',
    char1: 'peppermint_patty',
    char2: 'marcie',
    speaker1Text: '¡Oye Marcie! ¿No crees que Charlie Brown es un chico lindo?',
    speaker2Text: 'Charles es una persona muy distinguida y bondadosa, señor.',
    emote1: '😊',
    emote2: '🌸'
  },

  // --- Peppermint Patty & Charlie Brown ---
  {
    id: 'patty_cb_1',
    char1: 'peppermint_patty',
    char2: 'charlie_brown',
    speaker1Text: '¡Qué hay, chaval! ¡Ponme una bola rápida al centro!',
    speaker2Text: 'Haré lo que pueda, Patty... solo no la saques del parque.',
    emote1: '💪',
    emote2: '⚾'
  },
  {
    id: 'patty_cb_2',
    char1: 'peppermint_patty',
    char2: 'charlie_brown',
    speaker1Text: '¡No te desanimes, Chuck! En el deporte lo que importa es el pundonor.',
    speaker2Text: 'Gracias, Patty. Ojalá el marcador supiera contar el pundonor.',
    emote1: '⭐',
    emote2: '🧢'
  },

  // --- Lucy & Sally ---
  {
    id: 'lucy_sally_1',
    char1: 'lucy',
    char2: 'sally',
    speaker1Text: 'Sally, tienes que aprender a no rogarle tanto a mi hermano Linus.',
    speaker2Text: '¡No le ruego, Lucy! ¡Es una estrategia de asedio romántico a largo plazo!',
    emote1: '👑',
    emote2: '🎀'
  },
  {
    id: 'lucy_sally_2',
    char1: 'lucy',
    char2: 'sally',
    speaker1Text: 'Tener hermanos menores es una carga para el desarrollo intelectual.',
    speaker2Text: '¡Díselo a Charlie Brown! Pasa todo el día suspirando frente al buzón.',
    emote1: '💅',
    emote2: '📬'
  },

  // --- Charlie Brown & Snoopy ---
  {
    id: 'cb_snoopy_1',
    char1: 'charlie_brown',
    char2: 'snoopy',
    speaker1Text: '¡Aquí tienes tu tazón de comida, Snoopy! Croquetas redondas crujientes.',
    speaker2Text: '*Hace un baile acrobático de claqué sobre dos patitas en señal de agradecimiento.*',
    emote1: '🥣',
    emote2: '💃'
  },
  {
    id: 'cb_snoopy_2',
    char1: 'charlie_brown',
    char2: 'snoopy',
    speaker1Text: 'Snoopy, por favor... ¿podrías comportarte como un perro normal aunque sea diez minutos?',
    speaker2Text: '*Se encoge de hombros con una risita canina y se acomoda las gafas de Joe Cool.*',
    emote1: '🐕',
    emote2: '🕶️'
  }
];

// Procedural dynamic topic generators for infinite unique dialogues
const CHILL_TOPICS = [
  { topic: 'otoño', phrases1: ['El viento de otoño tiene un aroma a canela y hojas secas.', 'Me encanta ver cómo caen las hojas doradas por el sendero.'], phrases2: ['Caminar despacio sin prisas es el mayor lujo de esta estación.', 'El otoño nos enseña a soltar lo viejo con elegancia.'] },
  { topic: 'paseo', phrases1: ['Pasear por este barrio siempre me devuelve la paz interior.', 'El aire fresco de la tarde despeja cualquier pensamiento gris.'], phrases2: ['Tienes razón, caminar juntos hace que el día sea verdaderamente chill.', 'Este vecindario tiene una serenidad que no se encuentra en ningún otro lado.'] },
  { topic: 'filosofia', phrases1: ['¿Te has fijado en lo inmenso que es el cielo sobre nuestras cabezas?', 'A veces las preguntas más sencillas son las que esconden mayor belleza.'], phrases2: ['Un viejo sabio decía que la calma del alma es el verdadero hogar.', 'Por eso me gusta detenerme un instante a contemplar los detalles.'] },
  { topic: 'merienda', phrases1: ['Un buen sándwich de mermelada y un vaso de leche templada arreglan cualquier dilema.', '¿No huele como si estuvieran horneando galletas en alguna casa cercana?'], phrases2: ['¡Totalmente de acuerdo! La felicidad se compone de esas pequeñas cosas.', 'El secreto de una vida feliz está en saborear cada bocado con calma.'] },
  { topic: 'musica', phrases1: ['La brisa entre las ramas suena casi como una sonata suave en piano.', 'Escuchar el ritmo de nuestros pasos sobre la acera es relajante.'], phrases2: ['La armonía está en todas partes si uno sabe guardar silencio para escuchar.', 'Una melodía suave al compás de la tarde hace que todo fluya mejor.'] }
];

/**
 * Procedurally generates an infinite, authentic Peanuts social exchange
 * ensuring dialogues never feel repetitive or stale.
 */
function generateDynamicExchange(c1Id: string, c2Id: string): SocialDialoguePair {
  const t = CHILL_TOPICS[Math.floor(Math.random() * CHILL_TOPICS.length)];
  const p1 = t.phrases1[Math.floor(Math.random() * t.phrases1.length)];
  const p2 = t.phrases2[Math.floor(Math.random() * t.phrases2.length)];

  const emotes = ['✨', '🍂', '☕', '💭', '🎵', '⭐', '🌸', '🍃', '🕊️'];
  const e1 = emotes[Math.floor(Math.random() * emotes.length)];
  const e2 = emotes[Math.floor(Math.random() * emotes.length)];

  return {
    id: `dyn_${c1Id}_${c2Id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    char1: c1Id,
    char2: c2Id,
    speaker1Text: p1,
    speaker2Text: p2,
    emote1: e1,
    emote2: e2
  };
}

// Waypoint paths for characters in the neighborhood
// Lucy has an unobstructed, vibrant strolling route through sidewalks and the park
export const CHARACTER_WANDER_ROUTES: Record<string, { x: number; y: number }[]> = {
  charlie_brown: [
    { x: 580, y: 530 }, // Kite tree
    { x: 640, y: 480 }, // Park path
    { x: 720, y: 440 }, // Thinking Wall
    { x: 620, y: 380 }, // Central crossing
    { x: 470, y: 340 }, // Front sidewalk
    { x: 450, y: 300 }, // Charlie's house porch
    { x: 520, y: 380 }, // Sidewalk heading south
    { x: 580, y: 620 }, // Park south
    { x: 620, y: 720 }, // Baseball diamond approach
    { x: 560, y: 620 }, // Return towards kite tree
  ],
  lucy: [
    { x: 1040, y: 360 }, // Psychiatric booth sidewalk
    { x: 960, y: 360 },  // Schroeder house sidewalk
    { x: 880, y: 360 },  // Central residential avenue sidewalk
    { x: 780, y: 420 },  // Brick wall approach
    { x: 730, y: 440 },  // Visiting Linus and Charlie at the Thinking Wall
    { x: 640, y: 480 },  // Park path stroll
    { x: 580, y: 520 },  // Talking to Charlie Brown by the kite tree
    { x: 680, y: 450 },  // Heading back towards the wall
    { x: 820, y: 360 },  // Return east on sidewalk
    { x: 960, y: 360 },  // Approaching Schroeder
    { x: 1040, y: 360 }  // Back in front of psychiatric booth
  ],
  linus: [
    { x: 740, y: 430 }, // Thinking wall post
    { x: 700, y: 440 }, // Walking along the brick wall
    { x: 650, y: 480 }, // Park edge
    { x: 600, y: 530 }, // Visiting Charlie at the tree
    { x: 680, y: 450 }, // Return to brick wall
    { x: 780, y: 440 }, // East end of brick wall
    { x: 760, y: 360 }, // Sidewalk near home
    { x: 740, y: 420 }  // Wall comfort
  ],
  sally: [
    { x: 640, y: 340 }, // Central sidewalk
    { x: 700, y: 360 }, // Looking towards brick wall
    { x: 730, y: 420 }, // Approaching Linus
    { x: 660, y: 380 }, // Skipping back
    { x: 540, y: 340 }, // Sidewalk in front of Charlie's
    { x: 480, y: 310 }, // Porch
    { x: 580, y: 360 }  // Return
  ],
  schroeder: [
    { x: 960, y: 310 }, // Front lawn
    { x: 920, y: 360 }, // Sidewalk
    { x: 860, y: 360 }, // Strolling west
    { x: 820, y: 420 }, // Park bench path
    { x: 900, y: 360 }, // Returning east
    { x: 980, y: 340 }  // Quiet porch corner
  ],
  peppermint_patty: [
    { x: 620, y: 740 }, // Pitcher mound
    { x: 700, y: 720 }, // First base
    { x: 760, y: 780 }, // Second base outfield
    { x: 680, y: 840 }, // Home plate
    { x: 560, y: 780 }, // Third base
    { x: 460, y: 680 }, // Southern road jog
    { x: 520, y: 600 }, // Jogging near park
    { x: 600, y: 700 }  // Back to baseball diamond
  ],
  marcie: [
    { x: 660, y: 750 }, // Near Peppermint Patty
    { x: 700, y: 740 }, // Shady tree reading spot
    { x: 740, y: 790 }, // Following Patty
    { x: 640, y: 820 }, // Dugout bench
    { x: 580, y: 760 }, // Walking gently
    { x: 540, y: 680 }, // Park sidewalk
    { x: 620, y: 720 }  // Return to field
  ],
  snoopy: [
    { x: 360, y: 290 }, // Doghouse yard path
    { x: 450, y: 300 }, // Sidewalk towards Charlie Brown's
    { x: 530, y: 350 }, // Central avenue
    { x: 630, y: 370 }, // Sidewalk east
    { x: 680, y: 430 }, // Park entrance
    { x: 580, y: 490 }, // Kite tree grass
    { x: 480, y: 420 }, // Lawn stroll
    { x: 380, y: 350 }  // Doghouse return
  ]
};

// Internal simulation state tracking per character
interface CharacterSimState {
  waypointIdx: number;
  pauseTimer: number; // seconds remaining to stay paused
  isPaused: boolean;
  socialCooldown: number; // cooldown before initiating another social chat
  activeSocialPartner?: string;
  socialEndTime?: number;
  currentEmote?: string;
}

const simStateMap = new Map<string, CharacterSimState>();

function getOrCreateSimState(id: string, initialIdx: number = 0): CharacterSimState {
  let state = simStateMap.get(id);
  if (!state) {
    state = {
      waypointIdx: initialIdx,
      pauseTimer: Math.random() * 3 + 2, // stagger initial pauses
      isPaused: true,
      socialCooldown: 0
    };
    simStateMap.set(id, state);
  }
  return state;
}

/**
 * Checks if a point collides with any solid collider in the location
 */
function isPositionBlocked(x: number, y: number, colliders: LocationData['colliders']): boolean {
  const pad = 4;
  for (const c of colliders) {
    if (x >= c.x - pad && x <= c.x + c.w + pad && y >= c.y - pad && y <= c.y + c.h + pad) {
      return true;
    }
  }
  return false;
}

/**
 * Updates all characters' autonomous movements and dynamic non-repeating social interactions
 */
export function updateNpcSimulation(
  characters: CharacterNpc[],
  dt: number,
  location: LocationData,
  playerPos: Position
): CharacterNpc[] {
  const now = Date.now();
  const nextList: CharacterNpc[] = characters.map((c) => ({ ...c }));

  // 1. Check for Social Encounters between characters in the same location
  const socialRadius = 60;
  for (let i = 0; i < nextList.length; i++) {
    const c1 = nextList[i];
    if (c1.locationId !== location.id) continue;
    const s1 = getOrCreateSimState(c1.id);
    if (s1.socialCooldown > 0) {
      s1.socialCooldown = Math.max(0, s1.socialCooldown - dt);
    }

    // Check if current social state expired
    if (s1.socialEndTime && now > s1.socialEndTime) {
      s1.socialEndTime = undefined;
      s1.activeSocialPartner = undefined;
      s1.socialCooldown = 10; // 10 seconds cooldown
      c1.socialState = undefined;
      s1.isPaused = false;
    }

    if (s1.activeSocialPartner) continue; // Already talking

    // Look for nearby friend to talk to
    for (let j = i + 1; j < nextList.length; j++) {
      const c2 = nextList[j];
      if (c2.locationId !== location.id) continue;
      const s2 = getOrCreateSimState(c2.id);
      if (s2.activeSocialPartner || s2.socialCooldown > 0) continue;

      const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
      if (dist < socialRadius) {
        // Find matching Peanuts dialogues for this character pair
        const matchingExchanges = PEANUTS_SOCIAL_EXCHANGES.filter(
          (e) =>
            (e.char1 === c1.id && e.char2 === c2.id) ||
            (e.char1 === c2.id && e.char2 === c1.id)
        );

        let exchange: SocialDialoguePair;

        if (matchingExchanges.length > 0) {
          // Filter out recently used exchanges for variety
          const freshExchanges = matchingExchanges.filter(
            (e) => !recentSocialPairIds.has(e.id || `${e.char1}_${e.char2}`)
          );

          if (freshExchanges.length > 0) {
            exchange = freshExchanges[Math.floor(Math.random() * freshExchanges.length)];
          } else {
            // If all hardcoded pool items were recently used, generate a fresh procedural exchange!
            exchange = generateDynamicExchange(c1.id, c2.id);
          }
        } else {
          // No hardcoded pair -> generate a dynamic procedural exchange on the fly!
          exchange = generateDynamicExchange(c1.id, c2.id);
        }

        // Register in memory buffer to guarantee non-repetition
        const exchangeKey = exchange.id || `${exchange.char1}_${exchange.char2}`;
        recentSocialPairIds.add(exchangeKey);
        if (recentSocialPairIds.size > 30) {
          const first = recentSocialPairIds.values().next().value;
          if (first) recentSocialPairIds.delete(first);
        }

        const isNormalOrder = exchange.char1 === c1.id;
        const text1 = isNormalOrder ? exchange.speaker1Text : exchange.speaker2Text;
        const text2 = isNormalOrder ? exchange.speaker2Text : exchange.speaker1Text;
        const emote1 = isNormalOrder ? exchange.emote1 : exchange.emote2;
        const emote2 = isNormalOrder ? exchange.emote2 : exchange.emote1;

        const durationMs = 6500; // 6.5s chat
        s1.activeSocialPartner = c2.id;
        s1.socialEndTime = now + durationMs;
        s1.isPaused = true;

        s2.activeSocialPartner = c1.id;
        s2.socialEndTime = now + durationMs;
        s2.isPaused = true;

        // Face each other
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        c1.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        c2.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : dy > 0 ? 'up' : 'down';

        c1.isMoving = false;
        c2.isMoving = false;

        c1.socialState = {
          partnerId: c2.id,
          partnerName: c2.name,
          text: text1,
          emote: emote1,
          isSpeaker: true
        };

        c2.socialState = {
          partnerId: c1.id,
          partnerName: c1.name,
          text: text2,
          emote: emote2,
          isSpeaker: false
        };
        break;
      }
    }
  }

  // 2. Autonomous Movement for each Character
  for (let i = 0; i < nextList.length; i++) {
    const npc = nextList[i];
    if (npc.locationId !== location.id) continue;

    // Woodstock follows Snoopy closely with happy hops
    if (npc.id === 'woodstock') {
      const snoopy = nextList.find((c) => c.id === 'snoopy');
      if (snoopy) {
        const offsetDist = 18;
        const targetX = snoopy.direction === 'right' ? snoopy.x - offsetDist : snoopy.x + offsetDist;
        const targetY = snoopy.y + (snoopy.direction === 'up' ? 10 : -4);

        const wdx = targetX - npc.x;
        const wdy = targetY - npc.y;
        const wdist = Math.hypot(wdx, wdy);

        if (wdist > 3) {
          const wspeed = Math.min(wdist, 44 * dt);
          npc.x += (wdx / wdist) * wspeed;
          npc.y += (wdy / wdist) * wspeed;
          npc.isMoving = true;
          npc.walkStep = ((npc.walkStep || 0) + dt * 10) % (Math.PI * 2);
          npc.direction = snoopy.direction;
        } else {
          npc.isMoving = false;
          npc.direction = snoopy.direction;
        }
      }
      continue;
    }

    const sim = getOrCreateSimState(npc.id, i % 3);

    // If socializing, remain facing partner
    if (sim.activeSocialPartner) {
      npc.isMoving = false;
      continue;
    }

    // Check Ari (Player) proximity awareness (< 44px)
    const distToPlayer = Math.hypot(playerPos.x - npc.x, playerPos.y - npc.y);
    if (distToPlayer < 44 && !sim.activeSocialPartner) {
      // Pause gently and face player with friendly attention
      const pdx = playerPos.x - npc.x;
      const pdy = playerPos.y - npc.y;
      npc.direction = Math.abs(pdx) > Math.abs(pdy) ? (pdx > 0 ? 'right' : 'left') : pdy > 0 ? 'down' : 'up';
      npc.isMoving = false;
      continue;
    }

    // If currently paused in idle routine
    if (sim.isPaused) {
      sim.pauseTimer -= dt;
      npc.isMoving = false;

      // Occasional gentle head-turn when looking around idle
      if (Math.random() < 0.015) {
        const dirs: ('down' | 'up' | 'left' | 'right')[] = ['down', 'left', 'right', 'up'];
        npc.direction = dirs[Math.floor(Math.random() * dirs.length)];
      }

      if (sim.pauseTimer <= 0) {
        sim.isPaused = false;
        // Advance waypoint
        const route = CHARACTER_WANDER_ROUTES[npc.id];
        if (route && route.length > 0) {
          sim.waypointIdx = (sim.waypointIdx + 1) % route.length;
        }
      }
      continue;
    }

    // Walking routine along waypoints
    const route = CHARACTER_WANDER_ROUTES[npc.id];
    if (!route || route.length === 0) {
      npc.isMoving = false;
      continue;
    }

    const target = route[sim.waypointIdx % route.length];
    const dx = target.x - npc.x;
    const dy = target.y - npc.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 6) {
      // Reached waypoint: pause comfortably
      sim.isPaused = true;
      sim.pauseTimer = Math.random() * 3 + 2.5; // pause 2.5s - 5.5s
      npc.isMoving = false;
    } else {
      // Walk towards target at natural, chill stroll speed (28 px/s)
      const speed = 28 * dt;
      const stepX = (dx / dist) * speed;
      const stepY = (dy / dist) * speed;

      const nextX = npc.x + stepX;
      const nextY = npc.y + stepY;

      // Check collision
      if (!isPositionBlocked(nextX, nextY, location.colliders)) {
        npc.x = nextX;
        npc.y = nextY;
        npc.isMoving = true;
        npc.walkStep = ((npc.walkStep || 0) + dt * 7.5) % (Math.PI * 2);

        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          npc.direction = dx > 0 ? 'right' : 'left';
        } else {
          npc.direction = dy > 0 ? 'down' : 'up';
        }
      } else {
        // If blocked, advance to next waypoint to prevent getting stuck
        sim.waypointIdx = (sim.waypointIdx + 1) % route.length;
        sim.isPaused = true;
        sim.pauseTimer = 1.0;
        npc.isMoving = false;
      }
    }
  }

  return nextList;
}
