// Intelligent contextual NLP response engine for Peanuts characters
// Provides deeply coherent, in-character replies directly addressing what the user says
// even if API quota is exceeded or offline, complementing Certainty Companion & Gemini.

interface IntentMatcher {
  keywords: string[];
  replies: string[];
}

interface CharacterProfile {
  name: string;
  avatar: string;
  defaultResponses: string[];
  intentMatchers: IntentMatcher[];
}

export const CHARACTER_PROFILES: Record<string, CharacterProfile> = {
  "Charlie Brown": {
    name: "Charlie Brown",
    avatar: "🧢",
    defaultResponses: [
      "A veces siento que el mundo avanza demasiado rápido y yo todavía sigo buscando mi cometa, Ari. Pero me alegra hablar contigo.",
      "¡Caramba! Tienes una forma muy bonita de ver las cosas, Ari. Ojalá tuviera esa misma certeza en el montículo.",
      "Pensaba justo en eso... Es difícil encontrar respuestas claras, pero al menos no estamos solos en el barrio.",
      "A veces la vida parece como cuando Lucy me promete que sostendrá el balón... pero sigo confiando en que un día saldrá bien.",
      "¿Sabes qué me gusta de este barrio, Ari? Que aunque pierda todos los partidos de béisbol, el sol vuelve a salir al día siguiente.",
      "Sentarse en este muro de ladrillo con un amigo sincero como tú hace que cualquier día gris se sienta templado."
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad", "así es", "coincido"],
        replies: [
          "¡Gracias por entenderme, Ari! Casi nadie en el barrio suele darme la razón, especialmente Lucy. Significa mucho para mí.",
          "Es un alivio saber que opinas lo mismo. A veces dudo tanto de mis pensamientos que escuchar una voz amiga me devuelve la calma.",
          "¡Vaya! Al menos en esto coincidimos plenamente. Vamos a sentarnos un ratito más a contemplar la tarde."
        ]
      },
      {
        keywords: ["chill", "tranquilo", "tranqui", "relajarse", "descanso", "paz", "calma", "pasear", "sereno"],
        replies: [
          "Eso es exactamente lo que más me gusta hacer: caminar despacio sin prisas, sintiendo la brisa fresca del otoño.",
          "Un día chill es el mejor antídoto para el estrés de la escuela y los partidos de béisbol. Me alegra compartirlo contigo, Ari.",
          "A veces el mayor logro del día es simplemente encontrar una sombra agradable y respirar hondo."
        ]
      },
      {
        keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos", "qué tal", "que tal", "cómo estás", "como estas"],
        replies: [
          "¡Hola, Ari! Me alegra mucho verte por aquí. Estaba pensando en cómo pasa el día en el vecindario.",
          "¡Hola, Ari! Es un alivio encontrar a un amigo sincero hoy. ¿Qué tal va tu paseo?",
          "¡Hola! Estaba sentado aquí pensando en las cosas de siempre... ¿Cómo estás tú, Ari?"
        ]
      },
      {
        keywords: ["béisbol", "beisbol", "partido", "jugar", "pelota", "lanzador", "pitcher", "equipo", "ganar", "perder"],
        replies: [
          "¡El béisbol! Es mi gran pasión y mi mayor tormento. Hemos perdido noventa partidos seguidos, pero sé que si entrenamos duro, el próximo será nuestro.",
          "Siempre que subo al montículo siento mariposas en el estómago. Pero mientras tenga a mis amigos en las bases, sigo lanzando con fe.",
          "¿Quieres que juguemos luego, Ari? Te dejaré batear primero. Solo prométeme que no lanzarás la pelota hacia el jardín de Lucy."
        ]
      },
      {
        keywords: ["cometa", "árbol", "arbol", "volar", "viento", "hilo"],
        replies: [
          "¡Ese Árbol Come-Cometas tiene un apetito insaciable! Apenas el hilo se tensa con la brisa, siento que el árbol ya está relamiéndose.",
          "Compré una cometa hermosa la semana pasada. Duró en el aire exactamente tres segundos antes de estrellarse contra las ramas. Pero nunca me rindo.",
          "Volar una cometa requiere paciencia y fe en el viento, Ari... dos cosas que a veces me cuestan trabajo, pero no pierdo la esperanza."
        ]
      },
      {
        keywords: ["snoopy", "perro", "beagle", "caseta", "mascota"],
        replies: [
          "Snoopy es el perro más peculiar que conozco. Pasa horas en el tejado creyéndose aviador de la Primera Guerra Mundial o autor premiado.",
          "A veces creo que Snoopy ni siquiera sabe mi nombre, ¡solo me ve como el chico que le trae la comida redonda a las cinco y media!",
          "Aunque tenga sus rarezas y no siempre me haga caso, Snoopy es mi mejor amigo incondicional."
        ]
      },
      {
        keywords: ["triste", "pena", "deprimido", "mal", "llorar", "solo", "soledad", "preocupado", "miedo"],
        replies: [
          "Sé exactamente lo que sientes, Ari. A veces una nube gris parece seguirnos a todas partes. Pero sentarse un rato al sol ayuda mucho.",
          "No estás sola, Ari. A mí me pasa muy seguido. Cuando sientas que nada sale bien, recuerda que yo siempre estaré aquí para escucharte.",
          "A veces ser vulnerable es de lo más valiente que hay. Tómate un respiro, camina por el parque y verás cómo el pecho se aligera un poco."
        ]
      },
      {
        keywords: ["feliz", "alegre", "contento", "bien", "genial", "maravilla", "hermoso", "lindo", "bonito"],
        replies: [
          "¡Qué alegría me da escucharte decir eso, Ari! Tu buen humor es contagioso, de verdad me alegra el día.",
          "¡Caramba, eso suena maravilloso! Esos pequeños momentos de felicidad son los que hacen que todo el esfuerzo valga la pena.",
          "Me alegro mucho por ti, Ari. Ver a mis amigos contentos me hace olvidar hasta las cometas perdidas."
        ]
      },
      {
        keywords: ["gracias", "te quiero", "amigo", "amistad"],
        replies: [
          "¡Gracias a ti, Ari! Tenerte como amiga en este barrio hace que todo valga la pena.",
          "La amistad es lo único que nunca falla, ni siquiera cuando perdemos un partido por cuarenta carreras a cero.",
          "Siempre puedes contar conmigo, Ari. Aunque tropiece con el balón de fútbol americano, aquí estaré."
        ]
      }
    ]
  },

  "Lucy": {
    name: "Lucy Van Pelt",
    avatar: "🎀",
    defaultResponses: [
      "¡Eso te costará cinco centavos de consulta psiquiátrica, Ari! Pero te diré algo gratis: tienes que confiar más en ti misma.",
      "El problema de la mayoría de la gente es que piensan demasiado y actúan demasiado poco. ¡Toma las riendas de tu vida!",
      "Me gusta la gente decidida. Si vas a decir o hacer algo, hazlo con voz fuerte y la cabeza alta, como yo.",
      "Schroeder nunca me escucha cuando le hablo de cosas prácticas, pero tú al menos tienes buen sentido común, Ari.",
      "¡El vecindario necesita líderes fuertes, no gente suspirando en las esquinas! Por eso me hago cargo de todo.",
      "Si todos pusieran cinco centavos en mi alcancía y siguieran mis consejos, este barrio funcionaría como un reloj suizo."
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad", "así es", "coincido"],
        replies: [
          "¡Por supuesto que la tengo, Ari! Si algo sobra en mi cabeza es lucidez. ¡Y ahora abona cinco centavos más por validar mi diagnóstico!",
          "¡Vaya! Al fin alguien con el coeficiente intelectual suficiente en este vecindario para reconocer una verdad como un templo.",
          "¡Exacto! El mundo necesita más gente decidida como nosotras y menos indecisos como mi hermano Linus.",
          "Me alegra que abras los ojos, Ari. Si todos en el barrio siguieran mis reglas, esto sería una utopía perfectamente organizada.",
          "¡Así se habla! Cuando Lucy Van Pelt emite un juicio profesional, la ciencia y la experiencia me respaldan."
        ]
      },
      {
        keywords: ["chill", "tranquilo", "tranqui", "relajarse", "descanso", "paz", "calma"],
        replies: [
          "¿Tranquilidad? Bueno, admito que pasear por el parque con una amiga inteligente como tú es relajante... ¡pero no bajemos la guardia!",
          "A veces hasta una eminencia de la psiquiatría infantil como yo necesita una pausa para admirar el paisaje.",
          "Está bien tomarse las cosas con calma, Ari, siempre y cuando no te vuelvas blando como Charlie Brown."
        ]
      },
      {
        keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos", "qué tal", "que tal", "cómo estás", "como estas"],
        replies: [
          "¡Hola, Ari! Qué bueno que pasas por aquí. ¿Necesitas orientación profesional o solo venías a admirar mi puesto?",
          "¡Hola! El doctor está adentro. Siéntate, dime qué te inquieta y prepara una moneda de cinco centavos.",
          "¡Hola, Ari! Espero que traigas buenas noticias, hoy tengo una agenda muy ocupada repartiendo verdades por el barrio."
        ]
      },
      {
        keywords: ["consulta", "psicóloga", "psicologa", "cabina", "puesto", "5 centavos", "cinco centavos", "doctor", "terapia"],
        replies: [
          "¡Mi puesto de ayuda psiquiátrica es el más eficiente del mundo! Por solo cinco centavos te ahorro diez años de confusiones.",
          "¿Sabes cuál es mi diagnóstico universal? ¡Espabilar y seguir adelante! La vida no espera a los indecisos, Ari.",
          "Cinco centavos en la alcancía, por favor. El sonido del níquel cayendo es el primer paso hacia la claridad mental."
        ]
      },
      {
        keywords: ["schroeder", "piano", "música", "musica", "beethoven", "casarse", "amor"],
        replies: [
          "¡Ah, Schroeder! Pasa todo el día pegado a ese pianito de juguete tocando a Beethoven. Pero yo sé que algún día valorará una buena casa en los suburbios.",
          "Me apoyo en su piano para inspirarlo. Aunque a veces me tira del taburete... ¡la perseverancia femenina lo conquista todo!",
          "Beethoven ya tuvo su momento, ahora es el turno de planear el futuro. Pero tengo que admitir que tiene talento cuando toca."
        ]
      },
      {
        keywords: ["linus", "hermano", "manta", "gran calabaza"],
        replies: [
          "¡Mi hermano Linus me vuelve loca con esa manta andrajosa y su absurda Gran Calabaza! Algún día se la esconderé en el congelador.",
          "Linus tiene potencial intelectual, pero desperdicia los otoños congelándose en un huerto. ¡Necesita disciplina!",
          "Aunque me queje de él, soy su hermana mayor y no permitiré que nadie más se meta con él... excepto yo, claro."
        ]
      },
      {
        keywords: ["charlie brown", "balón", "balon", "patear", "fútbol", "futbol"],
        replies: [
          "¡Pobre Charlie Brown! Siempre cree que sostendré el balón en su sitio. Pero retirar el balón en el último segundo es una lección de física aplicada.",
          "Charlie Brown es un cabeza de chorlito adorable, pero necesita endurecerse un poco para sobrevivir en este mundo.",
          "Si Charlie Brown tuviera un tercio de mi seguridad en sí mismo, ya habría ganado un campeonato de béisbol."
        ]
      },
      {
        keywords: ["gracias", "eres la mejor", "genial", "guapa", "reina"],
        replies: [
          "¡Por supuesto que lo soy, Ari! Los elogios merecidos son bienvenidos en esta consulta sin cargo adicional.",
          "Gracias a ti por apreciarlo. Se necesita buen gusto para reconocer a una líder nata.",
          "De nada, Ari. Cuenta conmigo cuando necesites poner en su lugar a cualquiera en este barrio."
        ]
      }
    ]
  },

  "Linus": {
    name: "Linus Van Pelt",
    avatar: "🧣",
    defaultResponses: [
      "Como decía San Pablo o algún filósofo estoico: no son las cosas las que nos perturban, sino el juicio que nos formamos de ellas, Ari.",
      "Mi manta me recuerda que todos necesitamos un refugio seguro ante la inmensidad del universo. Es muy sabio lo que dices.",
      "En un mundo lleno de prisa e incertidumbres, tus palabras tienen una serenidad admirable, Ari.",
      "A veces la sabiduría más pura está en observar cómo cae una hoja en otoño sin intentar atraparla.",
      "La tranquilidad de esta tarde nos invita a dialogar sobre lo esencial, lejos del ruido innecesario.",
      "Tener un amigo con quien reflexionar en silencio o con pocas palabras es una de las grandes bendiciones de la vida."
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad", "así es", "coincido"],
        replies: [
          "Me alegra profundamente que compartamos esa perspectiva, Ari. La concordia entre mentes pensantes produce una paz inmensa.",
          "Es reconfortante cuando dos personas encuentran una verdad común. Platón decía que dialogar es buscar juntos la luz.",
          "Exactamente. Cuando uno despoja las situaciones del orgullo y las observa con calma, la verdad se manifiesta por sí sola."
        ]
      },
      {
        keywords: ["chill", "tranquilo", "tranqui", "relajarse", "descanso", "paz", "calma", "pasear", "sereno"],
        replies: [
          "Esa actitud serena es el núcleo de la ataraxia estoica: mantener el alma en reposo sin que las tormentas externas la turben.",
          "Amo este ritmo pausado, Ari. El sonido de los árboles y la suavidad de mi manta hacen de cualquier momento un templo de calma.",
          "Pasear tranquilamente por el parque es la mejor medicina contra la ansiedad moderna. Disfrutémoslo plenamente."
        ]
      },
      {
        keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos", "qué tal", "que tal", "cómo estás", "como estas"],
        replies: [
          "¡Hola, Ari! Estaba aquí con mi manta contemplando el horizonte. Qué placer saludarte.",
          "Buenos días, Ari. Dicen que cada saludo sincero renueva la fe en la humanidad.",
          "¡Hola! Es un momento excelente para una conversación reflexiva. ¿En qué estás pensando?"
        ]
      },
      {
        keywords: ["manta", "cobija", "seguridad", "abrigo", "tela"],
        replies: [
          "Mi manta no es una debilidad infantil, Ari. Es una declaración filosófica: un baluarte contra los vientos fríos y las dudas de la existencia.",
          "Acariciar su textura suave me devuelve el equilibrio cuando Lucy empieza con sus gritos o las tareas escolares me abruman.",
          "Todos en el fondo tenemos una manta invisible: algo a lo que nos aferramos para sentirnos en casa. La mía simplemente es de algodón azul."
        ]
      },
      {
        keywords: ["gran calabaza", "calabaza", "huerto", "sinceridad", "fe", "creer", "octubre", "halloween"],
        replies: [
          "¡La Gran Calabaza! Cada noche de brujas espero en el huerto más sincero. No busca hipocresía comercial, solo un corazón puro y devoto.",
          "Muchos se burlan de mi fe, incluso mi hermana Lucy. Pero creer en algo con sincera devoción da sentido a las noches de vigilia.",
          "El secreto del huerto de calabazas es la sinceridad. Donde no hay fingimiento ni vanidad, allí es donde florece la magia."
        ]
      },
      {
        keywords: ["lucy", "hermana", "psicóloga", "5 centavos", "gritar"],
        replies: [
          "Lucy es una fuerza de la naturaleza. Su consulta psiquiátrica de cinco centavos es ruda, pero en el fondo creo que se preocupa por nosotros.",
          "Tener a Lucy de hermana mayor templa el carácter de cualquiera. Aprendes diplomacia antes de aprender a multiplicar.",
          "A veces Lucy me quita la manta para hacerme una prueba de carácter... pero siempre encuentro la forma de recuperarla con astucia."
        ]
      },
      {
        keywords: ["charlie brown", "amigo", "charlie", "béisbol", "cometa"],
        replies: [
          "Charlie Brown es el ser humano más noble que conozco. Su fe en el mundo, pese a todas las decepciones, es una virtud teologal.",
          "Siempre acompaño a Charlie Brown en el muro de ladrillo. Dos amigos en silencio ante el atardecer entienden más que mil discursos.",
          "Charlie Brown nunca deja de intentar patear ese balón, y eso es una hermosa metáfora de la condición humana."
        ]
      }
    ]
  },

  "Snoopy": {
    name: "Snoopy",
    avatar: "🐾",
    defaultResponses: [
      "*Te mira con sus ojos pícaros de beagle, ajusta sus gafas imaginarias de Joe Cool y asiente aprobando tus palabras con elegancia canina.*",
      "*Baila un alegre zapateo sobre sus patitas traseras en el tejado de su caseta y te convida una galleta para perros recién horneada.*",
      "*Escribe en su máquina de escribir: 'Era una tarde luminosa cuando Ari pronunció unas palabras llenas de misterio...'*",
      "*Hace una reverencia teatral con sombrero de copa imaginario, reconociendo el ingenio de tu comentario.*",
      "*Bosteza plácidamente tumbado bocarriba en el tejado de su caseta, saboreando la brisa fresca del vecindario.*",
      "*Mueve las orejas al compás de un jazz de Vince Guaraldi y te sonríe con complicidad canina.*"
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad", "así es"],
        replies: [
          "*Asiente enfáticamente con su hocico blanco, mueve la cola a toda velocidad y te ofrece una palmadita de pata en señal de camaradería.*",
          "*Escribe entusiasmado en su novela: 'Ambos exploradores contemplaron la colina y llegaron al mismo sabio veredicto.'*",
          "*Da tres brinquitos rítmicos sobre sus patitas y levanta ambas orejas en señal de total acuerdo.*"
        ]
      },
      {
        keywords: ["chill", "tranquilo", "tranqui", "relajarse", "descanso", "paz", "calma", "dormir"],
        replies: [
          "*Se estira cuan largo es en la cumbrera roja de su caseta, cruza las patitas y suspira con beatitud canina suprema.*",
          "*Modo Joe Cool activado: se calza las gafas de sol oscuras, se recuesta contra el árbol y disfruta del viento sin mover un solo bigote.*",
          "*Un bostezo suave, un ronroneo de perro feliz y la certeza de que nada supera una siesta a media tarde.*"
        ]
      },
      {
        keywords: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos", "snoopy", "perrito"],
        replies: [
          "*Bate la cola con entusiasmo, da una voltereta en el aire y te da un lametón cariñoso en la mejilla.* ¡Guau!",
          "*Se quita las gafas de sol de Joe Cool con calma magistral, te guiña un ojo y hace un saludo de pata digno de una estrella de cine.*",
          "*Pone una pata sobre su corazón peludo, hace una reverencia teatral y te da la bienvenida a los jardines de su caseta.*"
        ]
      },
      {
        keywords: ["comida", "galleta", "galletas", "hambre", "comer", "cena", "plato", "desayuno", "pizza"],
        replies: [
          "*Sus orejas se enderezan al instante al escuchar la palabra mágica. Toma su plato rojo con la boca y realiza la danza de la cena feliz.*",
          "*Imagina un festín de galletas de chocolate, pizza de pepperoni y helado de vainilla servido por mayordomos franceses.* ¡Slurp!",
          "*Olfatea el aire con desesperación canina y mira su plato vacío con ojos suplicantes llenos de dramatismo shakesperiano.*"
        ]
      },
      {
        keywords: ["volar", "avión", "avion", "barón rojo", "baron rojo", "sopwith camel", "piloto", "guerra"],
        replies: [
          "*Se ajusta las gafas de aviador y la bufanda roja que ondea con el viento. El As de la Primera Guerra Mundial acecha en los cielos de Francia.*",
          "*¡Rat-tat-tat-tat! Hace sonar sus ametralladoras imaginarias esquivando las nubes sobre su caseta tridimensional.*",
          "*Maldice al Barón Rojo con el puño en alto jurando que la próxima vez no logrará perforar el fuselaje de su fiel Sopwith Camel.*"
        ]
      }
    ]
  },

  "Sally": {
    name: "Sally Brown",
    avatar: "🌸",
    defaultResponses: [
      "¡Quién entiende a este mundo, Ari! En la escuela nos hacen memorizar los afluentes del río Misisipi en vez de enseñarnos a patinar.",
      "La vida debería ser un recreo continuo con helados de fresa y cero deberes de matemáticas los fines de semana.",
      "¿Has visto a mi dulce cariñito Linus? Estoy segura de que algún día aceptará casarse conmigo y viviremos en un castillo de algodón.",
      "Amo salir a pasear cuando no hay campana de la escuela sonando. ¡Eres la mejor compañía, Ari!"
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad"],
        replies: [
          "¡Ves! ¡Sabía que alguien inteligente como tú me entendería! ¡Se lo voy a gritar a mi maestra mañana por la mañana!",
          "¡Exacto! ¿Por qué los adultos complican todo tanto cuando las respuestas son tan sencillas y divertidas?",
          "¡Totalmente! Cuando sea grande voy a hacer una ley para que las opiniones sensatas como las nuestras sean obligatorias."
        ]
      },
      {
        keywords: ["chill", "tranquilo", "tranqui", "relajarse", "descanso", "paz", "calma"],
        replies: [
          "¡Viva la vida tranquila! Nada de exámenes sorpresa ni mochilas pesadas. Solo flores, brisa y risas.",
          "Estar chill en el parque con amigos es el mejor pasatiempo del universo. ¡No pienso mover un dedo hasta que caiga el sol!"
        ]
      },
      {
        keywords: ["linus", "novio", "cariñito", "amor", "babbo"],
        replies: [
          "¡Linus es tan inteligente y guapo con su mantita! Aunque me grite '¡No me llames cariñito!', yo sé que en el fondo se derrite por mí.",
          "Le tejí una bufanda a Linus para su cumpleaños, pero Lucy me dijo que era muy cursi. ¡Lucy no sabe nada sobre el amor romántico!"
        ]
      },
      {
        keywords: ["escuela", "tarea", "profesora", "clase", "maestra"],
        replies: [
          "Mi filosofía sobre la tarea escolar es muy clara: ¿para qué hacer hoy lo que puedes olvidar completamente mañana?",
          "Ayer le dije a la maestra que las matemáticas son un constructo social opresivo... ¡y me mandó al despacho del director!"
        ]
      }
    ]
  },

  "Schroeder": {
    name: "Schroeder",
    avatar: "🎹",
    defaultResponses: [
      "La música de Beethoven contiene todo el misterio y la grandeza del espíritu humano. El resto es ruido pasajero.",
      "Cuando toco la Sonata Patética en este piano de juguete, siento que el vecindario entero entra en armonía cósmica.",
      "Lucy se apoyó en mi piano hace un rato quejándose de sus zapatos. Tuve que subir el volumen en fortissimo para no oírla.",
      "El arte exige devoción total y disciplina implacable, Ari. Pero cuando una melodía encaja, el alma descansa."
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad"],
        replies: [
          "Aprecio tu sensibilidad auditiva y conceptual, Ari. Hablar con alguien que comprende el valor de la armonía es un alivio.",
          "Efectivamente. Como decía el propio Beethoven: la música es una revelación más alta que toda la sabiduría y la filosofía.",
          "Exacto. En un mundo lleno de estrépito y opiniones banales, coincidir en la belleza pura es un tesoro."
        ]
      },
      {
        keywords: ["beethoven", "piano", "música", "musica", "tocar", "sonata", "concierto", "bach", "mozart"],
        replies: [
          "Ludwig van Beethoven nació en Bonn en 1770 y cambió la historia de la música para siempre. Cada compás suyo es una tormenta de luz.",
          "No necesito un piano de cola de doce mil dólares para expresar la novena sinfonía; con estas doce teclas amarillas basta si hay pasión.",
          "La música clásica no es aburrida, Ari: tiene pasión, furia, ternura y redención. Solo hay que saber escuchar con el corazón."
        ]
      },
      {
        keywords: ["lucy", "matrimonio", "casarse", "amor"],
        replies: [
          "¡Lucy no entiende nada! Me pregunta por aspiradoras y casas en los suburbios mientras intento perfeccionar la Appassionata.",
          "Beethoven nunca se casó porque su única esposa fue la Sinfonía. Yo seguiré su ilustre senda de soltería y gloria musical."
        ]
      }
    ]
  },

  "Peppermint Patty": {
    name: "Peppermint Patty",
    avatar: "⚾",
    defaultResponses: [
      "¡Qué hay, chaval! El día está que arde para un buen partido de béisbol o una carrera a la pista de hielo.",
      "En el campo de juego no hay rodeos: o le pegas a la bola con todas tus ganas o te regresas al banquillo con la cabeza en alto.",
      "Marcie me dice que debería prestar más atención en clase de geografía... pero es que la ventana del aula da justo al campo de softball.",
      "¡Tienes buen temple, Ari! Me gusta tu estilo directo. ¡Así se juega en este barrio!"
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad"],
        replies: [
          "¡Esa es la actitud, chaval! ¡Choca esos cinco! Nada de andarse con vueltas cuando la jugada está clara.",
          "¡Así se habla! Me gusta la gente que sabe lo que quiere y no duda en cantar las jugadas como son.",
          "¡Exacto, Ari! Si todos tuvieran esa claridad en el diamante, ganaríamos la serie mundial de calle."
        ]
      },
      {
        keywords: ["béisbol", "beisbol", "pelota", "batear", "bate", "partido", "lanzamiento"],
        replies: [
          "¡Ponme una recta pegada y te la mando al tejado de la escuela! El béisbol corre por mis venas, chaval.",
          "Charlie Brown es un buenazo de lanzador, solo le falta creerse que es un león en el montículo. ¡Yo siempre le grito que apriete el brazo!"
        ]
      },
      {
        keywords: ["marcie", "amiga", "señor", "sir"],
        replies: [
          "Marcie es mi mejor compinche, aunque se empeñe en llamarme 'señor' todo el tiempo. ¡Ya le he dicho que no llevo corbata!",
          "Marcie lee unos libros gigantescos que marean solo de verlos, pero cuando necesito una amiga de verdad, siempre está ahí."
        ]
      }
    ]
  },

  "Marcie": {
    name: "Marcie",
    avatar: "👓",
    defaultResponses: [
      "Buenos días, señorita Ari. El entorno goza de una serenidad poética admirable el día de hoy.",
      "A menudo encuentro mayor elocuencia en el murmullo del viento entre los robles que en los discursos ruidosos.",
      "Peppermint Patty me invitó a practicar bateo, pero antes deseaba terminar de leer una antología de Emily Dickinson.",
      "Su cortesía es sumamente reconfortante, Ari. En este vecindario la calma es un bien muy preciado."
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto", "exacto", "totalmente", "verdad"],
        replies: [
          "Su discernimiento es sumamente agudo, señorita Ari. La coincidencia de pareceres racionales es el mayor deleite de la conversación.",
          "Coincido plenamente. Decía Séneca que la verdad es abierta a todos y no ha sido aún acaparada por nadie.",
          "Exacto. Es un verdadero privilegio dialogar con alguien de criterio tan sereno y equilibrado."
        ]
      },
      {
        keywords: ["libro", "leer", "estudiar", "escuela", "biblioteca", "escribir", "cuaderno"],
        replies: [
          "Una biblioteca bien iluminada es el refugio más reconfortante que existe. Cada página es una ventana a otra época.",
          "Escribir las impresiones del día en un cuaderno ayuda a ordenar el pensamiento, Ari. Se lo recomiendo ampliamente.",
          "El estudio no debería ser una obligación tediosa, sino una aventura para descubrir cómo funciona el mundo."
        ]
      },
      {
        keywords: ["peppermint patty", "patty", "señor", "sir"],
        replies: [
          "Peppermint Patty posee una nobleza indomable. Aunque se impaciente conmigo en el campo de pelota, le guardo una lealtad inquebrantable.",
          "La llamo 'señor' por respeto y afecto fraternal. Ella se sonroja, pero sé que comprende el valor de nuestra amistad."
        ]
      }
    ]
  },

  "Woodstock": {
    name: "Woodstock",
    avatar: "🐤",
    defaultResponses: [
      "¡Pío pío pío! *Aletea alegremente dando tres piruetas en el aire y te mira con ojos vivaces.*",
      "¡Piiit! *Da saltitos rítmicos sobre sus patitas anaranjadas y se posa sobre tu hombro con afecto.*",
      "¡Pío-pi-pi-pío! *Hace una diminuta reverencia batiendo sus plumitas amarillas.*",
      "*Asiente enérgicamente con su cabecita amarilla, trinando una suave melodía de complicidad con Ari.*"
    ],
    intentMatchers: [
      {
        keywords: ["si", "sí", "tienes razon", "tienes razón", "de acuerdo", "claro", "cierto"],
        replies: [
          "¡Pío, pío! *Trina tres notas alegres y asiente sacudiendo su pequeño mechón amarillo con entusiasmo.*",
          "¡Piiit! *Aletea de felicidad celebrando que ambos ven el mundo con la misma claridad.*"
        ]
      },
      {
        keywords: ["snoopy", "amigo", "caseta", "perro"],
        replies: [
          "¡Piiit! *Señala la caseta de Snoopy con su piquito amarillo y hace el gesto de escribir en máquina con sus patitas.*",
          "¡Pío pío! *Baila en círculos imitando el zapateo de Snoopy y sonríe con picardía.*"
        ]
      }
    ]
  },
  "Franklin": {
    name: "Franklin",
    avatar: "📘",
    defaultResponses: [
      "Siempre me gusta charlar contigo, Ari. Eres de las pocas personas que saben escuchar sin juzgar.",
      "Mi abuelo dice que la paciencia es la mejor compañera en cualquier camino.",
      "Charlie Brown me contó sobre tu cuaderno de notas. Es una idea estupenda para registrar recuerdos."
    ],
    intentMatchers: [
      {
        keywords: ["hola", "buenos días", "buenas tardes", "hey", "saludos"],
        replies: [
          "¡Hola, Ari! Qué agradable encontrarte en este rincón del barrio. ¿Cómo va tu día?",
          "¡Hola! Estaba dando un paseo tranquilo. Siempre hay algo inspirador en el vecindario."
        ]
      },
      {
        keywords: ["abuelo", "consejo", "sabiduría", "vida", "aprender"],
        replies: [
          "Mi abuelo dice que las mejores respuestas llegan cuando uno camina en silencio.",
          "Cada vez que tengo una duda importante, recuerdo las historias que me contaba mi abuelo."
        ]
      }
    ]
  },
  "Pig-Pen": {
    name: "Pig-Pen",
    avatar: "☁️",
    defaultResponses: [
      "No es suciedad cualquiera, Ari; es polvo de civilizaciones milenarias.",
      "Llevo encima tierra de miles de kilómetros de historia.",
      "La vida es mucho más auténtica cuando no tienes miedo a ensuciarte un poco jugando."
    ],
    intentMatchers: [
      {
        keywords: ["polvo", "tierra", "limpio", "sucio", "lavar", "baño"],
        replies: [
          "¡Ja! Me lavé concienzudamente hace media hora, pero el polvo y yo tenemos un magnetismo natural.",
          "Algunos ven polvo; yo veo geología andante y aventura pura, Ari."
        ]
      },
      {
        keywords: ["hola", "saludos", "cómo estás", "hey"],
        replies: [
          "¡Hola, Ari! Disculpa la nube, hoy el viento sopla a mi favor.",
          "¡Hola! Siempre es un placer compartir un rato de charla en el barrio."
        ]
      }
    ]
  }
};

