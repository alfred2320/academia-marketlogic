const CATN=["Prospección","Descubrimiento","Comité de compra","Venta de valor","Objeciones","Negociación","Cierre","Psicología de ventas"];
/* Misiones BLITZ: f = foco (n nuevos, b clientes actuales, a ambos), lv = nivel mínimo recomendado 1..3, cards = jugadas del Play Deck */
const MISSIONS=[
{id:"m1a",m:1,lv:1,f:"a",t:"Perfil que posiciona",d:"Actualiza tu perfil de LinkedIn: foto profesional, headline en 2 líneas con tu por qué y un llamado a la acción.",ev:"Enlace a tu perfil",cards:[1,7],xp:30},
{id:"m1b",m:1,lv:2,f:"n",t:"5 conexiones con valor",d:"Envía 5 invitaciones a decisores de cuentas nuevas con un mensaje de valor y sin pedir nada.",ev:"Cuentas y roles contactados",cards:[2,3,4],xp:40,goal:5},
{id:"m1c",m:1,lv:3,f:"a",t:"Publica con la fórmula 70-20-10",d:"Publica 3 contenidos esta semana: industria, empresa y personal. Mide interacción.",ev:"Enlace o resultados",cards:[7,8],xp:50,goal:3},
{id:"m2a",m:2,lv:1,f:"a",t:"Tus horas sagradas",d:"Bloquea 3 horas diarias de prospección durante 5 días y cumple los bloques.",ev:"Qué lograste cada día",cards:[1,5],xp:40,goal:5},
{id:"m2b",m:2,lv:2,f:"n",t:"10 cuentas, mensaje multicanal",d:"Nombra 10 cuentas de tu PCI y toca cada una por 2 canales distintos con mensajes cortos.",ev:"Lista de cuentas y canales",cards:[2,4,5,6],xp:60,goal:10},
{id:"m2c",m:2,lv:2,f:"b",t:"Reactiva clientes inactivos",d:"Reengancha 5 clientes inactivos con 1 a 3 toques de valor. Registra respuestas.",ev:"Clientes y respuesta",cards:[3,5,8],xp:50,goal:5},
{id:"m2d",m:2,lv:3,f:"a",t:"Cobertura de pipeline",d:"Calcula el pipeline que necesitas según tu cuota y tu tasa de cierre, y mide tu brecha.",ev:"Tus números",cards:[46,47],xp:40},
{id:"m3a",m:3,lv:1,f:"a",t:"Pitch en 3 versiones",d:"Escribe tu pitch de 15, 30 y 60 segundos y pruébalo con un colega.",ev:"Tu pitch de 30 segundos",cards:[1,7,8],xp:40},
{id:"m3b",m:3,lv:2,f:"n",t:"3 descubrimientos con 5 factores",d:"En 3 conversaciones nuevas, documenta hechos, problemas, impacto, causas y efecto.",ev:"Resumen de una conversación",cards:[9,10,11,12],xp:70,goal:3},
{id:"m3c",m:3,lv:2,f:"b",t:"Descubrimiento en cuenta actual",d:"Haz una reunión de descubrimiento con un cliente actual para hallar un problema nuevo que podamos resolver.",ev:"Problema hallado",cards:[9,13,14,19],xp:70},
{id:"m3d",m:3,lv:3,f:"a",t:"Un insight que desafía",d:"Prepara un punto de vista distinto para una cuenta y preséntalo con datos.",ev:"Insight y respuesta",cards:[24,25,27,28],xp:70},
{id:"m4a",m:4,lv:1,f:"a",t:"Pescar con red",d:"En 2 reuniones usa solo preguntas abiertas y resume antes de seguir.",ev:"Preguntas que usaste",cards:[9,13],xp:40,goal:2},
{id:"m4b",m:4,lv:2,f:"a",t:"Mi plataforma de negociación",d:"Completa tu plataforma: pros y contras, información a pedir y cuidar, concesiones a dar y pedir.",ev:"Tu plataforma",cards:[41,42,43,44],xp:60},
{id:"m4c",m:4,lv:3,f:"b",t:"Mapa de la experiencia de compra",d:"Mapea para una cuenta actual dónde aportas valor y dónde puede ganarte la competencia.",ev:"Tu mapa",cards:[26,27,29],xp:60},
{id:"m5a",m:5,lv:1,f:"a",t:"Responde la objeción de precio",d:"Practica en role play la respuesta a “es muy caro” sin dar descuento.",ev:"Tu respuesta",cards:[31,37,41],xp:40},
{id:"m5b",m:5,lv:2,f:"n",t:"Entiende el proceso de decisión",d:"En 2 oportunidades nuevas confirma quién, cómo, dónde, qué, por qué ahora y cuándo.",ev:"Resumen por oportunidad",cards:[17,18,38,46],xp:70,goal:2},
{id:"m5c",m:5,lv:2,f:"b",t:"Cross y up-selling con permiso",d:"Propón un servicio adicional o un nuevo departamento a 2 clientes con un caso de éxito.",ev:"Cliente y respuesta",cards:[20,23,47,49],xp:70,goal:2},
{id:"m5d",m:5,lv:3,f:"a",t:"Pide un referido",d:"Pide una referencia a un cliente satisfecho, con una acción concreta para el referente.",ev:"Quién y cuándo",cards:[18,47,49],xp:60},
{id:"m6a",m:6,lv:1,f:"a",t:"Mi hábito base",d:"Define señal, acción y premio para un hábito de prospección y practícalo 7 días.",ev:"Cómo te fue",cards:[50,51],xp:40,goal:7},
{id:"m6b",m:6,lv:2,f:"a",t:"Objetivo SMART 30-60-90",d:"Escribe un objetivo SMART con hitos a 30, 60 y 90 días.",ev:"Tu objetivo",cards:[46,52],xp:50},
{id:"m6c",m:6,lv:3,f:"a",t:"Mi brand story en 7 pasos",d:"Escribe tu historia de marca con el cliente como héroe y tú como guía.",ev:"Tu historia",cards:[26,28,30],xp:60},
{id:"m7a",m:7,lv:1,f:"a",t:"Tu roadmap completo",d:"Completa las 4 etapas de tu roadmap y compártelo con tu líder.",ev:"Resumen de tu roadmap",cards:[1,9,24,46],xp:80},
{id:"m7b",m:7,lv:2,f:"a",t:"Calibra tu detector 1.0",d:"Documenta problemas por buyer persona y valida el detector con una conversación real.",ev:"Tu detector",cards:[10,11,12,15],xp:70},
{id:"m7c",m:7,lv:3,f:"a",t:"Lidera un BLITZ de tu equipo",d:"Diseña un sprint con metas, cadencia y revisión semanal para tu equipo o territorio.",ev:"Plan del sprint",cards:[46,47,48,52],xp:90}
];
/* Examen final: escenarios */
const EXAM=[
{m:1,q:"Un decisor aceptó tu invitación. ¿Qué mensaje envías primero?",o:["Mi pitch con precios","Agradecimiento y un contenido útil para su industria","Una reunión de 1 hora","Un PDF con el catálogo"],a:1,e:"Primero valor y confianza. El pitch en frío rompe la relación."},
{m:1,q:"Quieres publicar esta semana. ¿Qué mezcla de contenido usas?",o:["100% producto","70% industria, 20% empresa, 10% personal","50% ofertas, 50% memes","Solo casos de éxito"],a:1,e:"La fórmula 70-20-10 construye autoridad sin sonar a pitch."},
{m:1,q:"Un prospecto sin ninguna familiaridad contigo. ¿Cuántos toques puede requerir?",o:["1 a 3","4 a 6","20 a 50","Ninguno"],a:2,e:"La familiaridad se construye con muchos toques de valor."},
{m:2,q:"Si hoy no prospectas, ¿cuándo lo pagas?",o:["Nunca","En los próximos 90 días","Mañana","En 5 años"],a:1,e:"La prospección de 30 días da resultados en los siguientes 90."},
{m:2,q:"Cuota de $20,000 y cierre del 25%. ¿Qué pipeline necesitas?",o:["$40,000","$60,000","$80,000","$100,000"],a:2,e:"20,000 dividido entre 0.25 es 80,000."},
{m:2,q:"¿Cuál es la longitud sugerida del mensaje por LinkedIn o email?",o:["Más de 300 palabras","Menos de 100 palabras, terminando en pregunta","Solo un emoji","Un adjunto de 20 páginas"],a:1,e:"Corto, relevante y con una pregunta que invite a responder."},
{m:3,q:"El cliente pide una demo en la primera llamada. ¿Qué haces?",o:["Muestras todas las funciones","Haces descubrimiento primero y luego demuestras hasta 6 funciones","Envías un video","Rechazas la reunión"],a:1,e:"Sin descubrimiento no hay demo."},
{m:3,q:"¿Cuál es el estilo de vendedor que gana más en ventas complejas?",o:["Lobo solitario","Solucionador reactivo","Desafiante","Trabajador"],a:2,e:"El desafiante lleva su éxito de 39% a 54%."},
{m:3,q:"El cliente dice “queremos más eficiencia”. ¿Qué haces?",o:["Anotas y sigues","Cuantificas: “¿cuánta productividad es 15% más?”","Subes el precio","Cambias de tema"],a:1,e:"Los resultados cuantificables sostienen el valor."},
{m:4,q:"¿Qué haces antes de reunirte con un cliente según Sandler?",o:["Nada","Firmas un contrato previo con objetivo, agenda y tiempo","Envías la propuesta","Pides descuento"],a:1,e:"Acuerdas expectativas y cómo decidirán si hay fit."},
{m:4,q:"El cliente describe un problema. ¿Qué es lo mejor que puedes hacer?",o:["Dar la solución inmediata","Resumir lo que oíste y preguntar “cuéntame más sobre...”","Cambiar el tema al precio","Interrumpir"],a:1,e:"Escuchar activamente abre más información y confianza."},
{m:4,q:"El cliente se siente incómodo con la negociación. ¿Qué pasa si siente que fue injusta?",o:["Nada","Sale del negocio o hace dolorosa la implementación","Compra más","Te agradece"],a:1,e:"La percepción de injusticia destruye valor a largo plazo."},
{m:5,q:"Un prospecto desaparece. ¿Qué dices?",o:["¿Sigues vivo?","“Estoy confundido. Tú dijiste...” y recuerdas estado actual y futuro","Le mandas descuento","Lo borras"],a:1,e:"Acciona con el estado actual y futuro, sin hablar del producto."},
{m:5,q:"Te piden un trial. ¿Cuándo aceptas?",o:["Siempre","Cuando pagan instalación, definen métricas y se comprometen a comprar","Cuando lo piden 2 veces","Nunca"],a:1,e:"Si y solo si."},
{m:5,q:"El cliente está satisfecho. ¿Cuál es el mejor paso para obtener referidos?",o:["Esperar que lleguen","Un email genérico","Que lo pida quien tenga mejor relación, atado a una acción concreta","Una encuesta"],a:2,e:"El referido debe implicar una acción del referente."},
{m:6,q:"¿Cuál es el hábito mejor definido?",o:["Voy a prospectar más","Cuando veo el teléfono (señal), prospecto (acción) y registro el avance (premio)","Hacer algo","Intentar"],a:1,e:"Señal, acción y premio."},
{m:6,q:"¿Qué debes visualizar para sostener tus hábitos?",o:["El resultado final","El proceso de tu día","El bono","Nada"],a:1,e:"Visualizar el proceso entrena la ejecución."},
{m:6,q:"En tu brand story, ¿quién es el villano?",o:["El competidor","El problema del cliente definido desde su óptica","El gerente","El precio"],a:1,e:"Es la raíz del problema, con nivel externo, interno y filosófico."},
{m:7,q:"¿Qué etapa del roadmap incluye elevator pitch, brecha y detector de problemas?",o:["Etapa 1","Etapa 2","Etapa 3","Etapa 4"],a:2,e:"Etapa 3: pitch, brecha y puente y detector 1.0."},
{m:7,q:"¿Qué métricas incluyes en tu roadmap?",o:["Las que se pueden evaluar, analizar y optimizar","Las que lucen bien","Ninguna","Solo ventas ganadas"],a:0,e:"Lo que no se mide no se mejora."},
{m:7,q:"Buscas crecer cuentas actuales. ¿Qué priorizas?",o:["Solo prospección fría","Multithread, valor, cross y up-selling, y referidos","Solo descuentos","Cerrar rápido"],a:1,e:"Para base instalada importan el multihilo y la expansión."}
];
/* Diagnóstico de nivel y foco */
const DIAG=[
{q:"¿Cuánto tiempo llevas vendiendo servicios B2B?",o:["Menos de 1 año","1 a 3 años","Más de 3 años"],pts:[0,1,2]},
{q:"¿Con qué frecuencia prospectas de forma planificada?",o:["Casi nunca","Algunos días","Todos los días con bloques fijos"],pts:[0,1,2]},
{q:"¿Qué tan seguro estás en conversaciones de descubrimiento?",o:["Todavía improviso","Tengo preguntas base","Uso una estructura y cuantifico el impacto"],pts:[0,1,2]},
{q:"¿Cómo manejas hoy la negociación y el precio?",o:["Doy descuento para cerrar","Tengo límites pero improviso","Uso plataforma de negociación y concesiones recíprocas"],pts:[0,1,2]},
{q:"¿Cómo llevas tu pipeline y tus métricas?",o:["No las llevo","Las reviso a veces","Reviso semanalmente con metas 30-60-90"],pts:[0,1,2]}
];
const LEVELS=[
{n:"Arranque",d:"Construyes la base: perfil, rutina y primeras conversaciones.",c:"Recorres los 7 módulos completos."},
{n:"Impulso",d:"Ya vendes con método. Ahora afinas descubrimiento, negociación y cierre.",c:"Puedes saltar a los quizzes y repasar solo lo que falle."},
{n:"Liderazgo",d:"Eres referente. Aplicas el método y lo llevas al equipo.",c:"Examen de salida y misiones de nivel avanzado."}
];
const FOCUS={
n:{n:"Nuevos clientes",d:"Abrir cuentas nuevas con prospección, descubrimiento y comité de compra.",ord:[1,2,3,4,5,6,7],cats:[0,1,2,3,4,5,6,7]},
b:{n:"Clientes actuales",d:"Crecer cuentas con valor, multihilo, up y cross selling y referidos.",ord:[3,4,5,2,1,6,7],cats:[1,2,3,6,5,4,7,0]},
a:{n:"Ambos",d:"Equilibrio entre abrir cuentas nuevas y crecer las actuales.",ord:[1,2,3,4,5,6,7],cats:[0,1,2,3,4,5,6,7]}
};
const BLITZ_DEF={name:"BLITZ",desc:"Sprint comercial en ejecución. Cada misión que entregas suma a las metas del equipo.",start:"",end:"",goal:50};
const VIDEO_DEF={};
