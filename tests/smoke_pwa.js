// Prueba de humo de la PWA: carga public/index.html en jsdom con un cliente de Supabase simulado.
// Cubre login, dominio, bloqueo, guardado, errores de permisos, panel de editor y videos de YouTube.
const {JSDOM}=require("jsdom");const fs=require("fs");const path=require("path");
const PUB=p=>path.join(__dirname,"../public",p);
const rawHtml=fs.readFileSync(PUB("index.html"),"utf8");
const platform=fs.readFileSync(PUB("platform.js"),"utf8");
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)process.exitCode=1};

function fakeSupabase(o){
 const rows=o.rows;                       // path -> data
 const calls={signIn:[],signOut:0,upserts:0};
 const fail=()=>o.deny?{error:{code:"42501",message:"new row violates row-level security policy"}}:null;
 const mk=(sel)=>{ // constructor de consultas mínimo
  const q={f:{},op:"select",cols:"",limit:null,in:null};
  const run=()=>{
   if(q.op==="upsert"){const d=fail();if(d)return d;calls.upserts++;rows[q.row.path]=JSON.parse(JSON.stringify(q.row.data));return{error:null}}
   if(q.op==="delete"){const d=fail();if(d)return d;delete rows[q.f.path];return{error:null}}
   let list=Object.keys(rows).map(p=>({path:p,coll:p.split("/")[0],id:p.slice(p.indexOf("/")+1),data:rows[p],name:rows[p]&&rows[p].__name,email:rows[p]&&rows[p].__email}));
   if(sel==="profiles")list=(o.profiles||[]).slice();
   Object.keys(q.f).forEach(k=>{list=list.filter(r=>r[k]===q.f[k])});
   if(q.in)list=list.filter(r=>q.in[1].includes(r[q.in[0]]));
   return{data:list,error:null}};
  const api={
   select(c){q.op="select";q.cols=c;return api},
   eq(k,v){q.f[k]=v;return api},
   in(k,v){q.in=[k,v];return api},
   limit(n){q.limit=n;return api},
   upsert(row){q.op="upsert";q.row=row;return api},
   delete(){q.op="delete";return api},
   async maybeSingle(){const r=run();return r.error?r:{data:(r.data||[])[0]||null,error:null}},
   then(res,rej){return Promise.resolve(run()).then(res,rej)}};
  return api};
 const client={
  auth:{
   async getSession(){return{data:{session:o.user?{user:o.user}:null}}},
   onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},
   async signInWithOAuth(x){calls.signIn.push(x);return{error:null}},
   async signOut(){calls.signOut++;return{error:null}}},
  from:t=>mk(t),
  async rpc(n){return{data:n==="is_admin"?!!o.admin:null,error:null}},
  channel(){const c={on:()=>c,subscribe:()=>c};return c},
  removeChannel(){}};
 return{client,calls}}

async function run(o){
 o.rows=o.rows||{};
 const errs=[],saved=[];
 const fs_=fakeSupabase(o);
 let html=rawHtml
  .replace(/<script src="config\.js[^"]*"><\/script>/,"<script>window.MLA_CONFIG="+JSON.stringify(o.cfg||{supabaseUrl:"https://abc.supabase.co",supabaseAnonKey:"anon",domain:"mymarketlogic.com"})+"</script>")
  .replace(/<script src="vendor\/supabase\.js"><\/script>/,"")
  .replace(/<script src="platform\.js[^"]*"><\/script>/,"<script>"+platform.replace(/<\/script>/g,"<\\/script>")+"</script>");
 const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://academia.test/",beforeParse(w){
  w.addEventListener("error",e=>errs.push(e.message));
  w.supabase={createClient:()=>fs_.client};
  w.scrollTo=()=>{};
  w.Image=class{set src(v){this._s=v;setTimeout(()=>this.onload&&this.onload(),1)}get width(){return 425}get height(){return 86}};
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>k==="measureText"?()=>({width:100}):()=>{},set:()=>true});
  w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/png;base64,AAAA";w.HTMLCanvasElement.prototype.toBlob=cb=>cb(new w.Blob(["x"]));
  w.URL.createObjectURL=()=>"blob:x";w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){if(this.download)saved.push(this.download)};
  }});
 const w=dom.window,d=w.document;const tick=(ms=30)=>new Promise(r=>setTimeout(r,ms));
 await tick(250);
 return{w,d,q:s=>d.querySelector(s),qa:s=>[...d.querySelectorAll(s)],tick,errs,rows:o.rows,saved,calls:fs_.calls,ev:s=>w.eval(s),txt:()=>d.querySelector("#main").textContent}}

