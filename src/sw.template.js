/* Service worker de la Academia MarketLogic. La versión la estampa build.py. */
const VERSION="mla-__BUILD__";
const CORE=["./","index.html","platform.js","config.js","manifest.webmanifest","vendor/supabase.js","icons/icon-192.png","icons/icon-512.png"];
const FONT_HOSTS=["fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET")return;
  const u=new URL(r.url);
  const same=u.origin===self.location.origin;
  if(!same&&!FONT_HOSTS.includes(u.hostname))return;      // Supabase, YouTube y demás van directo a la red
  if(r.mode==="navigate"){                                  // páginas: red primero, caché si no hay conexión
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put("index.html",c));return res})
      .catch(()=>caches.match("index.html")));return}
  e.respondWith(caches.open(VERSION).then(async c=>{      // recursos: caché y actualiza en segundo plano
    const hit=await c.match(r,{ignoreSearch:same});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net}))});
