import { LocationData, LocationId } from '../types';

export const LOCATIONS_DATA: Record<LocationId, LocationData> = {
  neighborhood: {
    id: 'neighborhood',
    name: 'El Barrio Residencial',
    category: 'exterior',
    width: 1400,
    height: 1000,
    backgroundTheme: '#86EFAC',
    ambientSound: 'neighborhood_breeze',
    lightingType: 'outdoor',
    spawnPoint: { x: 190, y: 310 }, // Outside Ari's house
    description: 'Calles arboladas, vallas de madera blanca y los hogares de toda la pandilla de Peanuts.',
    colliders: [
      // Outer boundaries with natural openings for on-foot exploration trails
      { x: 0, y: 0, w: 470, h: 40 }, // North boundary west of Summer Camp trail
      { x: 550, y: 0, w: 850, h: 40 }, // North boundary east of Summer Camp trail
      { x: 0, y: 0, w: 40, h: 670 }, // West boundary north of Daisy Hill road
      { x: 0, y: 740, w: 40, h: 260 }, // West boundary south of Daisy Hill road
      { x: 1360, y: 0, w: 40, h: 320 }, // East boundary north of Lake trail
      { x: 1360, y: 400, w: 40, h: 265 }, // East boundary between Lake & Beach trails
      { x: 1360, y: 745, w: 40, h: 255 }, // East boundary south of Beach trail
      { x: 0, y: 960, w: 610, h: 40 }, // South boundary west of Baseball path
      { x: 710, y: 960, w: 690, h: 40 }, // South boundary east of Baseball path
      // Casa de Ari (exterior block)
      { x: 100, y: 120, w: 160, h: 140 },
      // Casa de Charlie Brown & Sally (exterior block)
      { x: 380, y: 120, w: 180, h: 140 },
      // Caseta de Snoopy (small solid footprint)
      { x: 330, y: 190, w: 50, h: 45 },
      // Casa de Lucy, Linus y Rerun
      { x: 680, y: 120, w: 170, h: 140 },
      // Casa de Schroeder
      { x: 920, y: 120, w: 150, h: 140 },
      // Casa de Peppermint Patty (southwest)
      { x: 100, y: 760, w: 150, h: 140 },
      // Casa de Marcie (southwest lane)
      { x: 300, y: 760, w: 150, h: 140 },
      // Casa de Franklin
      { x: 520, y: 760, w: 150, h: 140 },
      // Casa de Pig-Pen
      { x: 1150, y: 760, w: 150, h: 140 },
      // Escuela Primaria (brick building)
      { x: 80, y: 440, w: 200, h: 160 },
      // Muro de ladrillo (solid low wall)
      { x: 715, y: 418, w: 150, h: 26 },
      // Árbol de las cometas (Kite-Eating Tree: solid trunk and root base blocks walking inside)
      { x: 535, y: 410, w: 105, h: 110 },
      // Peanuts Trees (Solid tree trunk & root footprints so player cannot walk inside any tree)
      { x: 35, y: 155, w: 50, h: 55 },
      { x: 255, y: 225, w: 50, h: 55 },
      { x: 595, y: 195, w: 50, h: 55 },
      { x: 855, y: 215, w: 50, h: 55 },
      { x: 860, y: 425, w: 60, h: 60 },
      { x: 35, y: 545, w: 50, h: 55 },
      { x: 545, y: 825, w: 50, h: 55 },
      { x: 1055, y: 715, w: 50, h: 55 },
      { x: 1155, y: 815, w: 50, h: 55 },
      // Street Lamps (Pedestrian light poles)
      { x: 214, y: 295, w: 12, h: 18 },
      { x: 514, y: 295, w: 12, h: 18 },
      { x: 834, y: 295, w: 12, h: 18 },
      { x: 1114, y: 295, w: 12, h: 18 },
      { x: 454, y: 635, w: 12, h: 18 },
      { x: 214, y: 720, w: 12, h: 18 },
      { x: 414, y: 720, w: 12, h: 18 },
      // Pista de patinaje (Solid timber dasher boards with authentic entrance gate opening on west side)
      { x: 940, y: 440, w: 220, h: 18 },
      { x: 940, y: 590, w: 220, h: 18 },
      { x: 1142, y: 440, w: 18, h: 168 },
      { x: 940, y: 440, w: 18, h: 65 },
      { x: 940, y: 545, w: 18, h: 63 },
      { x: 1115, y: 575, w: 42, h: 25 },
      { x: 910, y: 550, w: 20, h: 20 },
      // Baseball park structures
      { x: 642, y: 814, w: 76, h: 25 },
      { x: 746, y: 774, w: 36, h: 16 },
      { x: 594, y: 776, w: 42, h: 22 },
      // Lucy's psychiatric booth (precise solid wooden counter footprint)
      { x: 1040, y: 285, w: 50, h: 26 }
    ],
    triggers: [
      // Doors to houses
      {
        id: 'door_ari',
        name: 'Casa de Ari',
        x: 170,
        y: 260,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa',
        actionType: 'door_enter',
        targetLocation: 'house_ari',
        targetPosition: { x: 180, y: 380 }
      },
      {
        id: 'door_charlie_brown',
        name: 'Casa de Charlie Brown',
        x: 450,
        y: 260,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa',
        actionType: 'door_enter',
        targetLocation: 'house_charlie_brown',
        targetPosition: { x: 260, y: 390 }
      },
      {
        id: 'doghouse_door',
        name: 'Caseta de Snoopy',
        x: 335,
        y: 235,
        w: 40,
        h: 25,
        promptB: 'B - Entrar a la caseta mágica',
        actionType: 'door_enter',
        targetLocation: 'doghouse_interior',
        targetPosition: { x: 300, y: 420 }
      },
      {
        id: 'door_van_pelt',
        name: 'Casa de los Van Pelt',
        x: 745,
        y: 260,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa',
        actionType: 'door_enter',
        targetLocation: 'house_van_pelt',
        targetPosition: { x: 240, y: 380 }
      },
      {
        id: 'door_schroeder',
        name: 'Casa de Schroeder',
        x: 980,
        y: 260,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a la sala de música',
        actionType: 'door_enter',
        targetLocation: 'house_schroeder',
        targetPosition: { x: 240, y: 360 }
      },
      {
        id: 'door_peppermint_patty',
        name: 'Casa de Peppermint Patty',
        x: 160,
        y: 900,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa',
        actionType: 'door_enter',
        targetLocation: 'house_peppermint_patty',
        targetPosition: { x: 220, y: 370 }
      },
      {
        id: 'door_marcie',
        name: 'Casa de Marcie',
        x: 360,
        y: 900,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa',
        actionType: 'door_enter',
        targetLocation: 'house_marcie',
        targetPosition: { x: 220, y: 370 }
      },
      {
        id: 'door_franklin',
        name: 'Casa de Franklin',
        x: 580,
        y: 900,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa de Franklin',
        actionType: 'door_enter',
        targetLocation: 'house_franklin',
        targetPosition: { x: 220, y: 370 }
      },
      {
        id: 'door_pigpen',
        name: 'Casa de Pig-Pen',
        x: 1210,
        y: 900,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a casa de Pig-Pen',
        actionType: 'door_enter',
        targetLocation: 'house_pigpen',
        targetPosition: { x: 220, y: 370 }
      },
      // Caminos y senderos a pie hacia todos los lugares del mundo
      {
        id: 'trail_to_lake',
        name: 'Sendero Este hacia el Lago Sereno',
        x: 1330,
        y: 340,
        w: 60,
        h: 55,
        promptA: 'A - Caminar hacia el Lago Sereno',
        actionType: 'door_enter',
        targetLocation: 'lake',
        targetPosition: { x: 60, y: 380 }
      },
      {
        id: 'trail_to_beach',
        name: 'Camino Costero hacia la Playa Dorada',
        x: 1330,
        y: 680,
        w: 60,
        h: 55,
        promptA: 'A - Caminar hacia la Playa Dorada',
        actionType: 'door_enter',
        targetLocation: 'beach',
        targetPosition: { x: 80, y: 400 }
      },
      {
        id: 'trail_to_daisy_hill',
        name: 'Carretera Oeste hacia Daisy Hill Puppy Farm',
        x: 10,
        y: 680,
        w: 60,
        h: 55,
        promptA: 'A - Caminar a la Granja Daisy Hill',
        actionType: 'door_enter',
        targetLocation: 'daisy_hill',
        targetPosition: { x: 420, y: 600 }
      },
      {
        id: 'trail_to_summer_camp',
        name: 'Sendero Norte al Campamento de Verano',
        x: 480,
        y: 10,
        w: 65,
        h: 40,
        promptA: 'A - Tomar el sendero al Campamento de Verano',
        actionType: 'door_enter',
        targetLocation: 'summer_camp',
        targetPosition: { x: 170, y: 700 }
      },
      {
        id: 'trail_to_baseball',
        name: 'Acceso a pie al Campo de Béisbol Sandlot',
        x: 630,
        y: 935,
        w: 70,
        h: 30,
        promptA: 'A - Entrar al Campo de Béisbol Sandlot',
        actionType: 'door_enter',
        targetLocation: 'baseball_field',
        targetPosition: { x: 500, y: 700 }
      },
      {
        id: 'door_school',
        name: 'Escuela Primaria',
        x: 160,
        y: 600,
        w: 50,
        h: 30,
        promptA: 'A - Entrar a la escuela',
        actionType: 'door_enter',
        targetLocation: 'school',
        targetPosition: { x: 300, y: 440 }
      },
      // Special interactive spots
      {
        id: 'think_wall_trigger',
        name: 'El Muro de Pensar',
        x: 720,
        y: 440,
        w: 140,
        h: 35,
        promptB: 'B - Sentarse a pensar',
        actionType: 'think_wall'
      },
      {
        id: 'lucy_booth_trigger',
        name: 'Consultorio de Lucy (5¢)',
        x: 1040,
        y: 340,
        w: 60,
        h: 35,
        promptA: 'A - Consulta psiquiátrica (5¢)',
        actionType: 'lucy_booth'
      },
      {
        id: 'kite_tree_trigger',
        name: 'El Árbol de las Cometas',
        x: 575,
        y: 505,
        w: 65,
        h: 40,
        promptB: 'B - Examinar cometas atrapadas',
        actionType: 'kite_tree',
        examineTitle: 'El Árbol que se come las cometas',
        examineText: 'Dos cometas de Charlie Brown ondean atrapadas entre las ramas más altas en el parque. El árbol parece guardar silencio con paciente satisfacción.'
      },
      {
        id: 'baseball_field_trigger',
        name: 'Campo de Béisbol',
        x: 620,
        y: 720,
        w: 80,
        h: 50,
        promptA: 'A - Jugar al Béisbol con Charlie Brown',
        actionType: 'baseball_bat',
        examineTitle: 'El Montículo de Charlie Brown',
        examineText: 'Un pequeño diamante de tierra de barrio. Aquí Charlie Brown entrena bajo el sol con su eterna fe en ganar su primer partido.'
      },
      {
        id: 'ice_rink_trigger',
        name: 'Pista de Hielo y Nieve',
        x: 1010,
        y: 500,
        w: 70,
        h: 50,
        promptA: 'A - Patinar en la Nieve con Snoopy',
        actionType: 'skate',
        examineTitle: 'Pista de patinaje del barrio',
        examineText: 'Una superficie lisa y cristalina rodeada por barandas de madera. Snoopy, Peppermint Patty y Linus patinan aquí.'
      },
      {
        id: 'neighborhood_pumpkin_garden_trigger',
        name: 'El Huerto de Calabazas de Linus',
        x: 740,
        y: 480,
        w: 70,
        h: 45,
        promptA: 'A - Huerto de Calabazas (Sembrar/Regalar)',
        actionType: 'pumpkin_farm',
        examineTitle: 'Huerto de Calabazas del Barrio',
        examineText: 'Un rincón fértil de tierra negra donde crecen hermosas calabazas anaranjadas. Puedes sembrar semillas, regarlas, cosecharlas y regalarlas a tus amigos.'
      },
      // Mailboxes
      {
        id: 'mailbox_ari',
        name: 'Buzón de Correspondencia de Ari',
        x: 140,
        y: 280,
        w: 25,
        h: 25,
        promptA: 'E - Revisar correspondencia',
        actionType: 'examine',
        examineTitle: 'Buzón de Correspondencia de Ari',
        examineText: 'Un icónico buzón postal de Peanuts. Has recibido la tira cómica dominical y una alegre carta de tus amigos. (Puedes guardar tu partida en cualquier momento desde el botón [Guardar] superior).'
      },
      {
        id: 'mailbox_charlie',
        name: 'Buzón de Charlie Brown',
        x: 420,
        y: 280,
        w: 25,
        h: 25,
        promptA: 'A - Ver buzón',
        actionType: 'examine',
        examineTitle: 'Buzón de Charlie Brown',
        examineText: 'Esperando ansiosamente tarjetas de San Valentín o cartas de admiradores... pero por ahora solo hay un folleto de béisbol.'
      },
      // Park Benches
      {
        id: 'bench_park_1',
        name: 'Banco de madera',
        x: 580,
        y: 340,
        w: 45,
        h: 25,
        promptB: 'B - Sentarse a escribir',
        actionType: 'desk_write'
      },
      {
        id: 'bench_park_2',
        name: 'Banco bajo los arces',
        x: 880,
        y: 430,
        w: 45,
        h: 25,
        promptB: 'B - Sentarse a contemplar',
        actionType: 'sit'
      },
      // Bus stop to Summer Camp
      {
        id: 'bus_stop_camp',
        name: 'Parada de Autobús al Campamento',
        x: 480,
        y: 710,
        w: 60,
        h: 30,
        promptA: 'A - Tomar el autobús al Campamento de Verano',
        actionType: 'door_enter',
        targetLocation: 'summer_camp',
        targetPosition: { x: 170, y: 720 }
      },
      // Natural path to the Beach
      {
        id: 'path_to_beach',
        name: 'Camino Costero hacia la Playa',
        x: 1080,
        y: 740,
        w: 70,
        h: 40,
        promptA: 'A - Ir por las dunas hacia la Playa Dorada',
        actionType: 'door_enter',
        targetLocation: 'beach',
        targetPosition: { x: 620, y: 760 }
      }
    ]
  },

  // 2. CASA DE ARI
  house_ari: {
    id: 'house_ari',
    name: 'Casa de Ari',
    category: 'interior',
    width: 600,
    height: 460,
    backgroundTheme: '#FEF3C7',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 180, y: 380 },
    description: 'Un hogar cálido y acogedor con tu escritorio de escribir, tu cama cómoda, tu cocina y tus libros favoritos.',
    colliders: [
      // Outer walls
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 460 },
      { x: 560, y: 0, w: 40, h: 460 },
      { x: 0, y: 420, w: 600, h: 40 },
      // Interior partition walls
      { x: 260, y: 50, w: 15, h: 180 }, // divider between living and bedroom
      { x: 380, y: 230, w: 15, h: 190 }, // bathroom divider
      // Furniture colliders
      { x: 60, y: 70, w: 110, h: 50 }, // Salón sofa
      { x: 190, y: 70, w: 55, h: 55 }, // Armchair
      { x: 300, y: 70, w: 75, h: 90 }, // Bed
      { x: 420, y: 70, w: 80, h: 45 }, // Writing desk!
      { x: 50, y: 250, w: 120, h: 45 }, // Kitchen counter
      { x: 180, y: 250, w: 45, h: 50 } // Fridge
    ],
    triggers: [
      {
        id: 'door_ari_exit',
        name: 'Salir al barrio',
        x: 160,
        y: 410,
        w: 50,
        h: 25,
        promptA: 'E - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 170, y: 295 }
      },
      {
        id: 'ari_writing_desk',
        name: 'Escritorio de Ari',
        x: 420,
        y: 110,
        w: 80,
        h: 40,
        promptA: 'E - Examinar escritorio',
        promptB: 'B - Abrir Cuaderno de Notas',
        actionType: 'desk_write',
        examineTitle: 'Escritorio de Ari',
        examineText: 'Un escritorio de roble con lámpara verde, pluma y papel de cartas. Pulsa [B] o [Q] para redactar en tu cuaderno de notas.'
      },
      {
        id: 'ari_bed',
        name: 'Cama acogedora de Ari',
        x: 300,
        y: 150,
        w: 75,
        h: 40,
        promptA: 'E - Examinar cama',
        promptB: 'B - Dormir hasta el amanecer',
        actionType: 'bed_rest',
        examineTitle: 'Cama de Ari',
        examineText: 'Una manta suave de lana y almohadas mullidas. Pulsa [B] o [Q] para descansar plácidamente hasta el amanecer del día siguiente.'
      },
      {
        id: 'ari_fridge',
        name: 'Nevera de la cocina',
        x: 180,
        y: 290,
        w: 45,
        h: 30,
        promptA: 'A - Abrir nevera',
        actionType: 'fridge',
        examineTitle: 'Nevera',
        examineText: 'Jugo de manzana fresco, sándwiches de mantequilla de cacahuete y un plato de frutas de temporada.'
      },
      {
        id: 'ari_sink',
        name: 'Fregadero',
        x: 110,
        y: 290,
        w: 40,
        h: 30,
        promptA: 'A - Servirse un vaso de agua',
        actionType: 'sink',
        examineTitle: 'Fregadero',
        examineText: 'Te sirves un vaso de agua fresca y cristalina. ¡Qué alivio!'
      },
      {
        id: 'ari_sofa',
        name: 'Sofá del salón',
        x: 80,
        y: 115,
        w: 80,
        h: 35,
        promptB: 'B - Sentarse en el sofá',
        actionType: 'sit'
      }
    ]
  },

  // 3. CASA DE CHARLIE BROWN Y SALLY
  house_charlie_brown: {
    id: 'house_charlie_brown',
    name: 'Casa de Charlie Brown y Sally',
    category: 'interior',
    width: 650,
    height: 480,
    backgroundTheme: '#FDE68A',
    ambientSound: 'vintage_home',
    lightingType: 'cozy',
    spawnPoint: { x: 260, y: 390 },
    description: 'El clásico hogar de Charlie Brown: salón con TV y teléfono de disco, cocina de Acción de Gracias y dormitorios personales.',
    colliders: [
      { x: 0, y: 0, w: 650, h: 50 },
      { x: 0, y: 0, w: 40, h: 480 },
      { x: 610, y: 0, w: 40, h: 480 },
      { x: 0, y: 440, w: 650, h: 40 },
      // Hallway dividers
      { x: 320, y: 50, w: 15, h: 180 },
      // Salón furniture
      { x: 70, y: 80, w: 120, h: 45 }, // Sofa
      { x: 210, y: 80, w: 50, h: 45 }, // Armchair
      { x: 70, y: 220, w: 50, h: 40 }, // Classic CRT Television
      { x: 140, y: 220, w: 40, h: 35 }, // Telephone table
      // Charlie Brown room (top right)
      { x: 360, y: 70, w: 75, h: 90 }, // CB Bed
      { x: 460, y: 70, w: 70, h: 40 }, // CB Desk with baseball glove
      // Sally room (bottom right)
      { x: 360, y: 290, w: 75, h: 85 } // Sally Pink Bed
    ],
    triggers: [
      {
        id: 'door_cb_exit',
        name: 'Salir al jardín delantero',
        x: 240,
        y: 430,
        w: 50,
        h: 25,
        promptA: 'A - Salir al jardín',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 450, y: 290 }
      },
      {
        id: 'cb_tv',
        name: 'Televisión clásica',
        x: 70,
        y: 255,
        w: 50,
        h: 30,
        promptA: 'A - Encender televisión',
        actionType: 'examine',
        examineTitle: 'Televisión del salón',
        examineText: 'Sally estaba viendo dibujos animados. La pantalla emite una cálida luz en blanco y negro.'
      },
      {
        id: 'cb_phone',
        name: 'Teléfono de disco',
        x: 140,
        y: 250,
        w: 40,
        h: 30,
        promptA: 'A - Levantar teléfono',
        actionType: 'examine',
        examineTitle: 'Teléfono de disco',
        examineText: 'Se escucha una voz de trompeta apagada que dice: "Wah-wah-wah-wah..." ¡Debe ser la profesora llamando a casa!'
      },
      {
        id: 'cb_baseball_glove',
        name: 'Guante de béisbol de Charlie Brown',
        x: 460,
        y: 110,
        w: 70,
        h: 35,
        promptA: 'A - Examinar guante',
        actionType: 'examine',
        examineTitle: 'Guante gastado de Charlie Brown',
        examineText: 'Un guante de cuero bien engrasado y una pelota de béisbol con costuras rojas firmadas con el lema: "Nunca te rindas".'
      },
      {
        id: 'sally_toys',
        name: 'Juguetes de Sally',
        x: 460,
        y: 330,
        w: 60,
        h: 40,
        promptA: 'A - Ver dibujos y juguetes',
        actionType: 'examine',
        examineTitle: 'Rincón de Sally',
        examineText: 'Dibujos de corazones dedicados a su "dulce babbo" Linus y muñecas cuidadosamente peinadas.'
      }
    ]
  },

  // 4. CASETA DE SNOOPY (INTERIOR IMPOSIBLE)
  doghouse_interior: {
    id: 'doghouse_interior',
    name: 'El Interior Imposible de la Caseta de Snoopy',
    category: 'interior',
    width: 800,
    height: 560,
    backgroundTheme: '#312E81',
    ambientSound: 'snoopy_jazz',
    lightingType: 'cozy',
    spawnPoint: { x: 300, y: 440 },
    description: 'Por fuera es una modesta caseta roja para un beagle; por dentro, una mansión imposible repleta de libros, discos de jazz, billar y recuerdos de sus vidas pasadas.',
    colliders: [
      { x: 0, y: 0, w: 800, h: 50 },
      { x: 0, y: 0, w: 40, h: 560 },
      { x: 760, y: 0, w: 40, h: 560 },
      { x: 0, y: 520, w: 800, h: 40 },
      // Grand room dividers
      { x: 280, y: 50, w: 15, h: 220 }, // library wall
      { x: 520, y: 50, w: 15, h: 220 }, // music room wall
      // Grand velvet armchair & fireplace
      { x: 120, y: 70, w: 90, h: 50 },
      // Huge bookshelves
      { x: 320, y: 60, w: 170, h: 45 },
      // Vinyl hi-fi sound system
      { x: 570, y: 60, w: 150, h: 50 },
      // Ping-pong table in lower left
      { x: 80, y: 350, w: 120, h: 70 },
      // Flying Ace trophy display
      { x: 560, y: 360, w: 140, h: 50 }
    ],
    triggers: [
      {
        id: 'door_doghouse_exit',
        name: 'Salir de la caseta',
        x: 280,
        y: 505,
        w: 60,
        h: 25,
        promptB: 'B - Salir al jardín de Charlie Brown',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 350, y: 265 }
      },
      {
        id: 'snoopy_stereo',
        name: 'Equipo de música de alta fidelidad',
        x: 580,
        y: 110,
        w: 80,
        h: 35,
        promptA: 'A - Poner disco de Vince Guaraldi',
        actionType: 'record_player',
        examineTitle: 'Colección de Vinilos de Snoopy',
        examineText: 'Un tocadiscos de caoba hace girar un vinilo de jazz suave. Snoopy tiene una colección impecable de bossa nova y música clásica.'
      },
      {
        id: 'snoopy_library',
        name: 'Biblioteca imposible',
        x: 350,
        y: 105,
        w: 110,
        h: 35,
        promptA: 'A - Examinar libros raros',
        actionType: 'bookshelf',
        examineTitle: 'Biblioteca secreta de Snoopy',
        examineText: 'Ediciones encuadernadas en piel de León Tolstói, Herman Melville y los manuscritos mecanografiados de: "Era una noche oscura y tormentosa".'
      },
      {
        id: 'snoopy_typewriter',
        name: 'Máquina de escribir de Snoopy',
        x: 370,
        y: 340,
        w: 70,
        h: 40,
        promptB: 'B - Escribir un relato con Snoopy',
        actionType: 'desk_write'
      },
      {
        id: 'snoopy_trophies',
        name: 'Almacén del As de la Aviación',
        x: 570,
        y: 410,
        w: 90,
        h: 35,
        promptA: 'A - Ver trofeos del Barón Rojo',
        actionType: 'examine',
        examineTitle: 'Trofeos del As de la Primera Guerra Mundial',
        examineText: 'Gafas de piloto, una bufanda de seda roja, raquetas de Wimbledon y una mención honorífica de la Escuela de Obediencia Ace.'
      },
      {
        id: 'snoopy_pingpong',
        name: 'Mesa de Ping-Pong',
        x: 100,
        y: 420,
        w: 80,
        h: 35,
        promptA: 'A - Examinar mesa de recreo',
        actionType: 'examine',
        examineTitle: 'Mesa de Ping-Pong reglamentaria',
        examineText: 'Woodstock y Snoopy disputan torneos épicos aquí en las noches de lluvia.'
      }
    ]
  },

  // 5. CASA DE LUCY, LINUS Y RERUN
  house_van_pelt: {
    id: 'house_van_pelt',
    name: 'Casa de los Van Pelt',
    category: 'interior',
    width: 640,
    height: 460,
    backgroundTheme: '#E0E7FF',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 240, y: 380 },
    description: 'La vivienda de Lucy y Linus: salón ordenado, el dormitorio reflexivo de Linus con su manta y la habitación impecable de Lucy.',
    colliders: [
      { x: 0, y: 0, w: 640, h: 50 },
      { x: 0, y: 0, w: 40, h: 460 },
      { x: 600, y: 0, w: 40, h: 460 },
      { x: 0, y: 420, w: 640, h: 40 },
      { x: 320, y: 50, w: 15, h: 200 },
      // Salón furniture
      { x: 70, y: 80, w: 110, h: 45 },
      // Linus room (left top)
      { x: 70, y: 260, w: 75, h: 80 }, // Linus bed
      { x: 170, y: 260, w: 60, h: 40 }, // Linus desk
      // Lucy room (right top)
      { x: 360, y: 80, w: 75, h: 85 }, // Lucy bed
      { x: 470, y: 80, w: 60, h: 45 } // Lucy vanity mirror
    ],
    triggers: [
      {
        id: 'door_van_pelt_exit',
        name: 'Salir al barrio',
        x: 220,
        y: 410,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 745, y: 290 }
      },
      {
        id: 'linus_blanket_stand',
        name: 'Manta de seguridad de Linus',
        x: 170,
        y: 300,
        w: 50,
        h: 35,
        promptA: 'A - Examinar rincón de Linus',
        actionType: 'examine',
        examineTitle: 'La Manta Azul de Linus',
        examineText: 'Linus guarda aquí un tomo sobre teología medieval y una manta azul suave que huele a infancia y serenidad.'
      },
      {
        id: 'lucy_mirror',
        name: 'Espejo de Lucy',
        x: 470,
        y: 125,
        w: 50,
        h: 30,
        promptA: 'A - Mirar al espejo',
        actionType: 'examine',
        examineTitle: 'Espejo de Lucy',
        examineText: 'Un cartelito dice: "La reina de la casa está de servicio. Recuerda practicar tu sonrisa autoritaria hoy".'
      },
      {
        id: 'van_pelt_sofa',
        name: 'Sofá de la sala familiar',
        x: 70,
        y: 120,
        w: 80,
        h: 35,
        promptB: 'B - Sentarse en el sofá',
        actionType: 'sit'
      }
    ]
  },

  // 6. CASA / ESPACIO DE SCHROEDER
  house_schroeder: {
    id: 'house_schroeder',
    name: 'Espacio de Música de Schroeder',
    category: 'interior',
    width: 600,
    height: 440,
    backgroundTheme: '#FEF2F2',
    ambientSound: 'schroeder_piano',
    lightingType: 'cozy',
    spawnPoint: { x: 240, y: 360 },
    description: 'El santuario musical de Schroeder: presidido por su piano de juguete rojo, partituras inmortales y el busto de Ludwig van Beethoven.',
    colliders: [
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 440 },
      { x: 560, y: 0, w: 40, h: 440 },
      { x: 0, y: 400, w: 600, h: 40 },
      // Piano & stool
      { x: 220, y: 130, w: 90, h: 55 },
      // Beethoven bust & library
      { x: 380, y: 70, w: 120, h: 50 },
      { x: 70, y: 70, w: 100, h: 45 }
    ],
    triggers: [
      {
        id: 'door_schroeder_exit',
        name: 'Salir al barrio',
        x: 220,
        y: 390,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 980, y: 290 }
      },
      {
        id: 'schroeder_toy_piano',
        name: 'El piano rojo de juguete',
        x: 220,
        y: 185,
        w: 90,
        h: 40,
        promptB: 'B - Tocar el piano con Schroeder',
        actionType: 'schroeder_piano'
      },
      {
        id: 'beethoven_bust',
        name: 'Busto de Beethoven',
        x: 400,
        y: 120,
        w: 60,
        h: 35,
        promptA: 'A - Contemplar el busto de Beethoven',
        actionType: 'examine',
        examineTitle: 'Homenaje a Ludwig van Beethoven',
        examineText: 'Un busto de piedra de Beethoven rodeado de velas y partituras de la Sonata Patética y la Novena Sinfonía.'
      }
    ]
  },

  // 7. CASA DE PEPPERMINT PATTY
  house_peppermint_patty: {
    id: 'house_peppermint_patty',
    name: 'Casa de Peppermint Patty',
    category: 'interior',
    width: 600,
    height: 440,
    backgroundTheme: '#D1FAE5',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 220, y: 370 },
    description: 'Hogar informal y dinámico decorado con banderines deportivos, bates de béisbol y medallas atléticas.',
    colliders: [
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 440 },
      { x: 560, y: 0, w: 40, h: 440 },
      { x: 0, y: 400, w: 600, h: 40 },
      { x: 280, y: 50, w: 15, h: 180 },
      { x: 60, y: 80, w: 110, h: 45 },
      { x: 330, y: 80, w: 75, h: 85 }
    ],
    triggers: [
      {
        id: 'door_pp_exit',
        name: 'Salir al barrio',
        x: 200,
        y: 390,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 160, y: 860 }
      },
      {
        id: 'patty_sports_rack',
        name: 'Material deportivo',
        x: 430,
        y: 110,
        w: 70,
        h: 35,
        promptA: 'A - Ver trofeos y bates',
        actionType: 'examine',
        examineTitle: 'Rincón de trofeos de Peppermint Patty',
        examineText: 'Bates desgastados por innumerables cuadrangulares, zapatillas de atletismo y banderines de campeonatos escolares.'
      },
      {
        id: 'patty_couch',
        name: 'Sofá de Peppermint Patty',
        x: 60,
        y: 120,
        w: 80,
        h: 35,
        promptB: 'B - Tirarse en el sofá a descansar',
        actionType: 'sit'
      }
    ]
  },

  // 8. CASA DE MARCIE
  house_marcie: {
    id: 'house_marcie',
    name: 'Casa de Marcie',
    category: 'interior',
    width: 600,
    height: 440,
    backgroundTheme: '#EDE9FE',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 220, y: 370 },
    description: 'Un hogar tranquilo, ordenado y silencioso, repleto de estanterías hasta el techo y un escritorio de estudio meticuloso.',
    colliders: [
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 440 },
      { x: 560, y: 0, w: 40, h: 440 },
      { x: 0, y: 400, w: 600, h: 40 },
      { x: 280, y: 50, w: 15, h: 180 },
      { x: 60, y: 70, w: 120, h: 50 },
      { x: 330, y: 70, w: 75, h: 85 },
      { x: 430, y: 70, w: 80, h: 45 }
    ],
    triggers: [
      {
        id: 'door_marcie_exit',
        name: 'Salir al barrio',
        x: 200,
        y: 390,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 360, y: 860 }
      },
      {
        id: 'marcie_books',
        name: 'Estantería de literatura clásica',
        x: 70,
        y: 120,
        w: 90,
        h: 35,
        promptA: 'A - Consultar enciclopedia',
        actionType: 'bookshelf',
        examineTitle: 'Biblioteca personal de Marcie',
        examineText: 'Marcie tiene colecciones de poesía de Emily Dickinson, ensayos de filosofía y una libreta de notas con apuntes impecables.'
      },
      {
        id: 'marcie_reading_chair',
        name: 'Sillón de lectura',
        x: 65,
        y: 120,
        w: 60,
        h: 35,
        promptB: 'B - Sentarse a leer con calma',
        actionType: 'sit'
      }
    ]
  },

  // 9. CASA DE FRANKLIN
  house_franklin: {
    id: 'house_franklin',
    name: 'Casa de Franklin',
    category: 'interior',
    width: 600,
    height: 440,
    backgroundTheme: '#EFF6FF',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 220, y: 370 },
    description: 'Hogar cálido y distinguido. Tablero de ajedrez sobre madera noble, estanterías con libros de historia y las memorias encuadernadas de su abuelo.',
    colliders: [
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 440 },
      { x: 560, y: 0, w: 40, h: 440 },
      { x: 0, y: 400, w: 600, h: 40 },
      { x: 60, y: 75, w: 80, h: 85 },
      { x: 160, y: 70, w: 95, h: 45 },
      { x: 320, y: 210, w: 65, h: 50 },
      { x: 400, y: 70, w: 80, h: 45 }
    ],
    triggers: [
      {
        id: 'door_franklin_exit',
        name: 'Salir al barrio',
        x: 200,
        y: 390,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 580, y: 860 }
      },
      {
        id: 'franklin_chess_table',
        name: 'Tablero de ajedrez de madera',
        x: 320,
        y: 210,
        w: 65,
        h: 50,
        promptA: 'A - Analizar partida de ajedrez',
        promptB: 'B - Sentarse a jugar ajedrez',
        actionType: 'examine',
        examineTitle: 'Partida de Ajedrez Clásica',
        examineText: 'Las piezas de madera tallada están colocadas en la defensa siciliana. Franklin dice: "El ajedrez enseña a pensar con paciencia antes de dar el siguiente paso en la vida".'
      },
      {
        id: 'franklin_library',
        name: 'Memorias del abuelo y libros de historia',
        x: 160,
        y: 110,
        w: 95,
        h: 35,
        promptA: 'A - Leer memorias históricas',
        actionType: 'bookshelf',
        examineTitle: 'Biblioteca y Recuerdos Familiares',
        examineText: 'Tomos sobre la historia de los pioneros, cartas familiares y medallas de honor de su abuelo cuidadosamente conservadas.'
      },
      {
        id: 'franklin_desk',
        name: 'Escritorio con cuaderno y estilográfica',
        x: 400,
        y: 110,
        w: 80,
        h: 35,
        promptB: 'B - Sentarse a escribir notas',
        actionType: 'desk_write'
      }
    ]
  },

  // 10. CASA DE PIG-PEN
  house_pigpen: {
    id: 'house_pigpen',
    name: 'Casa de Pig-Pen',
    category: 'interior',
    width: 600,
    height: 440,
    backgroundTheme: '#F5F5F4',
    ambientSound: 'cozy_room',
    lightingType: 'cozy',
    spawnPoint: { x: 220, y: 370 },
    description: 'Hogar alegre y distendido. Montones de cómics, un sillón muy cómodo y una radio de válvulas que emite acordes de jazz.',
    colliders: [
      { x: 0, y: 0, w: 600, h: 50 },
      { x: 0, y: 0, w: 40, h: 440 },
      { x: 560, y: 0, w: 40, h: 440 },
      { x: 0, y: 400, w: 600, h: 40 },
      { x: 60, y: 75, w: 80, h: 85 },
      { x: 160, y: 75, w: 85, h: 40 },
      { x: 320, y: 205, w: 60, h: 55 },
      { x: 400, y: 70, w: 80, h: 45 }
    ],
    triggers: [
      {
        id: 'door_pigpen_exit',
        name: 'Salir al barrio',
        x: 200,
        y: 390,
        w: 50,
        h: 25,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 1210, y: 860 }
      },
      {
        id: 'pigpen_armchair',
        name: 'Sillón mullido y acogedor',
        x: 320,
        y: 205,
        w: 60,
        h: 55,
        promptB: 'B - Sentarse en el sillón a descansar',
        actionType: 'sit'
      },
      {
        id: 'pigpen_comics',
        name: 'Pila de cómics clásicos',
        x: 160,
        y: 110,
        w: 85,
        h: 35,
        promptA: 'A - Leer cómics de aventuras',
        actionType: 'bookshelf',
        examineTitle: 'Colección de Cómics de Pig-Pen',
        examineText: 'Cómics de superhéroes, revistas de ciencia y fósiles encontrados en el jardín. "La tierra guarda los secretos más fascinantes del planeta", suele decir Pig-Pen.'
      },
      {
        id: 'pigpen_radio',
        name: 'Radio de madera antigua',
        x: 400,
        y: 110,
        w: 80,
        h: 35,
        promptA: 'A - Sintonizar música jazz',
        actionType: 'record_player',
        examineTitle: 'Radio clásica de válvulas',
        examineText: 'Una cálida sintonía de contrabajo y piano suena suavemente, llenando la estancia de un agradable compás de jazz.'
      }
    ]
  },

  // 11. ESCUELA
  school: {
    id: 'school',
    name: 'Escuela Primaria Pinecrest / James Street',
    category: 'interior',
    width: 800,
    height: 520,
    backgroundTheme: '#FEE2E2',
    ambientSound: 'school_ambient',
    lightingType: 'indoor',
    spawnPoint: { x: 300, y: 440 },
    description: 'Pasillos escolares tradicionales, aula principal con pupitres individuales, pizarra de tiza y la enfermería.',
    colliders: [
      { x: 0, y: 0, w: 800, h: 50 },
      { x: 0, y: 0, w: 40, h: 520 },
      { x: 760, y: 0, w: 40, h: 520 },
      { x: 0, y: 480, w: 800, h: 40 },
      // Classroom divider
      { x: 420, y: 50, w: 15, h: 260 },
      // Blackboard & teacher's desk
      { x: 80, y: 50, w: 280, h: 30 },
      { x: 180, y: 100, w: 90, h: 40 },
      // Student desks
      { x: 80, y: 180, w: 50, h: 35 },
      { x: 160, y: 180, w: 50, h: 35 },
      { x: 240, y: 180, w: 50, h: 35 },
      { x: 320, y: 180, w: 50, h: 35 },
      // Nurse room
      { x: 480, y: 70, w: 100, h: 50 }
    ],
    triggers: [
      {
        id: 'door_school_exit',
        name: 'Salir al patio de la escuela',
        x: 280,
        y: 470,
        w: 60,
        h: 25,
        promptA: 'A - Salir al exterior',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 160, y: 640 }
      },
      {
        id: 'school_chalkboard',
        name: 'Pizarra del aula',
        x: 180,
        y: 80,
        w: 80,
        h: 30,
        promptA: 'A - Leer la pizarra',
        actionType: 'examine',
        examineTitle: 'Pizarra de tiza verde',
        examineText: 'En tiza blanca se lee: "Tarea para el lunes: Escribir una redacción sobre qué significa la esperanza". Abajo alguien dibujó un pequeño pajarito amarillo.'
      },
      {
        id: 'school_desk',
        name: 'Pupitre escolar',
        x: 160,
        y: 220,
        w: 50,
        h: 30,
        promptB: 'B - Sentarse en el pupitre a escribir',
        actionType: 'desk_write'
      },
      {
        id: 'school_wall_talk',
        name: 'Pared pensante del edificio',
        x: 420,
        y: 320,
        w: 40,
        h: 40,
        promptA: 'A - Hablar con el edificio escolar',
        actionType: 'examine',
        examineTitle: 'El edificio de la escuela que piensa',
        examineText: 'Como en las tiras donde Sally conversa con los ladrillos, el viejo edificio escolar parece susurrar: "No te preocupes, yo tampoco entiendo las fracciones".'
      }
    ]
  },

  // 10. CAMPO DE CALABAZAS (PUMPKIN PATCH)
  pumpkin_patch: {
    id: 'pumpkin_patch',
    name: 'El Campo de Calabazas de Linus',
    category: 'exterior',
    width: 900,
    height: 700,
    backgroundTheme: '#1E1B4B',
    ambientSound: 'night_wind',
    lightingType: 'outdoor',
    spawnPoint: { x: 420, y: 580 },
    description: 'Un huerto abierto y despejado iluminado por la luna de octubre, donde Linus aguarda con fe inquebrantable a la Gran Calabaza.',
    colliders: [
      { x: 0, y: 0, w: 900, h: 40 },
      { x: 0, y: 0, w: 40, h: 700 },
      { x: 860, y: 0, w: 40, h: 700 },
      { x: 0, y: 660, w: 900, h: 40 }
    ],
    triggers: [
      {
        id: 'door_pumpkin_exit',
        name: 'Regresar al barrio',
        x: 400,
        y: 650,
        w: 70,
        h: 30,
        promptA: 'A - Volver al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 740, y: 480 }
      },
      {
        id: 'great_pumpkin_spot',
        name: 'El epicentro de las calabazas',
        x: 420,
        y: 320,
        w: 80,
        h: 50,
        promptA: 'A - Huerto de la Gran Calabaza',
        actionType: 'pumpkin_farm',
        examineTitle: 'La noche más sincera del año',
        examineText: 'Las calabazas redondas descansan sobre la tierra húmeda. Linus dice que la Gran Calabaza elegirá el huerto más sincero de todos.'
      },
      {
        id: 'pumpkin_writing',
        name: 'Tronco de contemplación',
        x: 650,
        y: 420,
        w: 50,
        h: 35,
        promptB: 'B - Escribir bajo la luna',
        actionType: 'desk_write'
      }
    ]
  },

  // 11. DAISY HILL PUPPY FARM
  daisy_hill: {
    id: 'daisy_hill',
    name: 'Daisy Hill Puppy Farm',
    category: 'exterior',
    width: 900,
    height: 700,
    backgroundTheme: '#6EE7B7',
    ambientSound: 'farm_birds',
    lightingType: 'outdoor',
    spawnPoint: { x: 420, y: 580 },
    description: 'La granja rural donde nacieron Snoopy y sus hermanos. Pastos verdes, un cobertizo con heno fresco y un molino de viento melancólico.',
    colliders: [
      { x: 0, y: 0, w: 900, h: 40 },
      { x: 0, y: 0, w: 40, h: 700 },
      { x: 860, y: 0, w: 40, h: 700 },
      { x: 0, y: 660, w: 900, h: 40 },
      // Rustic barn
      { x: 320, y: 120, w: 240, h: 160 }
    ],
    triggers: [
      {
        id: 'door_daisy_exit',
        name: 'Regresar al barrio',
        x: 400,
        y: 650,
        w: 70,
        h: 30,
        promptA: 'A - Volver al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 60, y: 700 }
      },
      {
        id: 'daisy_hay_stack',
        name: 'Pajar de heno cálido',
        x: 380,
        y: 280,
        w: 80,
        h: 40,
        promptB: 'B - Descansar sobre el heno',
        actionType: 'bed_rest',
        examineTitle: 'El lecho de los cachorros',
        examineText: 'Aquí Snoopy, Spike, Belle, Olaf y sus hermanos dormían apiñados soñando con melodías y galletas.'
      },
      {
        id: 'daisy_memories',
        name: 'Placa conmemorativa de Daisy Hill',
        x: 200,
        y: 350,
        w: 50,
        h: 35,
        promptA: 'A - Leer recuerdos de Snoopy',
        actionType: 'examine',
        examineTitle: 'Recuerdos de la infancia',
        examineText: '"Daisy Hill: Donde el ritmo del jazz nació en el corazón de un pequeño cachorro blanco de orejas negras."'
      }
    ]
  },

  // 12. CAMPAMENTO DE VERANO
  summer_camp: {
    id: 'summer_camp',
    name: 'Campamento de Verano',
    category: 'exterior',
    width: 1000,
    height: 800,
    backgroundTheme: '#14532D',
    ambientSound: 'camp_forest',
    lightingType: 'outdoor',
    spawnPoint: { x: 170, y: 720 },
    description: 'Campamento clásico en el bosque de pinos: cabañas de madera, muelle con canoas, senderos naturales, cascada, mirador y la gran hoguera nocturna.',
    colliders: [
      { x: 0, y: 0, w: 1000, h: 40 },
      { x: 0, y: 0, w: 40, h: 800 },
      { x: 960, y: 0, w: 40, h: 800 },
      { x: 0, y: 760, w: 1000, h: 40 },
      // Reception cabin
      { x: 80, y: 560, w: 120, h: 80 },
      // Ari's shared cabin
      { x: 190, y: 140, w: 140, h: 95 },
      // Boys' cabin
      { x: 380, y: 140, w: 130, h: 95 },
      // Mess hall (comedor)
      { x: 90, y: 310, w: 190, h: 115 },
      // Crafts cabin (manualidades)
      { x: 90, y: 480, w: 130, h: 85 },
      // Infirmary (enfermería)
      { x: 250, y: 480, w: 110, h: 80 },
      // Deep lake water boundary
      { x: 670, y: 30, w: 330, h: 180 }
    ],
    triggers: [
      {
        id: 'door_camp_bus_exit',
        name: 'Autobús de regreso al barrio',
        x: 120,
        y: 720,
        w: 90,
        h: 40,
        promptA: 'A - Tomar el autobús de regreso al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 500, y: 730 }
      },
      {
        id: 'camp_reception',
        name: 'Recepción del campamento',
        x: 125,
        y: 630,
        w: 45,
        h: 30,
        promptA: 'A - Consultar en recepción',
        actionType: 'examine',
        examineTitle: 'Recepción del Campamento',
        examineText: 'Un mostrador de madera con llaves de las cabañas, mapas ilustrados de los senderos y el itinerario diario para todos los campistas.'
      },
      {
        id: 'camp_activity_board',
        name: 'Tablón de actividades',
        x: 450,
        y: 380,
        w: 60,
        h: 35,
        promptA: 'A - Mirar tablón de actividades',
        actionType: 'examine',
        examineTitle: 'Tablón de actividades del campamento',
        examineText: 'Horario del día: 10:00 - Canoas por el lago; 12:00 - Béisbol en el claro; 16:00 - Taller de manualidades; 21:00 - La Gran Hoguera bajo las estrellas.'
      },
      {
        id: 'camp_lake_trail',
        name: 'Sendero hacia el Lago Sereno',
        x: 750,
        y: 190,
        w: 60,
        h: 35,
        promptA: 'A - Tomar el sendero hacia el Lago Sereno',
        actionType: 'door_enter',
        targetLocation: 'lake',
        targetPosition: { x: 450, y: 80 }
      },
      {
        id: 'camp_ari_cabin_door',
        name: 'Cabaña de Ari',
        x: 245,
        y: 230,
        w: 35,
        h: 25,
        promptA: 'A - Entrar a tu cabaña',
        actionType: 'examine',
        examineTitle: 'Cabaña compartida de Ari',
        examineText: 'Literas de madera de pino con mantas mullidas, baúl de almacenamiento personal para tu equipaje y una ventana con vista a las copas de los abetos.'
      },
      {
        id: 'camp_mess_hall_door',
        name: 'Comedor comunal',
        x: 170,
        y: 420,
        w: 45,
        h: 30,
        promptA: 'A - Entrar al gran comedor',
        actionType: 'examine',
        examineTitle: 'Comedor del campamento',
        examineText: 'Filas de mesas largas de madera donde todos desayunan juntos tortitas recién hechas, zumo y tostadas con mermelada silvestre.'
      },
      {
        id: 'camp_crafts_door',
        name: 'Cabaña de manualidades',
        x: 140,
        y: 560,
        w: 40,
        h: 25,
        promptA: 'A - Entrar a manualidades',
        actionType: 'examine',
        examineTitle: 'Cabaña de artes y oficios',
        examineText: 'Mesas luminosas repletas de botes de pintura, pinceles, hilo para tejer pulseras de campamento y arcilla para modelar figuras.'
      },
      {
        id: 'camp_pier_trigger',
        name: 'Embarcadero y canoas del lago',
        x: 710,
        y: 140,
        w: 60,
        h: 35,
        promptB: 'B - Remar en canoa por el lago',
        actionType: 'sit',
        examineTitle: 'Canoas en el lago del campamento',
        examineText: 'Lucy te dice con firmeza: "¡Remá para el otro lado, Ari! ¡Si vamos a cruzar el lago tenemos que coordinar las palas!" Linus sonríe: "Creo que estamos girando en círculos... bueno, al menos estamos de acuerdo".'
      },
      {
        id: 'camp_waterfall_spot',
        name: 'Cascada secreta del bosque',
        x: 740,
        y: 440,
        w: 50,
        h: 40,
        promptA: 'A - Admirar la cascada',
        actionType: 'examine',
        examineTitle: 'Cascada secreta entre los pinos',
        examineText: 'El agua fresca de montaña cae sobre rocas cubiertas de musgo y helechos, llenando el aire de una bruma cristalina y aroma a bosque.'
      },
      {
        id: 'camp_overlook_bench',
        name: 'El Mirador panorámico',
        x: 820,
        y: 640,
        w: 50,
        h: 30,
        promptB: 'B - Sentarse en el mirador a escribir',
        actionType: 'desk_write',
        examineTitle: 'El Mirador del Campamento',
        examineText: 'Desde este banco elevado se contempla el lago entero y las copas verdes de los abetos meciéndose al viento.'
      },
      {
        id: 'camp_campfire_spot',
        name: 'La Gran Hoguera central',
        x: 430,
        y: 550,
        w: 50,
        h: 40,
        promptB: 'B - Sentarse junto al fuego',
        actionType: 'sit',
        examineTitle: 'La Gran Hoguera',
        examineText: 'Las llamas crepitan con calor acogedor mientras las chispas ascienden hacia las estrellas. Aquí Charlie Brown, Linus y la pandilla cuentan sus mejores historias nocturnas.'
      },
      {
        id: 'camp_garden_spot',
        name: 'Huerto del campamento',
        x: 720,
        y: 330,
        w: 50,
        h: 35,
        promptA: 'A - Cuidar el huerto',
        actionType: 'examine',
        examineTitle: 'Huerto de hortalizas',
        examineText: 'Hileras de tomates rojos maduros, lechugas y fresas silvestres cultivadas por los campistas para el comedor.'
      }
    ]
  },

  // 13. EL LAGO
  lake: {
    id: 'lake',
    name: 'El Lago Sereno',
    category: 'exterior',
    width: 900,
    height: 700,
    backgroundTheme: '#6EE7B7',
    ambientSound: 'water_waves',
    lightingType: 'outdoor',
    spawnPoint: { x: 420, y: 580 },
    description: 'Un rincón natural de aguas azules y ondas cristalinas, rodeado de sauces, juncos y rocas para sentarse a escribir.',
    colliders: [
      { x: 0, y: 0, w: 900, h: 40 },
      { x: 0, y: 0, w: 40, h: 700 },
      { x: 860, y: 0, w: 40, h: 700 },
      { x: 0, y: 660, w: 900, h: 40 },
      // Water body (Ari cannot walk into water, but can safely walk onto the wooden pier dock at x:170..260, y:242..272)
      { x: 190, y: 100, w: 520, h: 142 },
      { x: 260, y: 240, w: 450, h: 60 },
      { x: 180, y: 295, w: 530, h: 160 },
      // Ari's writing boulder & shoreline rocks
      { x: 170, y: 375, w: 65, h: 48 },
      // Pier timber boundary (prevent walking off edges into lake)
      { x: 165, y: 236, w: 100, h: 6 },
      { x: 165, y: 274, w: 100, h: 6 },
      { x: 265, y: 236, w: 6, h: 44 }
    ],
    triggers: [
      {
        id: 'door_lake_exit',
        name: 'Regresar al barrio por el sendero oeste',
        x: 40,
        y: 350,
        w: 60,
        h: 50,
        promptA: 'A - Volver al barrio a pie',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 1300, y: 360 }
      },
      {
        id: 'lake_to_beach_trail',
        name: 'Sendero hacia la Playa Dorada',
        x: 770,
        y: 630,
        w: 70,
        h: 40,
        promptA: 'A - Caminar hacia la Playa Dorada',
        actionType: 'door_enter',
        targetLocation: 'beach',
        targetPosition: { x: 100, y: 300 }
      },
      {
        id: 'lake_to_camp_trail',
        name: 'Sendero hacia el Campamento de Verano',
        x: 440,
        y: 35,
        w: 70,
        h: 35,
        promptA: 'A - Sendero hacia el Campamento de Verano',
        actionType: 'door_enter',
        targetLocation: 'summer_camp',
        targetPosition: { x: 750, y: 220 }
      },
      {
        id: 'lake_writing_stone',
        name: 'Roca de la orilla',
        x: 180,
        y: 380,
        w: 50,
        h: 35,
        promptB: 'B - Sentarse a escribir poemas',
        actionType: 'desk_write'
      },
      {
        id: 'lake_ripples',
        name: 'Agua del lago',
        x: 420,
        y: 445,
        w: 60,
        h: 35,
        promptB: 'B - Observar el agua',
        actionType: 'sit',
        examineTitle: 'Ondas en el agua',
        examineText: 'El agua clara refleja el cielo y las copas de los sauces. Un lugar idóneo para dejar que los pensamientos fluyan sin prisa.'
      }
    ]
  },

  // 14. LA PLAYA
  beach: {
    id: 'beach',
    name: 'La Playa Dorada',
    category: 'exterior',
    width: 1250,
    height: 900,
    backgroundTheme: '#FDE68A',
    ambientSound: 'ocean_breeze',
    lightingType: 'outdoor',
    spawnPoint: { x: 620, y: 760 },
    description: 'La gran playa natural de arena dorada con dunas, olas suaves, conchas, castillos de arena, chiringuito y zona de rocas.',
    colliders: [
      { x: 0, y: 0, w: 1250, h: 40 },
      { x: 0, y: 0, w: 40, h: 900 },
      { x: 1210, y: 0, w: 40, h: 900 },
      { x: 0, y: 860, w: 1250, h: 40 },
      // Ocean deep water boundary (Ari can wade in the shallows y: 195..245, but deep water is collidable)
      { x: 0, y: 40, w: 1250, h: 155 },
      // Rocky point boulders (zona de rocas)
      { x: 25, y: 160, w: 110, h: 80 },
      // Chiringuito snack shack
      { x: 670, y: 710, w: 130, h: 75 },
      // Lifeguard tower
      { x: 165, y: 250, w: 50, h: 55 },
      // Outdoor showers
      { x: 485, y: 760, w: 55, h: 30 }
    ],
    triggers: [
      {
        id: 'door_beach_exit',
        name: 'Regresar por las dunas al barrio',
        x: 600,
        y: 840,
        w: 90,
        h: 40,
        promptA: 'A - Volver al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 1300, y: 700 }
      },
      {
        id: 'beach_to_lake_trail',
        name: 'Sendero hacia el Lago Sereno',
        x: 80,
        y: 280,
        w: 65,
        h: 40,
        promptA: 'A - Caminar hacia el Lago Sereno',
        actionType: 'door_enter',
        targetLocation: 'lake',
        targetPosition: { x: 740, y: 600 }
      },
      {
        id: 'chiringuito_snack',
        name: 'Chiringuito de la playa',
        x: 710,
        y: 760,
        w: 60,
        h: 30,
        promptA: 'A - Comprar limonada fresca y helados',
        actionType: 'examine',
        examineTitle: 'Chiringuito de madera',
        examineText: 'El aroma a limonada fresca recién exprimida y helados de fresa y chocolate. Puedes pedir una bebida refrescante para disfrutar en la arena.'
      },
      {
        id: 'sandcastle_spot',
        name: 'Castillo de arena',
        x: 320,
        y: 360,
        w: 65,
        h: 40,
        promptB: 'B - Esculpir castillo de arena',
        actionType: 'sit',
        examineTitle: 'Castillo de arena',
        examineText: 'Una magnífica fortaleza con foso, almenas, caracolas y una pequeña banderita roja ondeando contra la brisa marina.'
      },
      {
        id: 'beach_towel',
        name: 'Sombrilla y toalla de relax',
        x: 230,
        y: 440,
        w: 50,
        h: 35,
        promptB: 'B - Tumbarse bajo la sombrilla a escribir',
        actionType: 'desk_write'
      },
      {
        id: 'beach_volleyball',
        name: 'Red de voleibol de playa',
        x: 1040,
        y: 470,
        w: 80,
        h: 40,
        promptB: 'B - Jugar al voleibol de playa',
        actionType: 'sit',
        examineTitle: 'Partido de voleibol en la arena',
        examineText: 'Peppermint Patty saca con fuerza: "¡Buen remate, Ari! ¡Esa pelota cayó justo en la línea!" Franklin y Marcie aplauden la jugada.'
      },
      {
        id: 'beach_rock_pool',
        name: 'Pozas de marea entre las rocas',
        x: 75,
        y: 200,
        w: 60,
        h: 40,
        promptA: 'A - Examinar pozas y cangrejos',
        actionType: 'examine',
        examineTitle: 'Pozas entre las rocas',
        examineText: 'Pozas de agua transparente entre las piedras cubiertas de algas verdes. Pequeños cangrejitos rojos corretean de lado esquivando tus pasos.'
      },
      {
        id: 'lifeguard_tower',
        name: 'Puesto de socorrista',
        x: 175,
        y: 300,
        w: 45,
        h: 35,
        promptA: 'A - Mirar el horizonte desde el puesto',
        actionType: 'examine',
        examineTitle: 'Puesto de socorrista',
        examineText: 'Una torre de madera blanca y roja con salvavidas. Desde aquí se divisan los veleros lejanos en el horizonte y las gaviotas volando sobre el mar.'
      },
      {
        id: 'shell_spot',
        name: 'Concha marina especial',
        x: 520,
        y: 280,
        w: 40,
        h: 30,
        promptA: 'A - Recoger concha marina',
        actionType: 'examine',
        examineTitle: 'Concha marina brillante',
        examineText: 'Una concha marina de nácar pulida por el vaivén de las olas. Sally te dice: "¡Es preciosa, Ari! Guardala en el bolsillo de tu sudadera".'
      }
    ]
  },

  // 15. BASEBALL FIELD (Sandlot infantil de Charlie Brown)
  baseball_field: {
    id: 'baseball_field',
    name: 'El Campo de Béisbol Sandlot',
    category: 'exterior',
    width: 1000,
    height: 800,
    backgroundTheme: '#65A30D',
    ambientSound: 'baseball_crowd',
    lightingType: 'outdoor',
    spawnPoint: { x: 500, y: 680 },
    description: 'El clásico diamante de béisbol de barrio rodeado de naturaleza. Tierra, bases, montículo de Charlie Brown, banquillos cubiertos, marcador manual y almacén de material.',
    colliders: [
      { x: 0, y: 0, w: 1000, h: 40 },
      { x: 0, y: 0, w: 40, h: 800 },
      { x: 960, y: 0, w: 40, h: 800 },
      { x: 0, y: 760, w: 1000, h: 40 },
      // Backstop behind home plate
      { x: 445, y: 610, w: 110, h: 25 },
      // Dugout Visitors (3rd base side)
      { x: 315, y: 520, w: 95, h: 45 },
      // Dugout Home / Charlie Brown (1st base side)
      { x: 585, y: 520, w: 95, h: 45 },
      // Equipment shed (almacén de material)
      { x: 735, y: 460, w: 75, h: 60 },
      // Scoreboard poles
      { x: 340, y: 250, w: 120, h: 35 }
    ],
    triggers: [
      {
        id: 'door_bb_exit',
        name: 'Volver a la calle principal',
        x: 470,
        y: 740,
        w: 60,
        h: 30,
        promptA: 'A - Volver al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 620, y: 740 }
      },
      {
        id: 'mound_pitch',
        name: 'Montículo del lanzador',
        x: 470,
        y: 420,
        w: 60,
        h: 40,
        promptA: 'A - Batear lanzamiento de Charlie Brown',
        promptB: 'B - Jugar al Béisbol',
        actionType: 'baseball_bat'
      },
      {
        id: 'dugout_talk_home',
        name: 'Banquillo del equipo',
        x: 600,
        y: 540,
        w: 65,
        h: 30,
        promptA: 'A - Charlar con el equipo en el banquillo',
        actionType: 'examine',
        examineTitle: 'Banquillo de Charlie Brown',
        examineText: 'Linus mira pensativo el diamante: "Preferiría esperar a que termine la entrada antes de responder cómo vamos, Ari... aunque si Charlie mantiene la calma, el partido aún es nuestro".'
      },
      {
        id: 'equipment_shed',
        name: 'Almacén de material de béisbol',
        x: 745,
        y: 500,
        w: 50,
        h: 30,
        promptA: 'A - Entrar al almacén de material',
        actionType: 'examine',
        examineTitle: 'Almacén de bates y pelotas',
        examineText: 'Una caseta de madera con estantes repletos de bates de fresno, guantes de cuero ablandados con aceite, pelotas con costuras rojas y un rastrillo para alisar la tierra.'
      },
      {
        id: 'scoreboard_examine',
        name: 'Marcador manual del campo',
        x: 370,
        y: 290,
        w: 60,
        h: 30,
        promptA: 'A - Mirar el marcador',
        actionType: 'examine',
        examineTitle: 'Marcador del Sandlot',
        examineText: 'PEANUTS: 2 carreras, 4 hits. VISITANTES: 3 carreras, 5 hits. Sexta entrada. Woodstock descansa en lo alto del poste celebrando cada strike.'
      }
    ]
  },

  // 16. ICE RINK (Standalone rink focus)
  ice_rink: {
    id: 'ice_rink',
    name: 'La Pista de Patinaje sobre Hielo',
    category: 'exterior',
    width: 750,
    height: 550,
    backgroundTheme: '#BAE6FD',
    ambientSound: 'ice_skate_sound',
    lightingType: 'outdoor',
    spawnPoint: { x: 360, y: 480 },
    description: 'Pista de hielo barrial para deslizarse y patinar con música de piano.',
    colliders: [
      { x: 0, y: 0, w: 750, h: 40 },
      { x: 0, y: 0, w: 40, h: 550 },
      { x: 710, y: 0, w: 40, h: 550 },
      { x: 0, y: 510, w: 750, h: 40 }
    ],
    triggers: [
      {
        id: 'door_ice_exit',
        name: 'Volver al barrio',
        x: 340,
        y: 500,
        w: 60,
        h: 30,
        promptA: 'A - Salir al barrio',
        actionType: 'door_exit',
        targetLocation: 'neighborhood',
        targetPosition: { x: 1010, y: 530 }
      },
      {
        id: 'ice_skate_action',
        name: 'Centro de la pista',
        x: 340,
        y: 240,
        w: 80,
        h: 50,
        promptA: 'A - Patinar con Snoopy y los chicos',
        promptB: 'B - Patinar en el Hielo',
        actionType: 'skate'
      }
    ]
  }
};
