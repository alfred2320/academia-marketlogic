# Academia MarketLogic

Sales Learning Path de MarketLogic como PWA instalable: 7 módulos, 21 capítulos con video, quizzes, misiones BLITZ ligadas al Sales Play Deck, examen final y certificado. Se adapta al nivel y al foco (clientes nuevos o existentes) de cada persona.

**Stack:** HTML/JS sin framework (un solo archivo compilado), Supabase (login con Google y base de datos con reglas de seguridad), Cloudflare Pages (hosting en `mymarketlogic.net`), YouTube no listado (videos).

## Puesta en marcha

Sigue [docs/SETUP.md](docs/SETUP.md). Resumen: 1) Supabase, 2) Google, 3) Cloudflare Pages, 4) videos en YouTube, 5) primer administrador.

## Cómo se trabaja con Claude

Ver [docs/OPERACION.md](docs/OPERACION.md). Resumen: abres este repositorio con Claude Code, pides el cambio, Claude lo hace en una rama, corre las pruebas y abre un pull request. Al aprobarlo y fusionarlo, Cloudflare publica solo.

## Estructura

```
src/app/            App: contenido (content1-3.js), pantallas (app1-5.js), estilos y plantilla
src/platform.js     Capa PWA: login Google, base Supabase, descargas e instalación
src/sw.template.js  Service worker (modo sin conexión y avisos de nueva versión)
src/data/           Tarjetas del Sales Play Deck
src/sessions/       Texto extraído de las 7 sesiones (fuente del contenido)
supabase/schema.sql Tablas, reglas de seguridad y triggers
public/             Lo que se publica en Cloudflare Pages (se genera con build.py)
dist/               Versión para claude.ai (artifact), se genera con build.py
tests/              Pruebas: app, PWA y reglas de seguridad
tools/video/        Pipeline que genera los videos (guion, voz, render)
```

## Comandos

```
npm install           # una vez (solo para pruebas)
python3 build.py      # compila public/ y dist/
npm test              # compila y corre las 3 suites de pruebas
```

`public/` se versiona compilado, así Cloudflare no necesita paso de build.

## Notas de seguridad

- `config.js` contiene la URL y la clave `anon` de Supabase. Son públicas por diseño. La seguridad real vive en `supabase/schema.sql` (reglas por fila) y en el login con Google.
- Nunca pongas la clave `service_role` de Supabase en este repositorio.
- Los videos no listados de YouTube los puede ver quien tenga el enlace. Si algún contenido es confidencial, usa Cloudflare Stream con URLs firmadas.
