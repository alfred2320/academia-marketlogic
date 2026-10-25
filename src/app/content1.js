/* ===== Contenido: Sales Learning Path (7 sesiones) ===== */
const BUNDLES=[
{id:"b1",n:"Abrir conversaciones",d:"Marca personal, rutina de prospección y multicanal.",mods:[1,2],cats:[0]},
{id:"b2",n:"Descubrir y diferenciar",d:"Pitch, brecha, descubrimiento y vendedor desafiante.",mods:[3],cats:[1,2,3]},
{id:"b3",n:"Negociar y cerrar",d:"Negociación de valor, cierre, referidos y posventa.",mods:[4,5],cats:[4,5,6]},
{id:"b4",n:"Hábitos y roadmap",d:"Gestión, métricas, brand story y tu plan 30-60-90.",mods:[6,7],cats:[7]}
];
const MODS=[
{id:1,b:"b1",t:"Tácticas y hábitos de Social Selling",s:"Social Selling",min:55,
 p:"Crea tu marca personal, conecta con decisores y mide resultados.",
 tarea:["Crea tu perfil de LinkedIn con lo aprendido y comparte el enlace.","Entra a linkedin.com/sales/ssi y guarda una captura de tu índice SSI."],
 lessons:[
 {id:"1.1",t:"Por qué social selling ahora",sc:[
  {k:"El comprador",h:"Llega con la lista corta hecha",b:"De cada 10 compradores B2B, 9 compran a uno de los 3 proveedores que ya tenían en mente cuando empezaron a buscar.",s:"90%"},
  {k:"El comprador",h:"No quiere hablar contigo todavía",b:"El 59% prefiere no hablar con un vendedor hasta estar listo para comprar. Tu perfil y tu contenido trabajan antes que tú.",s:"59%"},
  {k:"Definición",h:"Encontrar, conectar, involucrar e influir",b:"Social selling es usar tus redes para hallar prospectos adecuados, construir relaciones de confianza y obtener inteligencia de mercado."},
  {k:"Resultado",h:"Ya es parte de cómo ganamos clientes",b:"El 32% de los clientes de MarketLogic son resultado de una estrategia de social selling.",s:"32%"}]},
 {id:"1.2",t:"Tu marca y tus conexiones",sc:[
  {k:"Paso 1",h:"Todos tenemos una marca personal",b:"Lo quieras o no. Trabaja la tuya: un perfil con foto profesional se ve 14 veces más que uno sin foto.",s:"14x"},
  {k:"Paso 1",h:"Tu headline en dos líneas",b:"Quién eres, tu por qué, tu trayectoria, tu empresa y un llamado a la acción. Tienes 7 segundos. Nunca dejes el idioma predeterminado de LinkedIn.",s:"7 s"},
  {k:"Paso 2",h:"Empieza por quienes ya te conocen",b:"La gente confía en colegas y conocidos. Pide introducciones a través de conexiones en común y agradece cada conexión aceptada."},
  {k:"Paso 2",h:"Invitaciones en frío, con cuidado",b:"Úsalas esporádicamente, con un mensaje de valor y sin pedir nada. Nunca agregues tus conexiones a una lista de email marketing."}]},
 {id:"1.3",t:"Interactuar y medir",sc:[
  {k:"Paso 3",h:"Califica de forma progresiva",b:"Primero la cuenta (¿relación de largo plazo?), luego la oportunidad y por último los influenciadores: champion, escéptico, obstructor."},
  {k:"Paso 3",h:"Fórmula de contenido 70, 20, 10",b:"70% industria, 20% empresa y 10% personal. Comparte conocimiento, casos de éxito y preguntas. No hagas pitch de ventas en público.",s:"70/20/10"},
  {k:"Paso 3",h:"La familiaridad se construye con toques",b:"Reenganchar un cliente inactivo toma 1 a 3 toques. Un prospecto sin ninguna familiaridad puede tomar 20 a 50.",s:"20 a 50"},
  {k:"Paso 4",h:"Mide para mejorar",b:"Vistas de perfil, interacción con tus publicaciones, crecimiento de conexiones y tu SSI. Ventas y marketing deben compartir KPIs y definición de lead."}]}
 ],
 q:[
 {q:"¿Cuáles son los 4 pasos del social selling de la sesión?",o:["Construye tu marca, conecta, interactúa y mide","Publica, vende, cierra y factura","Busca, llama, envía y espera","Segmenta, automatiza, escala y reporta"],a:0,e:"Marca, conexión, interacción y medición forman el ciclo. Cada paso alimenta al siguiente."},
 {q:"¿Qué fórmula de contenido recomienda la sesión?",o:["70% industria, 20% empresa, 10% personal","70% empresa, 20% industria, 10% personal","50% producto, 50% ofertas","100% casos de éxito"],a:0,e:"Quien lidera con industria gana autoridad. La empresa y lo personal acompañan, sin pitch."},
 {q:"Te llega la oportunidad de enviar una invitación en frío. ¿Qué haces?",o:["La envías esporádicamente con un mensaje de valor y sin pedir nada","La envías en masa con tu pitch","Agregas al contacto a tu lista de email marketing","Pides reunión en el primer mensaje"],a:0,e:"La meta es una conexión mínima. Agregar contactos a listas de email sin permiso está mal visto y en algunos países es ilegal."},
 {q:"¿Cuántos segundos tienes para dar una buena impresión con tu perfil?",o:["2","7","15","30"],a:1,e:"Son 7 segundos. Por eso el headline y la foto importan tanto."},
 {q:"¿Cuántos toques puede requerir un prospecto sin ninguna familiaridad (Jeb Blount)?",o:["1 a 3","5 a 10","20 a 50","Solo 1"],a:2,e:"Sin familiaridad previa hay que sumar muchos toques de valor. Con un cliente inactivo bastan 1 a 3."},
 {q:"¿Qué índice de LinkedIn compara tu actividad de social selling con la de tus colegas?",o:["Lead Builder","Smart Links","Social Selling Index (SSI)","InMail"],a:2,e:"El SSI mide marca, personas correctas, interacción y relaciones. Está en linkedin.com/sales/ssi."}
 ]},
{id:2,b:"b1",t:"Pipeline digital constante",s:"Pipeline",min:55,
 p:"Organiza tu día, prospecta multicanal y maneja objeciones.",
 tarea:["Explica qué significan las 3E.","Escribe el mensaje corto que usarás para prospectar por LinkedIn.","Nombra 10 cuentas para prospectar aplicando los tips de la sesión."],
 lessons:[
 {id:"2.1",t:"Estructura tu día con las 3E",sc:[
  {k:"Hábito",h:"Prospectar es el arte de interrumpir con valor",b:"Creatividad, método y compromiso. Es un juego de números: entender, aprender y optimizar."},
  {k:"Las 3E",h:"Estructura, exploración y explotación",b:"Estructura es tu CRM y tu plan diario. Exploración es la prospección diaria. Explotación es gestionar lo que ya cosechaste: clientes, up y cross selling.",s:"3E"},
  {k:"Exploración",h:"Tus horas sagradas",b:"Bloquea 3 horas al día: primera hora, mediodía y tarde. Trátalas como una reunión con tu mejor cliente, el que estás por conocer.",s:"3 h"},
  {k:"Estructura",h:"CRM sin BEBaS",b:"Basura entra, basura sale. Si alguien leyera tus notas e historial, ¿sabría cómo madurar ese lead? Rol, vertical, objetivo, calificación y canal deben estar completos."}]},
 {id:"2.2",t:"Interrumpir con valor, en varios canales",sc:[
  {k:"Enfoque",h:"Prospecta donde puedes ganar",b:"Define tu perfil de cliente ideal: vertical, subvertical, roles, geografía y tamaño. Tus clientes actuales son la primera referencia."},
  {k:"Teléfono",h:"5 pasos en una llamada",b:"Di su nombre, identifícate, di lo que quieres, crea un puente con un por qué y compromete la respuesta. Haz 25 a 50 dials por hora.",s:"25 a 50"},
  {k:"Email",h:"Asunto de 40 a 50 caracteres",b:"Asunto con intriga, oferta clara, solicitud razonable y valor para el cliente. Corto, relevante y sin adjuntos ni bulk.",s:"40 a 50"},
  {k:"LinkedIn y WhatsApp",h:"Menos de 100 palabras",b:"Simple, sin adjuntos, con una conexión personal y terminando en pregunta. En WhatsApp: identifícate, sé breve y usa enlaces transparentes."}]},
 {id:"2.3",t:"Objeciones y pipeline sano",sc:[
  {k:"Objeciones",h:"Tres claves: ancla, disrumpe, pregunta otra vez",b:"No reacciones por instinto. Responde lo que no esperan y vuelve a preguntar. Si no hay manera, no lo tomes personal y pasa al siguiente."},
  {k:"Pregunta",h:"Asume que vas a ganar",b:"Quien pregunta con confianza y explica el por qué logra su objetivo en el 70% de los casos. Pide menos de lo que ofreces en valor.",s:"70%"},
  {k:"Números",h:"Conoce tu cobertura de pipeline",b:"Con una cuota de $10,000 y 25% de cierre necesitas $40,000 de pipeline. Si cierras 5%, necesitas $200,000.",s:"$40K"},
  {k:"Ley de reemplazo",h:"Lo que prospectas hoy llega en 90 días",b:"La prospección de 30 días trae resultados en los próximos 90. Si hoy no prospectas, lo pagarás después.",s:"30 a 90"}]}
 ],
 q:[
 {q:"¿Qué significan las 3E?",o:["Estructura, exploración y explotación","Estructura, ejecución y exposición","Estrategia, energía y enfoque","Exploración, escalamiento y eficiencia"],a:0,e:"Estructura es tu CRM y plan, exploración la prospección diaria y explotación la gestión de lo ya cosechado."},
 {q:"¿Cuánto tiempo bloqueas al día para tus horas sagradas de prospección?",o:["30 minutos","1 hora","3 horas","6 horas"],a:2,e:"Tres bloques sumando 3 horas: primera hora, mediodía y tarde."},
 {q:"¿Cuántos dials por hora sugiere la sesión en tu bloque de llamadas?",o:["5 a 10","10 a 15","25 a 50","100"],a:2,e:"El volumen es parte del juego de números, siempre con el mensaje de 5 pasos."},
 {q:"¿Qué longitud recomienda la sesión para el asunto de un email de prospección?",o:["10 a 20 caracteres","40 a 50 caracteres","100 a 120 caracteres","Sin límite"],a:1,e:"Un asunto corto con intriga se lee completo, también en móvil."},
 {q:"Según la ley de los 30 días de Blount, ¿qué pasa si hoy no prospectas?",o:["No pasa nada","Lo pagas en algún momento de los próximos 90 días","Lo recuperas mañana sin costo","Mejora tu tasa de cierre"],a:1,e:"La prospección de un período de 30 días da resultados en los próximos 90."},
 {q:"Tu cuota es $10,000 y tu tasa de cierre es 25%. ¿Qué pipeline necesitas?",o:["$25,000","$40,000","$100,000","$200,000"],a:1,e:"10,000 dividido entre 0.25 es 40,000. A mayor tasa de cierre, menos pipeline necesitas."}
 ]},
{id:3,b:"b2",t:"Habilidades para ganar en la era digital",s:"Habilidades",min:60,
 p:"Pitch, brecha de valor, descubrimiento y el perfil del vendedor desafiante.",
 tarea:["Nombra los 5 factores de un buen descubrimiento del estado actual.","Crea tu elevator pitch con lo aprendido.","Escribe qué tipo de vendedor eres y por qué."],
 lessons:[
 {id:"3.1",t:"Elevator pitch, brecha y puente de V.A.L.O.R.",sc:[
  {k:"Pitch",h:"30 segundos que llevan a 5 minutos",b:"Headline, tres beneficios enfocados en el cliente y una evidencia. Prepara tres versiones: 15 segundos, 30 segundos y 1 minuto.",s:"15/30/60"},
  {k:"Pitch",h:"No hables de productos",b:"Demuestra que entiendes su situación con términos como frustración, estrés o paz mental. Endulzantes: sorpresa, intriga, brecha de conocimiento y capacidad única."},
  {k:"Brecha",h:"Del estado actual al estado futuro",b:"En cada venta hay una brecha. Se co-crea con el cliente: su problema de hoy y su aspiración profesional y emocional de mañana."},
  {k:"Puente",h:"V.A.L.O.R.",b:"Ventaja competitiva, Automatización, Limitar residuos, Originalidad y Reducir costos. El puente aparece como resultado natural del descubrimiento."}]},
 {id:"3.2",t:"Descubrimiento: el detector de problemas",sc:[
  {k:"Descubrimiento",h:"Es la enfermedad, no el síntoma",b:"Piensa como doctor: más impacto, más brecha y más valor de tu solución. Los clientes quieren hablar de negocio, no de TI."},
  {k:"Descubrimiento",h:"5 factores del estado actual",b:"Hechos, problemas, impacto, causas y efecto. Agrega las emociones que la situación provoca en el cliente.",s:"5"},
  {k:"Preguntas",h:"Cuatro tipos de preguntas",b:"Investigativas, de proceso, provocativas y confirmatorias. Busca respuestas cuantificables: no “más eficiencia”, sino “15% más de productividad”."},
  {k:"Demo",h:"Sin descubrimiento no hay demo",b:"No mezcles los dos. La demo muestra máximo 6 funciones que resuelven el problema ya entendido.",s:"6"}]},
 {id:"3.3",t:"El vendedor desafiante",sc:[
  {k:"Perfiles",h:"Cinco tipos de vendedor",b:"Fabricante de relaciones, trabajador, lobo solitario, solucionador reactivo y desafiante. En ventas complejas el desafiante exitoso sube de 39% a 54%.",s:"39 a 54%"},
  {k:"Desafiante",h:"Opina con expertise y habla de dinero",b:"Conoce al cliente, ofrece un punto de vista distinto y no necesita su aprobación. El factor decisivo es el valor que genera su expertise."},
  {k:"Cliente",h:"Resiste el cambio",b:"Competimos contra la tranquilidad de lo conocido. Reduce el riesgo y la aversión a la pérdida: se valora 300% más lo que se pierde que lo que se deja de ganar.",s:"300%"},
  {k:"Relación",h:"De proveedor a asesor estratégico",b:"Proveedor es transaccional, consultor es experto y asesor estratégico comparte sus planes contigo. Juega a largo plazo."}]}
 ],
 q:[
 {q:"¿Cuál NO es una de las cinco palancas del puente V.A.L.O.R.?",o:["Reducir costos","Automatización","Limitar residuos","Aumentar descuentos"],a:3,e:"Las cinco son: Ventaja competitiva, Automatización, Limitar residuos, Originalidad y Reducir costos."},
 {q:"¿Cuáles son los 5 factores de un buen descubrimiento del estado actual?",o:["Hechos, problemas, impacto, causas y efecto","Precio, plazo, alcance, riesgo y garantía","Identificar emociones, empatía, influencia, aversión y silencio","Comunicación, procesamiento, feedback, impacto y hechos"],a:0,e:"Parten de los hechos y llegan al efecto sobre el resto de la organización."},
 {q:"¿Cuál es la regla entre descubrimiento y demo?",o:["Primero demo, luego descubrimiento","30 minutos de cada uno","Sin descubrimiento no hay demo y no se mezclan","La demo reemplaza al descubrimiento"],a:2,e:"La demo sin supuestos solo es posible después de entender la necesidad."},
 {q:"En ventas complejas, ¿qué tipo de vendedor suele ganar?",o:["Lobo solitario","Fabricante de relaciones","Solucionador reactivo","Desafiante"],a:3,e:"El desafiante sube su tasa de éxito de 39% a 54% en ventas complejas."},
 {q:"¿Cuánto tarda una persona en evaluar inconscientemente a otra en un primer encuentro?",o:["2 segundos","30 segundos","2 minutos","10 minutos"],a:0,e:"Por eso cámara, fondo y puntualidad cuentan desde el primer segundo."},
 {q:"¿Cuántas características muestra como máximo una demo de una hora?",o:["3","6","12","Todas las del catálogo"],a:1,e:"Seis, enfocadas en el problema del cliente."}
 ]}
];
