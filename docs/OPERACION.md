# Operación y mejoras con Claude

## Primer push (una sola vez)

1. En GitHub crea un repositorio **privado y vacío**, por ejemplo `academia-marketlogic`.
2. Desde la carpeta del proyecto:
   ```
   git init -b main
   git add .
   git commit -m "Academia MarketLogic PWA"
   git remote add origin git@github.com:TU-ORG/academia-marketlogic.git
   git push -u origin main
   ```
3. Si trabajas con Claude desde claude.ai o Claude Code en la web, conecta el repositorio desde Settings > Connectors > GitHub o con el selector de repositorio de la sesión.

## Flujo de cambios

1. Abres el repositorio con Claude Code (terminal, escritorio o web) y pides el cambio en lenguaje normal.
2. Claude trabaja en una rama, corre `npm test` y abre un pull request.
3. Tú revisas la vista previa que Cloudflare genera para cada pull request y lo aprueban.
4. Al fusionar a `main`, Cloudflare publica en `academia.mymarketlogic.net`. Quienes tengan la app instalada ven el aviso "Hay una versión nueva".

Ejemplos de pedidos: "agrega un módulo 8 de renovaciones con 3 lecciones y quiz", "cambia el puntaje mínimo del examen a 85%", "agrega la jugada de reuniones a las misiones BLITZ", "muestra el ranking por país".

## Dónde vive cada cosa

| Quiero cambiar | Dónde |
|---|---|
| Módulos, lecciones, quizzes, examen | `src/app/content1.js`, `content2.js`, `content3.js` |
| Misiones BLITZ y jugadas del Play Deck | `content*.js` (MISSIONS) y `src/data/cards.json` |
| Pantallas y comportamiento | `src/app/app1.js` a `app5.js` |
| Colores y estilos (marca) | `src/app/styles.css` |
| Login, base de datos, instalación | `src/platform.js` |
| Reglas de seguridad | `supabase/schema.sql` (se corre en el SQL Editor de Supabase) |
| Meta de BLITZ, videos, accesos | Dentro de la app, pestaña **Equipo** (no requiere código) |

Después de cambiar `schema.sql` hay que volver a correrlo en Supabase. Es idempotente.

## Auditoría de usuarios

- **Equipo > Resumen:** una fila por persona con nivel, foco, lecciones, quizzes, misiones, examen y certificado. Exporta CSV.
- **Equipo > Accesos:** quién tiene acceso, bloquear y reactivar. El bloqueo se aplica en el servidor (la persona deja de poder guardar y ver datos).
- **Equipo > BLITZ:** meta de la campaña y validación de misiones entregadas.
- Registro de inicios de sesión: Supabase **Authentication > Users** (último acceso) y **Logs**.

## Datos y respaldo

- Los datos viven en la tabla `public.docs` de Supabase. Respaldo: **Database > Backups** (según plan) o `pg_dump`.
- Cada aprendiz puede descargar su propia copia desde la app.
- Para borrar a una persona: elimina su usuario en **Authentication > Users** y su fila en `docs` (`learners/<id>`, `pulse/<id>`, `vals/<id>`, `access/<id>`).

## Videos nuevos o corregidos

El pipeline está en `tools/video/` (ver su README): guion por capítulo en `narration/`, voz sintética, render a MP4. Para corregir un capítulo se edita su guion, se regenera y se vuelve a subir a YouTube con el mismo enlace si es posible (YouTube permite reemplazar el video solo creando uno nuevo, así que se actualiza el enlace en **Equipo > Videos**).

## Mientras se migra

La versión de claude.ai (artifact) puede seguir publicándose con `dist/academia-artifact.html`. Los datos de ambas versiones son independientes.