const ANA={id:"11111111-1111-1111-1111-111111111111",email:"Ana@MyMarketLogic.com",user_metadata:{full_name:"Ana Pérez"}};
const UID=ANA.id;

(async()=>{
 // 0. sin configurar
 let t=await run({cfg:{supabaseUrl:"https://TU-PROYECTO.supabase.co",supabaseAnonKey:"PEGA_AQUI_LA_ANON_KEY"}});
 ok(/Falta configurar/.test(t.txt()),"sin config.js muestra el aviso de configuración");

 // 1. sin sesión: puerta con Google
 t=await run({});
 ok(/Entrar con Google/.test(t.txt()),"sin sesión pide entrar con Google");
 t.qa(".btn").find(b=>/Entrar con Google/.test(b.textContent)).click();await t.tick();
 ok(t.calls.signIn.length===1&&t.calls.signIn[0].provider==="google","inicia OAuth con Google");
 ok(t.calls.signIn[0].options.queryParams.hd==="mymarketlogic.com","pide al selector de Google el dominio corporativo");
 ok(!/HubSpot|Solicitar acceso/.test(t.txt()),"la PWA no muestra el flujo de HubSpot");

 // 2. cuenta de otro dominio
 t=await run({user:{id:"x1",email:"externo@gmail.com",user_metadata:{}}});
 ok(t.calls.signOut===1,"cuenta fuera del dominio se cierra");
 ok(/mymarketlogic\.com/.test(t.txt())&&/Entrar con Google/.test(t.txt()),"y se muestra el aviso del dominio");

 // 3. aprendiz corporativa entra, hace onboarding y guarda
 t=await run({user:ANA});
 ok(/Diagnóstico 1/.test(t.txt()),"aprendiz entra al diagnóstico (nombre desde Google)");
 ok(t.ev("S.uid")===UID&&t.ev("S.name")==="Ana Pérez"&&t.ev("S.email")==="ana@mymarketlogic.com","identidad tomada de la sesión");
 ok(t.ev("S.vf")==="g","verificación marcada como Google");
 for(let i=0;i<5;i++){t.qa(".qopt")[1].click();await t.tick(20)}
 t.qa(".qopt")[0].click();await t.tick();
 t.qa(".btn").find(b=>b.textContent==="Ver mi ruta").click();await t.tick(900);
 ok(t.rows["learners/"+UID]&&t.rows["learners/"+UID].lv!=null,"el avance se guarda en la base");
 ok(t.rows["pulse/"+UID],"se publica el pulso del ranking");
 ok(/Guardado en la nube/.test(t.q("#sync").textContent),"indicador: guardado en la nube");
 ok(t.qa(".tabs button").map(b=>b.getAttribute("aria-label")).join()==="Mi ruta,Misiones BLITZ,Examen y certificado","un aprendiz no ve el panel de equipo");
 ok(t.qa(".bar-b").map(b=>b.textContent).includes("Salir"),"hay botón Salir");
 t.qa(".bar-b").find(b=>b.textContent==="Salir").click();await t.tick();
 ok(t.calls.signOut===1,"Salir cierra la sesión");

 // 4. recurrente: recupera el avance de la nube
 let rows={};rows["learners/"+UID]={v:1,lv:2,fo:"a",les:{"1.1":1},qz:{},ms:{},ex:{best:0,tries:0,ts:0},cert:null,xp:40,t0:1,t:5};
 t=await run({user:ANA,rows});
 ok(!/Diagnóstico 1/.test(t.txt())&&/Liderazgo/.test(t.q("#who").textContent),"recurrente vuelve a su ruta con su nivel");

 // 5. bloqueada
 rows={};rows["access/"+UID]={ok:false,em:"ana@mymarketlogic.com"};
 t=await run({user:ANA,rows});
 ok(/suspendido/.test(t.txt()),"persona bloqueada ve el aviso");
 ok(!rows["learners/"+UID],"y no se crea avance");

 // 6. permisos denegados al guardar
 t=await run({user:ANA,deny:true});
 for(let i=0;i<5;i++){t.qa(".qopt")[1].click();await t.tick(20)}
 t.qa(".qopt")[0].click();await t.tick(500);
 ok(/Solo en este navegador/.test(t.q("#sync").textContent),"si la base rechaza, el avance queda en el navegador");

 // 7. editor: panel, accesos, videos de YouTube
 rows={};
 rows["learners/aaa"]={v:1,em:"luis@mymarketlogic.com",vf:"g",lv:1,fo:"n",les:{"1.1":1,"1.2":1},qz:{},ms:{},ex:{best:0,tries:0,ts:0},cert:null,xp:30,t0:1,t:9};
 const ADM={id:"22222222-2222-2222-2222-222222222222",email:"jefa@mymarketlogic.com",user_metadata:{full_name:"Jefa"}};
 t=await run({user:ADM,admin:true,rows,profiles:[{id:"aaa",name:"Luis Gómez",email:"luis@mymarketlogic.com"}]});
 ok(t.ev("S.admin")===true&&t.ev("S.vf")==="e","editor reconocido por la base");
 t.ev("L().lv=1;L().fo='a';S.view='app';render()");await t.tick();
 ok(t.qa(".tabs button").some(b=>b.getAttribute("aria-label")==="Equipo"),"editor ve la pestaña Equipo");
 t.qa(".tabs button").find(b=>b.getAttribute("aria-label")==="Equipo").click();await t.tick(300);
 ok(/Luis Gómez/.test(t.txt()),"el panel lista a las personas con su nombre de perfil");
 t.qa(".btn").find(b=>/^Videos/.test(b.textContent)).click();await t.tick();
 ok(/YouTube/.test(t.txt())&&!t.qa("button").some(b=>b.textContent==="Subir clip"),"panel de videos en modo YouTube, sin subir clips");
 const inp=t.qa("input[type=url]")[0];inp.value="https://youtu.be/dQw4w9WgXcQ";
 t.qa("button").find(b=>b.textContent==="Guardar enlace").click();await t.tick();
 ok(rows["config/videos"]&&rows["config/videos"]["1_1"]&&rows["config/videos"]["1_1"].k==="y","el enlace de YouTube se guarda con tipo y");
 t.qa(".btn").find(b=>/^Resumen/.test(b.textContent)).click();await t.tick();
 t.qa("button").find(b=>/CSV/.test(b.textContent)).click();await t.tick(100);
 ok(t.saved.includes("academia-equipo.csv"),"el CSV se descarga");
 // bloquear desde el panel
 t.qa(".btn").find(b=>/^Accesos/.test(b.textContent)).click();await t.tick();
 const bl=t.qa("button").find(b=>b.textContent==="Bloquear");
 if(bl){bl.click();await t.tick(100)}
 ok(rows["access/aaa"]&&rows["access/aaa"].ok===false,"el editor bloquea a una persona y queda guardado");

 // 8. aprendiz ve el video embebido
 t=await run({user:ANA,rows:{"config/videos":{"1_1":{u:"https://youtu.be/dQw4w9WgXcQ",k:"y"},"1_2":{u:"https://cdn.test/v.mp4",k:"l"}},["learners/"+UID]:{v:1,lv:2,fo:"a",les:{},qz:{},ms:{},ex:{best:0,tries:0,ts:0},cert:null,xp:0,t0:1,t:5}}});
 t.ev("go('mod',1)");await t.tick(100);
 const fr=t.q("iframe");
 ok(fr&&/youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/.test(fr.src),"el video de YouTube se reproduce embebido");
 ok(t.ev("vidKind('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')")==="y"&&t.ev("vidKind('https://x.test/a.mp4?x=1')")==="a"&&t.ev("vidKind('https://vimeo.com/1')")==="l","detección de tipo de enlace");

 // 9. manifest y service worker
 const mf=JSON.parse(fs.readFileSync(PUB("manifest.webmanifest"),"utf8"));
 ok(mf.display==="standalone"&&mf.icons.some(i=>i.purpose==="maskable")&&mf.icons.some(i=>i.sizes==="192x192"),"manifest válido para instalar");
 ok(mf.icons.every(i=>fs.existsSync(PUB(i.src))),"los íconos del manifest existen");
 const sw=fs.readFileSync(PUB("sw.js"),"utf8");
 ok(!/__BUILD__/.test(sw)&&/mla-[0-9a-f]{10}/.test(sw),"el service worker lleva la versión de la compilación");
 ok(!/—/.test(rawHtml),"sin rayas largas en la página");
 console.log(process.exitCode?"\nHAY FALLOS":"\nTODO OK");process.exit(process.exitCode||0);
})().catch(e=>{console.log("CRASH",e&&e.stack||e);process.exit(1)});
