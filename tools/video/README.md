# Pipeline de videos

Genera los 21 videos narrados (uno por capítulo) a partir del guion y los datos de la Academia.

## Cómo funciona

1. `narration/ch_<id>_opus.json`: texto hablado (intro, una frase por escena, cierre). Lo que se ve en pantalla vive en `chapters.json`.
2. `synth.py`: voz sintética con Kokoro (voz `ef_dora`, español). Genera `audio/<id>_<n>.wav` y los tiempos por escena.
3. `render.py` + `render.html`: dibuja cada escena con Chromium (Playwright) cuadro a cuadro, con la marca de MarketLogic, y `ffmpeg` junta imagen y audio en `video/<id>.mp4` (1280x720, 24 fps).

## Requisitos

- Python 3.11+, `pip install kokoro-onnx soundfile playwright`, `playwright install chromium`
- `ffmpeg`
- Modelo de voz: `kokoro.int8.onnx` y `voices.bin` (del proyecto kokoro-onnx) en esta carpeta. No se versionan por su tamaño.
- Fuentes Montserrat y Open Sans en `fonts/` (`npm i @fontsource/montserrat @fontsource/open-sans` y copiar los .woff2).

## Uso

```
# desde esta carpeta; los ids van separados por coma
python3 synth.py 1.1,1.2,1.3        # voz (segundo argumento opcional: otra voz de Kokoro)
python3 render.py 1.1,1.2,1.3       # MP4 en video/ (1_1.mp4 ...)
```

Los MP4 ya generados están en `videos/` (con nombre `1_1.mp4` a `7_3.mp4`) y `YOUTUBE.csv` trae título y descripción sugeridos para subirlos.

## Corregir un capítulo

Edita su `narration/ch_<id>_opus.json` (y `chapters.json` si cambia lo que se ve), borra sus archivos `audio/<id>_*`, corre `synth.py` y `render.py` con ese id, sube el nuevo MP4 a YouTube y actualiza el enlace en la Academia (Equipo > Videos).
