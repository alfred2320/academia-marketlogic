"""Revisión en Chromium real: puerta de login, service worker, manifest. Requiere: python3 -m http.server 8765 --directory public"""
import sys, json
from playwright.sync_api import sync_playwright
FAKE="""window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{}}),signInWithOAuth:async()=>({error:null}),signOut:async()=>({})},from:()=>({}),rpc:async()=>({data:false}),channel:()=>({on(){return this},subscribe(){return this}}),removeChannel(){}})};"""
CFG="""window.MLA_CONFIG={supabaseUrl:"https://abc.supabase.co",supabaseAnonKey:"anon",domain:"mymarketlogic.com"};"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    for W in (390,1280):
        ctx=b.new_context(viewport={"width":W,"height":820},service_workers="allow")
        pg=ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
        pg.route("**/config.js*",lambda r:r.fulfill(body=CFG,content_type="text/javascript"))
        pg.route("**/vendor/supabase.js*",lambda r:r.fulfill(body=FAKE,content_type="text/javascript"))
        pg.goto("http://localhost:8765/index.html");pg.wait_for_timeout(1500)
        pg.screenshot(path=f"/tmp/pwa_gate_{W}.png")
        if W==390:
            sw=pg.evaluate("navigator.serviceWorker.ready.then(r=>!!r.active)")
            keys=pg.evaluate("caches.keys().then(k=>k)")
            mf=pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(j=>j.name)")
            print("service worker activo:",sw,"cachés:",keys,"manifest:",mf)
        print(W,"errores de página:",errs)
        ctx.close()
    b.close()