// Memory ring buffer to avoid repeating recent responses for each character
const recentSpokenResponses = new Map<string, string[]>();

/**
 * Generates an authentic, coherent response strictly matching the character's persona,
 * context, and what the user said, with memory to NEVER repeat recently used replies.
 */
export function getContextualReply(
  characterName: string,
  userMessage: string,
  locationName?: string,
  previousText?: string
): string {
  const normalizedMsg = (userMessage || "").toLowerCase().trim();
  
  // Normalize character lookup
  let profile = CHARACTER_PROFILES[characterName];
  if (!profile) {
    const key = Object.keys(CHARACTER_PROFILES).find((k) => 
      characterName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(characterName.toLowerCase())
    );
    profile = key ? CHARACTER_PROFILES[key] : CHARACTER_PROFILES["Charlie Brown"];
  }

  const charKey = profile.name;
  const recentList = recentSpokenResponses.get(charKey) || [];

  // 1. Look for the best intent match based on keywords
  let candidateReplies: string[] = [];
  for (const matcher of profile.intentMatchers) {
    const hasKeyword = matcher.keywords.some((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(normalizedMsg) || normalizedMsg.includes(kw);
    });

    if (hasKeyword) {
      candidateReplies = matcher.replies;
      break;
    }
  }

  // If no intent matched, use default in-character pool
  if (candidateReplies.length === 0) {
    candidateReplies = profile.defaultResponses;
  }

  // Filter out recent responses and previous text to guarantee fresh, non-repeating dialogue
  const filtered = candidateReplies.filter((rep) => {
    if (previousText && rep === previousText) return false;
    return !recentList.includes(rep);
  });

  const pool = filtered.length > 0 ? filtered : candidateReplies;
  const chosenIndex = Math.floor(Math.random() * pool.length);
  const chosenReply = pool[chosenIndex];

  // Update memory ring buffer (keep last 5)
  const updatedHistory = [chosenReply, ...recentList.filter((r) => r !== chosenReply)].slice(0, 6);
  recentSpokenResponses.set(charKey, updatedHistory);

  return chosenReply;
}
