#!/usr/bin/env python3
"""Compila la Academia MarketLogic.
  python3 build.py            -> public/index.html (PWA) + public/sw.js + public/platform.js y dist/academia-artifact.html
Sin dependencias externas. Los archivos de public/ se publican tal cual en Cloudflare Pages."""
import base64, json, hashlib, os, re, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
rd = lambda *a: open(P(*a), encoding="utf8").read()

logo = "data:image/png;base64," + base64.b64encode(open(P("src/brand/ml-white-logo-v2.png"), "rb").read()).decode()
cards = json.load(open(P("src/data/cards.json"), encoding="utf8"))
data = "\n".join(rd("src/app", f) for f in ["content1.js", "content2.js", "content3.js"]) + \
    "\nconst CARDS=" + json.dumps(cards, ensure_ascii=False) + ";\nconst LOGO_URI=" + json.dumps(logo) + ";"
app = "\n".join(rd("src/app", f) for f in ["app1.js", "app2.js", "app3.js", "app4.js", "app5.js"]) + "\nboot();"
fragment = rd("src/app/template.html").replace("/*STYLES*/", rd("src/app/styles.css")) \
    .replace("/*DATA*/", data).replace("/*APP*/", app).replace("/*LOGO*/", logo)
assert "—" not in fragment, "hay una raya larga (em dash) en el contenido"

# ---- destino 1: artifact de claude.ai (fragmento, sin plataforma) ----
os.makedirs(P("dist"), exist_ok=True)
open(P("dist/academia-artifact.html"), "w", encoding="utf8").write(fragment)

# ---- destino 2: PWA ----
frag = fragment.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "").replace("<title>Academia MarketLogic</title>\n", "", 1)
build = hashlib.sha1(frag.encode("utf8") + rd("src/platform.js").encode("utf8")).hexdigest()[:10]
head = f'''<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Academia MarketLogic</title>
<meta name="theme-color" content="#171B26">
<meta name="description" content="Sales Learning Path de MarketLogic">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/favicon.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Academia">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
html{{-webkit-text-size-adjust:100%}}body{{margin:0;padding:0;background:#fff}}img{{max-width:100%}}[hidden]{{display:none!important}}
</style>
</head><body>
'''
tail = f'''
<script src="config.js?v={build}"></script>
<script src="vendor/supabase.js"></script>
<script src="platform.js?v={build}"></script>
</body></html>
'''
# la app va después de la plataforma: separar el <script> principal
m = re.search(r"<script>\n/\* ===== Contenido", frag)
assert m, "no se encontró el script principal"
body_html, script_html = frag[:m.start()], frag[m.start():]
html = head + body_html + tail.replace("</body></html>", "") + script_html + "\n</body></html>\n"
os.makedirs(P("public"), exist_ok=True)
open(P("public/index.html"), "w", encoding="utf8").write(html)
shutil.copyfile(P("src/platform.js"), P("public/platform.js"))
open(P("public/sw.js"), "w", encoding="utf8").write(rd("src/sw.template.js").replace("__BUILD__", build))
print(f"PWA {len(html)//1024} KB  build {build}  | artifact {len(fragment)//1024} KB")
