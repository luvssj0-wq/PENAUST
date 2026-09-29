import { CharacterNpc, TimeOfDay } from '../types';

export const BASE_CHARACTERS_DATA: CharacterNpc[] = [
  {
    id: 'charlie_brown',
    name: 'Charlie Brown',
    locationId: 'neighborhood',
    x: 580,
    y: 530,
    direction: 'down',
    outfitColor: '#F59E0B', // Iconic yellow polo with black chevron
    accentColor: '#1F2937',
    hairStyle: 'curl',
    currentActivity: 'Pensando junto al árbol de las cometas en el parque',
    dialoguePool: [
      '¡Hola, Ari! ¿Has visto el viento hoy? Es perfecto para perder otra cometa...',
      'A veces creo que el montículo del pitcher es el lugar más solitario del mundo. Pero cuando batea el equipo, aún conservo esperanzas.',
      'Snoopy pasa el día entero en el tejado escribiendo novelas. Ojalá yo tuviera tanta confianza en mis historias como él.'
    ],
    contextRules: {
      baseball_field: '¡Vaya! Este montículo nunca me decepciona: siempre me hace sentir humilde antes del primer lanzamiento.',
      kite_tree: 'Ese árbol tiene un apetito insaciable. Se ha comido doce de mis cometas en lo que va del mes...',
      house_charlie_brown: 'Ponte cómoda, Ari. Si buscas a Sally está viendo dibujos, y mamá dejó galletas en la cocina.'
    },
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 450,
        y: 280,
        direction: 'down',
        currentActivity: 'Recogiendo el periódico matutino en el porche',
        dialoguePool: [
          '¡Buenos días, Ari! El aire fresco de la mañana me hace pensar que hoy podría ser el día en que ganemos un partido.',
          'Ya le di su desayuno a Snoopy. Devoró su plato en cuatro segundos y volvió a subirse al tejado.',
          'La mañana es tan silenciosa... es el único momento del día en que Lucy aún no me ha gritado.'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 580,
        y: 530,
        direction: 'down',
        currentActivity: 'Entrenando y observando el árbol de las cometas',
        dialoguePool: [
          '¡Hola, Ari! ¿Has visto el cielo? El viento parece desafiarme a intentar volar otra cometa.',
          'Si vas al montículo de béisbol, ten cuidado con las pelotas perdidas. Peppermint Patty está entrenando con ganas.',
          'A veces la vida parece una pelota de fútbol americano que Lucy siempre retira en el último segundo... pero sigo corriendo.'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 720,
        y: 440,
        direction: 'down',
        currentActivity: 'Sentado en el Muro de Pensar contemplando el atardecer',
        dialoguePool: [
          'Mira ese cielo dorado, Ari... El atardecer siempre tiene una forma extraña de hacer que los fracasos del día se sientan pequeños.',
          'Linus y yo siempre nos sentamos aquí cuando cae el sol. Es nuestro lugar seguro contra las preocupaciones del mundo.',
          'Otro día que se va... pero mañana el montículo de lanzamiento volverá a estar esperándome.'
        ]
      },
      night: {
        locationId: 'house_charlie_brown',
        x: 360,
        y: 150,
        direction: 'down',
        currentActivity: 'En su habitación leyendo antes de dormir',
        dialoguePool: [
          'Buenas noches, Ari. Es tarde... espero que Snoopy no empiece a teclear en su máquina a medianoche.',
          'A veces, en la oscuridad, me pregunto si a alguien en el mundo le cuesta tanto dormir como a mí.',
          'Mañana será un nuevo día. Descansa bien, Ari; gracias por venir a visitarme.'
        ]
      }
    }
  },
  {
    id: 'snoopy',
    name: 'Snoopy',
    locationId: 'neighborhood',
    x: 360,
    y: 280,
    direction: 'down',
    outfitColor: '#FFFFFF',
    accentColor: '#1F2937',
    hairStyle: 'ears',
    accessory: 'aviator_goggles',
    currentActivity: 'Paseando alegremente sobre sus dos patitas por el vecindario',
    dialoguePool: [
      '*Da un divertido giro sobre sus patitas traseras, mueve la cola con alegría y te saluda.*',
      '*Camina con su famoso paso rítmico de beagle feliz, silbando una suave melodía de jazz.*',
      '*Ajusta sus gafas oscuras de Joe Cool y continúa su paseo con elegancia sin igual.*',
      '*Olfatea las flores del camino, sonríe a Ari y da un alegre salto de baile.*'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 370,
        y: 280,
        direction: 'down',
        currentActivity: 'Paseando por el césped matutino oliendo el aire fresco',
        dialoguePool: [
          '*Bosteza ruidosamente, estira las patitas y camina alegremente por la acera.*',
          '*Golpea el ritmo con sus patitas traseras al compás de una síncopa de jazz matinal.*',
          '*Hace un saludo militar con la oreja: ¡El As de la Aviación patrulla el vecindario!*'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 520,
        y: 340,
        direction: 'right',
        currentActivity: 'Paseando con estilo Joe Cool por las aceras del barrio',
        dialoguePool: [
          '*Se coloca sus gafas oscuras de Joe Cool, camina erguido con estilo y saluda a Ari con suprema elegancia.*',
          '*Ejecuta un baile enérgico por la acera agitando las orejas al compás de Linus & Lucy.*',
          '*Hace una reverencia teatral, mueve la colita y te invita a pasear juntos.*'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 640,
        y: 440,
        direction: 'left',
        currentActivity: 'Caminando hacia el parque bajo el cielo anaranjado',
        dialoguePool: [
          '*Con su bufanda roja al viento, camina vigilando las nubes crepusculares en busca del Barón Rojo.*',
          '*¡Rat-tat-tat-tat! Hace con la boca el sonido de las ametralladoras mientras trota por el parque.*',
          '*Suspira con encanto poético mientras contempla las hojas doradas caer durante su caminata.*'
        ]
      },
      night: {
        locationId: 'neighborhood',
        x: 420,
        y: 310,
        direction: 'down',
        currentActivity: 'Paseando plácidamente bajo el manto de estrellas',
        dialoguePool: [
          '*Camina despacio bajo las farolas, mirando la luna redonda con ojos curiosos y felices.*',
          '*Trota en círculos oliendo el rocío nocturno y emite un suave bostezo canino.*',
          '*Te dedica una mirada afectuosa y mueve la colita deseándote una noche tranquila.*'
        ]
      }
    }
  },
  {
    id: 'woodstock',
    name: 'Woodstock',
    locationId: 'neighborhood',
    x: 390,
    y: 280,
    direction: 'left',
    outfitColor: '#FBBF24',
    accentColor: '#D97706',
    hairStyle: 'feathers',
    currentActivity: 'Dando saltitos y revoloteando alegremente por el vecindario',
    dialoguePool: [
      '¡Pío, pío, pío! *Aletea emocionado dando tres vueltas y se posa sobre tu hombro.*',
      '¡Piiiit! *Da alegres saltitos sobre sus patitas anaranjadas siguiendo a Snoopy.*',
      '¡Pío pío! *Hace una pequeña reverencia y te acompaña a explorar las calles.*'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 395,
        y: 280,
        direction: 'right',
        currentActivity: 'Buscando semillas y dando brinquitos por el camino',
        dialoguePool: [
          '¡Pío pío! *Aletea alegremente despertando al vecindario con su trino cantarín.*',
          '¡Pi-pi-pit! *Hace una reverencia graciosa agitando sus plumitas amarillas al sol matinal.*'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 545,
        y: 340,
        direction: 'right',
        currentActivity: 'Paseando y aleteando animosamente junto a Snoopy',
        dialoguePool: [
          '¡Pío, pío, pío! *Da tres volteretas en el aire y aterriza suavemente en tu cabeza.*',
          '¡Piiiiit! *Agita sus alas y camina erguido imitando el paso elegante de Snoopy.*'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 665,
        y: 440,
        direction: 'left',
        currentActivity: 'Acompañando a Snoopy en su paseo al atardecer',
        dialoguePool: [
          '¡Piiit... *Trota dando pequeños saltitos dorados bajo la suave luz del crepúsculo.*',
          '*Emite un dulce silbidito crepuscular despidiendo los últimos rayos dorados.*'
        ]
      },
      night: {
        locationId: 'neighborhood',
        x: 445,
        y: 310,
        direction: 'down',
        currentActivity: 'Dando suaves brinquitos nocturnos al lado de Snoopy',
        dialoguePool: [
          '¡Pío... *Da un bostezo diminuto y se acurruca un instante cerca de ti antes de seguir caminando.*',
          'Zzz... *Respira suavemente mientras admira las constelaciones en su paseo.*'
        ]
      }
    }
  },
  {
    id: 'linus',
    name: 'Linus Van Pelt',
    locationId: 'neighborhood',
    x: 740,
    y: 430, // Near the brick wall!
    direction: 'down',
    outfitColor: '#EF4444', // Red shirt with thin stripes
    accentColor: '#60A5FA', // Blue security blanket
    hairStyle: 'spiky',
    accessory: 'blanket',
    currentActivity: 'Apoyado en el Muro de Pensar con su manta',
    dialoguePool: [
      'Hola, Ari. Estaba reflexionando sobre cómo el otoño nos enseña a soltar las cosas con gracia.',
      'Mi manta de seguridad es una barricada contra las incertidumbres del cosmos.',
      'Algún día todos comprenderán la sinceridad del Campo de Calabazas. La Gran Calabaza no juzga, solo premia la fe sincera.'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 745,
        y: 280,
        direction: 'down',
        currentActivity: 'Contemplando el rocío matinal con su manta azul',
        dialoguePool: [
          'Buenos días, Ari. Dicen que cada amanecer es un acto de fe renovado del universo.',
          'Acariciar mi manta con el primer rayo de sol ahuyenta cualquier vestigio de pesadillas nocturnas.',
          '¿Sabías que los antiguos filósofos consideraban la alborada como el momento de mayor lucidez poética?'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 740,
        y: 430,
        direction: 'down',
        currentActivity: 'Apoyado en el Muro de Pensar reflexionando',
        dialoguePool: [
          'Hola, Ari. Estaba reflexionando sobre cómo el otoño nos enseña a soltar las cosas con gracia.',
          'Mi manta de seguridad es una barricada contra las incertidumbres del cosmos.',
          'Charlie Brown a veces se desanima fácilmente, pero su perseverancia es una virtud teologal incomprendida.'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 760,
        y: 440,
        direction: 'left',
        currentActivity: 'Sentado en el Muro de Pensar junto a Charlie Brown',
        dialoguePool: [
          'Mira hacia el horizonte, Ari. El atardecer no es el final de la luz, sino la preparación para contemplar las estrellas.',
          'Charlie Brown y yo hemos resuelto muchos dilemas aquí sentado en este muro de ladrillos.',
          'Pronto caerá la noche, y cuando anochece... mi corazón siempre viaja al Huerto de Calabazas.'
        ]
      },
      night: {
        // AT NIGHT LINUS GOES TO THE PUMPKIN PATCH TO WAIT FOR THE GREAT PUMPKIN!
        locationId: 'pumpkin_patch',
        x: 420,
        y: 420,
        direction: 'down',
        currentActivity: 'Haciendo guardia nocturna esperando a la Gran Calabaza',
        dialoguePool: [
          '¡Ari! ¡Has venido al Huerto de Calabazas! Este es el lugar más sincero de toda la comarca.',
          'No importa cuánto se burle Lucy o qué tan fría esté la noche: ¡tengo mi manta azul y sé que la Gran Calabaza ascenderá con regalos para los niños humildes!',
          'Shhh... ¿escuchaste ese crujido entre las hojas? ¡Podría ser ella emergiendo hacia la luz de la luna!'
        ]
      }
    }
  },
  {
    id: 'lucy',
    name: 'Lucy Van Pelt',
    locationId: 'neighborhood',
    x: 1040,
    y: 360, // Outside booth on sidewalk, ready to stroll and interact!
    direction: 'down',
    outfitColor: '#2563EB', // Iconic royal blue dress
    accentColor: '#1E3A8A',
    hairStyle: 'bob',
    currentActivity: 'Paseando por el vecindario y atendiendo su consultorio psiquiátrico de 5¢',
    dialoguePool: [
      '¡Cinco centavos, por favor! La consulta psiquiátrica está abierta y no acepto cheques sin fondos.',
      'El secreto del éxito en la vida es la firmeza. Si no estás seguro de algo, dilo con más volumen.',
      'Schroeder dice que Beethoven no necesitaba elogios, pero yo sé que en el fondo aprecia mi devoción.'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 1040,
        y: 360,
        direction: 'down',
        currentActivity: 'Abriendo su consultorio psiquiátrico y paseando por la acera',
        dialoguePool: [
          '¡La doctora está dentro desde temprano! El negocio de la salud mental no descansa.',
          'Si quieres un buen consejo matutino: no te compliques la vida pensando en vano, solo haz lo que yo te diga.',
          'Cinco centavos por sesión. ¡Tarifa reducida para vecinos madrugadores!'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 1040,
        y: 360,
        direction: 'down',
        currentActivity: 'Paseando por el barrio y atendiendo a los vecinos en su cabina de 5¢',
        dialoguePool: [
          '¡Cinco centavos, por favor! Suelta la moneda en la lata antes de quejarte de tus complejos.',
          'Charlie Brown vino antes con sus eternas dudas existenciales. Le dije que sonriera más y le cobré el doble por horas extras.',
          'Si el mundo me escuchara a mí, no habría atascos de tráfico ni discusiones sobre béisbol.'
        ]
      },
      sunset: {
        locationId: 'house_schroeder',
        x: 290,
        y: 190,
        direction: 'left',
        currentActivity: 'Apoyada en el piano de Schroeder mientras él toca',
        dialoguePool: [
          'Schroeder, el atardecer es muy romántico... ¿No crees que en una vida futura Beethoven y yo seríamos una pareja espléndida?',
          'Toca algo alegre, Schroeder. ¡Tanta sonata seria me va a dar dolor de cabeza!',
          '¡Hola, Ari! Dile a Schroeder que un buen pianista también debe aprender a escuchar a su musa.'
        ]
      },
      night: {
        locationId: 'neighborhood',
        x: 960,
        y: 360,
        direction: 'down',
        currentActivity: 'Paseando serenamente por el barrio bajo las estrellas y conversando',
        dialoguePool: [
          'La noche en este barrio tiene una calma maravillosa, Ari. Hasta Schroeder toca sus sonatas más suaves.',
          'Pasear bajo las farolas me ayuda a ordenar mis pensamientos y planificar mis próximas consultas.',
          '¿Viste qué bonito se ve el parque con la luna llena? Un ambiente perfecto para una noche chill y tranquila.',
          'Linus insiste en quedarse en el huerto, pero al menos el aire fresco de la noche nos despeja las ideas a todos.'
        ]
      }
    }
  },
  {
    id: 'schroeder',
    name: 'Schroeder',
    locationId: 'house_schroeder',
    x: 240,
    y: 200,
    direction: 'down',
    outfitColor: '#DC2626', // Striped purple/red polo
    accentColor: '#1F2937',
    hairStyle: 'blond',
    accessory: 'piano',
    currentActivity: 'Interpretando una sonata de Beethoven en su piano de juguete',
    dialoguePool: [
      'Shhh... escucha el tercer movimiento de la Sonata Claro de Luna. Las teclas negras están pintadas, pero el alma es real.',
      'Beethoven compuso para la eternidad. Yo solo intento ser un intérprete digno con este pequeño piano.',
      'Lucy siempre se apoya en el borde de mi piano. Al menos guarda silencio durante los pasajes en pianissimo.'
    ],
    schedules: {
      dawn: {
        locationId: 'house_schroeder',
        x: 240,
        y: 200,
        direction: 'down',
        currentActivity: 'Afinando sus dedos matutinos con arpegios de Beethoven',
        dialoguePool: [
          'Buenos días, Ari. Ludwig van Beethoven solía levantarse al alba a preparar café contando exactamente sesenta granos.',
          'Los primeros compases de la mañana deben ejecutarse con delicadeza cristalina.',
          'Tocar el piano al amanecer purifica el espíritu antes de que comience el bullicio del barrio.'
        ]
      },
      day: {
        locationId: 'house_schroeder',
        x: 240,
        y: 200,
        direction: 'down',
        currentActivity: 'Interpretando apasionadamente la Sonata Patética',
        dialoguePool: [
          '¡Escucha esta modulación a Do menor! La fuerza dramática de Beethoven no tiene comparación en la historia humana.',
          'Lucy insiste en hablarme de hipotecas y casas de suburbio mientras interpreto la Novena Sinfonía. ¡Qué barbarie!',
          'Siéntete libre de escuchar, Ari; la buena música está hecha para elevar el pensamiento.'
        ]
      },
      sunset: {
        locationId: 'house_schroeder',
        x: 240,
        y: 200,
        direction: 'down',
        currentActivity: 'Tocando acordes crepusculares con la luz dorada en la ventana',
        dialoguePool: [
          'La luz dorada del atardecer sobre el busto de Beethoven crea un contraste sobrecogedor.',
          'Esta cadencia parece capturar la nostalgia del día que se despide.',
          'Lucy está apoyada en el piano suspirando... Trato de concentrarme únicamente en el pentagrama.'
        ]
      },
      night: {
        locationId: 'house_schroeder',
        x: 240,
        y: 200,
        direction: 'down',
        currentActivity: 'Interpretando la Sonata Claro de Luna a la luz de una vela',
        dialoguePool: [
          'La noche es el momento más puro para entender a Beethoven. La Sonata Opus 27 N° 2 respira en esta quietud.',
          'Las teclas blancas brillan tenuemente en la oscuridad. Cada silencio vale tanto como cada nota.',
          'Buenas noches, Ari. Que los acordes de Beethoven guíen tus sueños hacia la belleza.'
        ]
      }
    }
  },
  {
    id: 'sally',
    name: 'Sally Brown',
    locationId: 'house_charlie_brown',
    x: 320,
    y: 290,
    direction: 'down',
    outfitColor: '#F472B6', // Polka dot pink dress
    accentColor: '#FDE047',
    hairStyle: 'curls_blond',
    currentActivity: 'Descansando en su habitación rosa',
    dialoguePool: [
      '¿A quién le importa la tarea escolar si el día está tan bonito afuera?',
      '¡Mi dulce babbo Linus debería pasar más tiempo conmigo y menos con esa vieja manta!',
      'He decidido que mi filosofía de vida es sencilla: ¿Para qué preocuparse hoy por lo que puedes ignorar mañana?'
    ],
    schedules: {
      dawn: {
        locationId: 'house_charlie_brown',
        x: 320,
        y: 290,
        direction: 'down',
        currentActivity: 'Bostezando en su habitación protestando por madrugar',
        dialoguePool: [
          '¿Quién inventó levantarse temprano? Debería ser ilegal antes de las diez de la mañana.',
          'Charlie Brown ya está despierto alimentando al perro. Qué derroche innecesario de energía.'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 640,
        y: 320,
        direction: 'down',
        currentActivity: 'Paseando por la acera buscando a su dulce babbo Linus',
        dialoguePool: [
          '¡Hola, Ari! ¿Has visto a Linus? Le compré un lazo nuevo para su manta pero salió corriendo.',
          'He decidido no hacer los deberes de matemáticas hoy. En el futuro las computadoras sumarán todo por nosotros de todos modos.',
          'El sol es bonito, pero preferiría que hubiera un botón para adelantar el día al recreo.'
        ]
      },
      sunset: {
        locationId: 'house_charlie_brown',
        x: 130,
        y: 240,
        direction: 'right',
        currentActivity: 'Viendo dibujos animados en el televisor de la sala',
        dialoguePool: [
          '¡Shhh, Ari! Está empezando mi programa favorito de dibujos animados.',
          'Charlie Brown está en el muro deprimido por el atardecer. Yo prefiero el brillo a color de la televisión.'
        ]
      },
      night: {
        locationId: 'house_charlie_brown',
        x: 360,
        y: 320,
        direction: 'left',
        currentActivity: 'Durmiendo en su cómoda cama rosa',
        dialoguePool: [
          'Zzz... mañana no quiero ir a la escuela... Zzz...',
          '*Duerme abrazada a su osito de peluche con total tranquilidad.*'
        ]
      }
    }
  },
  {
    id: 'peppermint_patty',
    name: 'Peppermint Patty',
    locationId: 'neighborhood',
    x: 620,
    y: 750, // Near the baseball field
    direction: 'down',
    outfitColor: '#10B981', // Green polo with vertical stripes
    accentColor: '#78350F',
    hairStyle: 'chin_length',
    accessory: 'sandals',
    currentActivity: 'Ajustando su guante de béisbol',
    dialoguePool: [
      '¡Qué hay, chaval! Si vas al campo, avísale a Charlie Brown que hoy bateo yo de cuarto turno.',
      'La escuela me da jaqueca con tantas fechas históricas, pero ponme una pelota rápida y te la mando fuera del parque.',
      'Marcie me dice que debería serenarme un poco. ¡Pero la adrenalina es mi estado natural!'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 200,
        y: 320,
        direction: 'right',
        currentActivity: 'Haciendo footing matutino por la acera del barrio',
        dialoguePool: [
          '¡Uno, dos, uno, dos! ¡Arriba ese ánimo, chaval! El aire de la mañana es el mejor combustible para los cuadrangulares.',
          'Correr en sandalias requiere una técnica legendaria. ¡Cuestión de estilo californiano!'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 620,
        y: 750,
        direction: 'down',
        currentActivity: 'Bateando y practicando en el campo de béisbol',
        dialoguePool: [
          '¡Qué hay, chaval! Ponme una recta al centro y mira cómo vuela por encima de la valla.',
          'Charlie Brown lanza con mucho corazón, pero a veces su bola curva parece más bien una súplica.',
          'Marcie dice que leer es como batear con la mente... ¡Yo prefiero el bate de madera!'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 880,
        y: 440,
        direction: 'down',
        currentActivity: 'Descansando en el banco del parque tras el partido',
        dialoguePool: [
          'Ufff... qué buen entrenamiento. Me duelen hasta las pestañas, pero valió cada carrera anotada.',
          'Marcie me prestó su chaqueta porque empezó a refrescar. Es una buena amiga, aunque use demasiadas palabras difíciles.',
          'Mira ese atardecer, chaval... Parece un trofeo dorado en el cielo.'
        ]
      },
      night: {
        locationId: 'house_peppermint_patty',
        x: 200,
        y: 220,
        direction: 'down',
        currentActivity: 'Descansando profundamente en su casa tras el deporte',
        dialoguePool: [
          'Buenas noches, chaval. Apaga la luz si sales; hoy he corrido más bases que en toda la temporada.',
          'Zzz... recta por todo el centro... ¡cuadrangular!... Zzz...'
        ]
      }
    }
  },
  {
    id: 'marcie',
    name: 'Marcie',
    locationId: 'neighborhood',
    x: 660,
    y: 750,
    direction: 'down',
    outfitColor: '#EF4444', // Red turtleneck
    accentColor: '#1E293B',
    hairStyle: 'dark_glasses',
    accessory: 'round_glasses',
    currentActivity: 'Leyendo un libro al lado de Peppermint Patty',
    dialoguePool: [
      'Buenos días, Ari. Estaba intentando convencer a Peppermint Patty de que la poesía también requiere ritmo atlético.',
      'Me gusta la tranquilidad de esta esquina del barrio. Es perfecta para leer sin interrupciones.',
      'Si necesitas ayuda para redactar algo en tu cuaderno, estaré encantada de revisar la métrica.'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 180,
        y: 560,
        direction: 'down',
        currentActivity: 'Caminando con sus libros camino a la biblioteca',
        dialoguePool: [
          'Buenos días, Ari. La brisa de la aurora siempre invita a releer los sonetos de Garcilaso o Emily Dickinson.',
          'Peppermint Patty ya pasó corriendo como una tromba. Admiro su energía, aunque prefiero el ejercicio intelectual.'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 660,
        y: 750,
        direction: 'down',
        currentActivity: 'Anotando estadísticas del partido y leyendo a Dostoievski',
        dialoguePool: [
          'Buenos días, Ari. Anoto cada strike y cada out de Peppermint Patty con rigurosa precisión científica.',
          'Si necesitas ayuda para componer algo en tu Cuaderno de Ari, recuerda que la metáfora perfecta es la que surge sin forzarla.',
          'Amo el olor a hierba cortada y páginas de libros antiguos mezclados en una tarde soleada.'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 910,
        y: 440,
        direction: 'left',
        currentActivity: 'Sentada junto a Peppermint Patty conversando en el banco',
        dialoguePool: [
          'El crepúsculo siempre suscita pensamientos trascendentales, ¿no crees, Ari?',
          'Le ofrecí mi abrigo a Peppermint Patty. Nunca admite que tiene frío hasta que sus dientes empiezan a castañetear.',
          'La paleta de colores del cielo parece salida de una acuarela de William Turner.'
        ]
      },
      night: {
        locationId: 'house_marcie',
        x: 210,
        y: 200,
        direction: 'down',
        currentActivity: 'Estudiando y leyendo a la luz de una lámpara de escritorio',
        dialoguePool: [
          'Buenas noches, Ari. La noche es mi momento predilecto para traducir textos clásicos en absoluto silencio.',
          'Descansa bien. Espero leer pronto tus nuevas páginas en el cuaderno de Ari.',
          'La luz de esta pequeña lámpara es suficiente para iluminar mundos enteros a través de la lectura.'
        ]
      }
    }
  },
  {
    id: 'franklin',
    name: 'Franklin',
    locationId: 'neighborhood',
    x: 600,
    y: 450,
    direction: 'down',
    outfitColor: '#2563EB',
    accentColor: '#1D4ED8',
    hairStyle: 'short_curly',
    currentActivity: 'Paseando tranquilamente por el parque observando la naturaleza',
    dialoguePool: [
      'Hola, Ari. Me gusta este vecindario; siempre hay algo interesante ocurriendo si te tomas el tiempo de escuchar.',
      'Mi abuelo siempre me dice que los libros y los buenos amigos son lo que le da verdadero valor a la vida.',
      'A veces juego al béisbol con Charlie Brown. Tiene un gran corazón, aunque nuestro equipo nunca gane.',
      'Es un día perfecto para sentarse a escribir en tu cuaderno, Ari.'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 620,
        y: 430,
        direction: 'right',
        currentActivity: 'Disfrutando de la brisa fresca del amanecer',
        dialoguePool: [
          'Buenos días, Ari. El aire de la mañana siempre me ayuda a ordenar las ideas.',
          'Mira cómo el rocío brilla sobre la hierba. Es inspirador.',
          '¿Ya tienes planes para hoy en el barrio?'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 600,
        y: 450,
        direction: 'down',
        currentActivity: 'Conversando tranquilamente en el parque',
        dialoguePool: [
          'Hola, Ari. Me gusta este vecindario; siempre hay algo interesante ocurriendo si te tomas el tiempo de escuchar.',
          'Mi abuelo siempre me dice que los libros y los buenos amigos son lo que le da verdadero valor a la vida.',
          'A veces juego al béisbol con Charlie Brown. Tiene un gran corazón, aunque nuestro equipo nunca gane.',
          'Es un día perfecto para sentarse a escribir en tu cuaderno, Ari.'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 650,
        y: 730,
        direction: 'left',
        currentActivity: 'Paseando cerca del campo de béisbol al atardecer',
        dialoguePool: [
          'El atardecer en el campo de béisbol es muy sereno.',
          'Charlie Brown estuvo practicando lanzamientos hasta hace un rato.',
          'Una caminata tranquila al atardecer es la mejor manera de cerrar la jornada.'
        ]
      },
      night: {
        locationId: 'neighborhood',
        x: 820,
        y: 350,
        direction: 'up',
        currentActivity: 'Mirando el cielo nocturno y las estrellas',
        dialoguePool: [
          'Buenas noches, Ari. Mi abuelo me enseñó a orientarme con la estrella polar.',
          'La noche es silenciosa y despejada hoy.',
          'Que descanses bien en tu habitación, Ari.'
        ]
      }
    }
  },
  {
    id: 'pig_pen',
    name: 'Pig-Pen',
    locationId: 'neighborhood',
    x: 740,
    y: 720,
    direction: 'down',
    outfitColor: '#78716C',
    accentColor: '#57534E',
    hairStyle: 'messy',
    currentActivity: 'Levantando alegremente su característica nube de polvo milenario',
    dialoguePool: [
      '¡Hola, Ari! No es suciedad ordinaria, es polvo de antiguas civilizaciones que me acompaña con orgullo.',
      'Llevo encima tierra de lugares lejanos que viajó en el viento durante siglos.',
      'Me lavé las manos hace cinco minutos... pero la tierra y yo tenemos una afinidad irresistible.',
      'La gente se preocupa demasiado por estar impecable. La vida es más divertida cuando no temes ensuciarte.'
    ],
    schedules: {
      dawn: {
        locationId: 'neighborhood',
        x: 680,
        y: 350,
        direction: 'right',
        currentActivity: 'Caminando con su nube de polvo matinal',
        dialoguePool: [
          '¡Buenos días, Ari! El rocío intenta aplacar mi polvo, pero mi nube siempre persiste victoriosa.',
          'Un paseo matutino por la tierra fresca del jardín siempre es reconfortante.'
        ]
      },
      day: {
        locationId: 'neighborhood',
        x: 740,
        y: 720,
        direction: 'down',
        currentActivity: 'Jugando cerca del montículo de béisbol',
        dialoguePool: [
          '¡Hola, Ari! No es suciedad ordinaria, es polvo de antiguas civilizaciones que me acompaña con orgullo.',
          'Llevo encima tierra de lugares lejanos que viajó en el viento durante siglos.',
          'Me lavé las manos hace cinco minutos... pero la tierra y yo tenemos una afinidad irresistible.'
        ]
      },
      sunset: {
        locationId: 'neighborhood',
        x: 840,
        y: 360,
        direction: 'left',
        currentActivity: 'Sentado en el banco mientras el viento agita su polvo',
        dialoguePool: [
          'El sol poniente le da un tono dorado a mi nube de polvo. Casi parece polvo de estrellas.',
          'Ha sido un día productivo en el vecindario.'
        ]
      },
      night: {
        locationId: 'neighborhood',
        x: 620,
        y: 350,
        direction: 'down',
        currentActivity: 'Paseando bajo las farolas del barrio',
        dialoguePool: [
          'Bajo la luz de las farolas, las partículas de polvo flotan como luciérnagas.',
          'Buenas noches, Ari. Hasta mañana.'
        ]
      }
    }
  }
];

export const CHARACTERS_DATA = BASE_CHARACTERS_DATA;

// Location-specific overrides for rich social presence in the Beach, Baseball Field, and Summer Camp
const BEACH_CHARACTERS: Record<string, Partial<CharacterNpc>> = {
  charlie_brown: {
    locationId: 'beach',
    x: 380,
    y: 360,
    direction: 'down',
    currentActivity: 'Intentando construir un castillo de arena antes de que suba la marea',
    dialoguePool: [
      'Estoy intentando que el mar no destruya mi castillo de arena, Ari... aunque sospecho que la marea no está de mi lado.',
      'Hay algo muy relajante en el sonido de las olas. Por una tarde, nadie me recuerda cuántos partidos hemos perdido.',
      'Mira a Snoopy con esas gafas de sol. Parece el dueño del océano entero.'
    ]
  },
  linus: {
    locationId: 'beach',
    x: 620,
    y: 535,
    direction: 'down',
    currentActivity: 'Leyendo bajo una sombrilla con su inseparable mantita azul',
    dialoguePool: [
      'La brisa marina es muy agradable, Ari. Aunque Lucy insiste en que mi mantita no es una toalla reglamentaria.',
      'Hay una cita de san Agustín sobre el mar que me gusta recordar mientras escucho las olas.',
      'Si miras con atención las dunas, se nota la paciencia con la que el viento dibuja la arena.'
    ]
  },
  lucy: {
    locationId: 'beach',
    x: 235,
    y: 440,
    direction: 'down',
    currentActivity: 'Tomando el sol sobre su toalla de rayas',
    dialoguePool: [
      'El sol es excelente para la salud, Ari. Pero si Charlie Brown pisa mi toalla, le cobraré diez centavos de multa.',
      'Le dije a Linus que la arena se meterá en su manta, pero como de costumbre, finge que no me escucha.',
      'Un verdadero líder sabe cuándo relajarse y dejar que los demás hagan castillos de arena mediocres.'
    ]
  },
  peppermint_patty: {
    locationId: 'beach',
    x: 1040,
    y: 450,
    direction: 'left',
    currentActivity: 'Organizando un partido de voleibol de playa en la arena',
    dialoguePool: [
      '¡Hey, Ari! ¡Llegas justo a tiempo para el saque! ¡Colócate en la red y pásale a Marcie!',
      '¡La arena es el mejor terreno para lanzarse a por una pelota! ¡Ni un rasguño, puro impulso deportivo!',
      'Marcie quería quedarse leyendo en la toalla, ¡pero el espíritu deportivo nunca duerme bajo el sol!'
    ]
  },
  marcie: {
    locationId: 'beach',
    x: 875,
    y: 435,
    direction: 'right',
    currentActivity: 'Sentada a la sombra con un buen libro de literatura',
    dialoguePool: [
      'Hola, Ari. Sir insiste en que juguemos al voleibol, pero prometí que leería dos capítulos primero.',
      'El reflejo del sol sobre el agua abierta es un espectáculo poético fascinante.',
      'Si vas al chiringuito de la entrada, por favor tráeme una limonada bien fría, Ari.'
    ]
  },
  sally: {
    locationId: 'beach',
    x: 520,
    y: 290,
    direction: 'down',
    currentActivity: 'Buscando conchas marinas especiales a lo largo de la orilla',
    dialoguePool: [
      '¡Mira esta concha nacarada, Ari! ¡Es perfecta para regalársela a mi querido Linus!',
      'Caminar descalza por la arena tibia es lo mejor que inventó el verano.',
      'Mi hermano mayor dice que el mar es inmenso... a mí me parece una piscina gigante sin cloro.'
    ]
  },
  snoopy: {
    locationId: 'beach',
    x: 310,
    y: 430,
    direction: 'down',
    accessory: 'aviator_goggles',
    currentActivity: 'Luciendo sus gafas oscuras de Joe Cool recostado con elegancia suprema',
    dialoguePool: [
      '*Ajusta sus gafas de sol de Joe Cool con calma, sonríe a la brisa marina y se cruza de brazos como el perro más elegante de la costa.*',
      '*Camina rítmicamente por la arena dorada dejando diminutas huellas de patas y saludando a las gaviotas.*',
      '*Mira con interés sospechoso el sándwich de Ari, fingiendo desinterés absoluto.*'
    ]
  },
  woodstock: {
    locationId: 'beach',
    x: 440,
    y: 230,
    direction: 'down',
    currentActivity: 'Aleteando sobre la orilla mojada esquivando las olas espumosas',
    dialoguePool: [
      '*Aletea entusiasmado justo donde rompe la espuma, salta hacia atrás cuando sube la ola y pía de risa.*',
      '*Se posa en la punta de la sombrilla de Snoopy vigilando el horizonte marino con binoculares imaginarios.*'
    ]
  },
  franklin: {
    locationId: 'beach',
    x: 1100,
    y: 460,
    direction: 'left',
    currentActivity: 'Jugando al voleibol en la arena con Peppermint Patty',
    dialoguePool: [
      '¡El agua está templada hoy, Ari! Es genial pasar la tarde aquí con todos.',
      'Mi abuelo siempre decía que un día en el mar te renueva las energías para todo el mes.',
      '¡Buen remate, Ari! ¡Esa pelota cayó justo en la línea!'
    ]
  }
};

const BASEBALL_CHARACTERS: Record<string, Partial<CharacterNpc>> = {
  charlie_brown: {
    locationId: 'baseball_field',
    x: 500,
    y: 440,
    direction: 'down',
    currentActivity: 'En el montículo del lanzador concentrándose antes de tirar',
    dialoguePool: [
      'Un nuevo lanzamiento, una nueva esperanza... ¡Vamos allá, equipo! ¡Este partido puede ser el primero que ganemos!',
      'El montículo tiene la altura perfecta. Mientras sostenga la pelota con costuras rojas, todo es posible.',
      '¡Concentración, Charlie Brown! No pienses en las noventa derrotas anteriores...'
    ]
  },
  lucy: {
    locationId: 'baseball_field',
    x: 500,
    y: 300,
    direction: 'down',
    currentActivity: 'En segunda base gritándole instrucciones al montículo',
    dialoguePool: [
      '¡Concéntrate en lanzar bien, Charlie Brown! ¡Y no tires la pelota hacia mis petunias!',
      'Si perdemos por tu culpa, la tarifa de mi consulta psiquiátrica subirá a veinticinco centavos.',
      '¡Un verdadero capitán sabe cómo colocar a su mejor jugadora en segunda base!'
    ]
  },
  linus: {
    locationId: 'baseball_field',
    x: 330,
    y: 520,
    direction: 'right',
    currentActivity: 'En el banquillo esperando su turno al bate con su guante y su mantita',
    dialoguePool: [
      'Preferiría esperar a que termine la entrada antes de responder cómo vamos, Ari...',
      'Si Charlie Brown mantiene la calma en el montículo, las leyes de la probabilidad tarde o temprano jugarán a nuestro favor.',
      'Tener mi mantita doblada dentro del guante me da una seguridad inquebrantable para atrapar elevados.'
    ]
  },
  schroeder: {
    locationId: 'baseball_field',
    x: 500,
    y: 575,
    direction: 'up',
    currentActivity: 'De receptor detrás de home plate haciendo señas con los dedos',
    dialoguePool: [
      'Concentración, Charlie Brown. Como en el cuarto movimiento de la Novena de Beethoven: primero tensión, luego triunfo.',
      'Buen lanzamiento el anterior. Un poco más bajo y será strike cantado.',
      'Cuando termine el partido, tengo que practicar tres sonatas de piano.'
    ]
  },
  peppermint_patty: {
    locationId: 'baseball_field',
    x: 480,
    y: 560,
    direction: 'down',
    currentActivity: 'En la caja de bateo ajustando su postura con el bate al hombro',
    dialoguePool: [
      '¡Lánzala justo por el centro, Chuck! ¡Te aseguro que esta pelota va directo al bosque!',
      '¡Me encanta el sonido de la madera al conectar un hit limpio! ¡A correr las bases, Ari!',
      '¡Béisbol de verdad, Chuck! ¡Nada de rodeos, pura potencia!'
    ]
  },
  sally: {
    locationId: 'baseball_field',
    x: 420,
    y: 630,
    direction: 'up',
    currentActivity: 'En el banco de espectadores animando a su hermano y a Linus',
    dialoguePool: [
      '¡Vamos, equipo! ¡Especialmente mi querido Linus en el banquillo!',
      'No entiendo muy bien las reglas de las bases, pero aplaudir cuando todos gritan es muy divertido.',
      'Si mi hermano gana, le pediré que me compre un helado doble.'
    ]
  },
  snoopy: {
    locationId: 'baseball_field',
    x: 590,
    y: 515,
    direction: 'left',
    currentActivity: 'En el banquillo con su gorra de béisbol atrapando pelotas con estilo',
    dialoguePool: [
      '*Atrapa una pelota con su gorra de béisbol con un movimiento acrobático, hace una reverencia y espera galletas.*',
      '*Se sienta en el techo del banquillo con los brazos cruzados fingiendo ser el manager más sabio de las grandes ligas.*'
    ]
  },
  woodstock: {
    locationId: 'baseball_field',
    x: 340,
    y: 245,
    direction: 'down',
    currentActivity: 'Posado en la esquina del marcador manual celebrando cada jugada',
    dialoguePool: [
      '*Pía emocionado desde lo alto del marcador y da tres vueltas en el aire con alegría beisbolera.*'
    ]
  }
};

const SUMMER_CAMP_CHARACTERS: Record<string, Partial<CharacterNpc>> = {
  peppermint_patty: {
    locationId: 'summer_camp',
    x: 430,
    y: 410,
    direction: 'down',
    currentActivity: 'En la plaza central coordinando las actividades del campamento',
    dialoguePool: [
      '¡Bienvenidos al Campamento de Verano, campistas! Hoy el itinerario promete: canoas por la mañana y gran hoguera nocturna.',
      '¡Nada de remolonear en las literas! ¡El aire puro de la montaña es para exploradores activos!',
      'Marcie y yo compartimos cabaña. Anoche a las ocho ya quería apagar la linterna, ¡puedes creerlo!'
    ]
  },
  marcie: {
    locationId: 'summer_camp',
    x: 150,
    y: 500,
    direction: 'right',
    currentActivity: 'En el porche de la cabaña de manualidades tejiendo pulseras',
    dialoguePool: [
      'Hola, Ari. Estoy haciendo una pulsera de campamento de hilo trenzado. ¿Quieres tejer una conmigo?',
      'El campamento tiene una serenidad especial, siempre y cuando Sir no intente organizar carreras a las seis de la mañana.',
      'El lago del campamento es mucho más profundo y misterioso que el estanque del barrio.'
    ]
  },
  charlie_brown: {
    locationId: 'summer_camp',
    x: 440,
    y: 240,
    direction: 'down',
    currentActivity: 'Frente a su cabaña contemplando el bosque y los pinos',
    dialoguePool: [
      'Acá en el campamento se respira un aire diferente, Ari. Ojalá por una vez no haya nada que pueda salir mal.',
      'Linus y yo nos quedamos despiertos anoche mirando las copas de los árboles por la ventana. Las estrellas se ven increíbles.',
      'Snoopy armó su propia tienda de campaña al lado. Dice que su alojamiento rústico es de cinco estrellas.'
    ]
  },
  linus: {
    locationId: 'summer_camp',
    x: 740,
    y: 310,
    direction: 'left',
    currentActivity: 'En el huerto del campamento observando los cultivos silvestres',
    dialoguePool: [
      'Las fresas silvestres y los tomates del huerto están casi maduros. La naturaleza tiene un orden admirable.',
      'Esta noche en la hoguera contaré la leyenda de los antiguos bosques del norte. Sally ya me pidió que no dé demasiado miedo.',
      'El olor a leña y hojas de pino es uno de los aromas más reconfortantes del mundo.'
    ]
  },
  lucy: {
    locationId: 'summer_camp',
    x: 700,
    y: 130,
    direction: 'down',
    currentActivity: 'En el embarcadero dando órdenes de cómo remar en canoa',
    dialoguePool: [
      '¡Remá para el otro lado, Ari! Si vamos a cruzar el lago, tenemos que coordinar las palas.',
      'He decidido ser la consejera jefa de disciplina del campamento. Todo funciona mejor cuando alguien manda con firmeza.',
      'Schroeder se trajo su música incluso aquí. Dice que los pinos le inspiran sonatas pastorales.'
    ]
  },
  schroeder: {
    locationId: 'summer_camp',
    x: 490,
    y: 560,
    direction: 'down',
    currentActivity: 'Sentado en un tronco junto a la hoguera repasando partituras',
    dialoguePool: [
      'Beethoven amaba los retiros en la naturaleza para componer sus sinfonías más profundas. Lo entiendo perfectamente.',
      'El eco del lago devuelve las melodías con una pureza acústica asombrosa.',
      'La noche del campamento bajo las constelaciones es pura armonía.'
    ]
  },
  snoopy: {
    locationId: 'summer_camp',
    x: 545,
    y: 235,
    direction: 'down',
    currentActivity: 'En su tienda de lona roja junto a Charlie Brown como intrépido explorador',
    dialoguePool: [
      '*Asoma el hocico de su tienda de campaña de lona roja, olfatea el aroma a madera de pino y sonríe como el mayor explorador de la naturaleza.*',
      '*Camina orgullosamente con una mochila diminuta en la espalda listo para su excursión matutina.*'
    ]
  },
  woodstock: {
    locationId: 'summer_camp',
    x: 560,
    y: 220,
    direction: 'down',
    currentActivity: 'Posado sobre la tienda de Snoopy ayudando con ramitas de pino',
    dialoguePool: [
      '*Lleva una ramita de pino en el pico para ayudar a Snoopy a decorar su campamento y pía con alegría montañesa.*'
    ]
  },
  franklin: {
    locationId: 'summer_camp',
    x: 180,
    y: 370,
    direction: 'right',
    currentActivity: 'En el porche del comedor disfrutando del desayuno campestre',
    dialoguePool: [
      '¡El desayuno en el comedor estuvo delicioso! ¡Esas tortitas de arándanos silvestres son insuperables!',
      'Ayer fuimos de excursión hasta la cascada secreta. El agua estaba fría y cristalina, ¡tienes que visitarla, Ari!',
      'Estar todos juntos de campamento hace que el verano se sienta inolvidable.'
    ]
  }
};

/**
 * Returns character data adjusted for the active time of day and current location.
 * Matches schedule, location, position, activities, and time-appropriate dialogues!
 */
export function getActiveCharactersForTime(timeOfDay: TimeOfDay, locationId?: string): CharacterNpc[] {
  return BASE_CHARACTERS_DATA.map((npc) => {
    // If player is at beach, baseball_field, or summer_camp, apply location-specific social presence
    if (locationId === 'beach' && BEACH_CHARACTERS[npc.id]) {
      const override = BEACH_CHARACTERS[npc.id];
      return {
        ...npc,
        ...override,
        dialoguePool: override.dialoguePool || npc.dialoguePool
      };
    }

    if (locationId === 'baseball_field' && BASEBALL_CHARACTERS[npc.id]) {
      const override = BASEBALL_CHARACTERS[npc.id];
      return {
        ...npc,
        ...override,
        dialoguePool: override.dialoguePool || npc.dialoguePool
      };
    }

    if (locationId === 'summer_camp' && SUMMER_CAMP_CHARACTERS[npc.id]) {
      const override = SUMMER_CAMP_CHARACTERS[npc.id];
      return {
        ...npc,
        ...override,
        dialoguePool: override.dialoguePool || npc.dialoguePool
      };
    }

    // Default time-of-day schedule
    const sched = npc.schedules?.[timeOfDay];
    if (!sched) return npc;
    return {
      ...npc,
      locationId: sched.locationId,
      x: sched.x,
      y: sched.y,
      direction: sched.direction || npc.direction,
      currentActivity: sched.currentActivity,
      dialoguePool: sched.dialoguePool
    };
  });
}

