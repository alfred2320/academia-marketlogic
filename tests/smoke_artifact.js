const {JSDOM}=require("jsdom");const fs=require("fs");
const html=fs.readFileSync(require("path").join(__dirname,"../dist/academia-artifact.html"),"utf8");
function mkdb(store){
 const ref=p=>({id:p.split("/").pop(),path:p,async get(){const v=store[p];return{exists:!!v,data:()=>v&&JSON.parse(JSON.stringify(v))}},async set(d){if(store.__fail&&p.startsWith('learners/')){const e=new Error('x');e.code=store.__fail;throw e}store[p]=JSON.parse(JSON.stringify(d));fire(p)},async delete(){delete store[p]},async update(d){store[p]=Object.assign(store[p]||{},d)},onSnapshot(cb){cb({exists:!!store[p],data:()=>store[p]});return()=>{}}});
 const subs={};function fire(p){const c=p.split("/")[0];(subs[c]||[]).forEach(f=>f())}
 const docsOf=c=>Object.keys(store).filter(k=>k.startsWith(c+"/")).map(k=>({id:k.split("/")[1],data:()=>JSON.parse(JSON.stringify(store[k]))}));
 return{doc:ref,collection(c){return{async get(){return{docs:docsOf(c)}},onSnapshot(cb){(subs[c]=subs[c]||[]).push(()=>cb({docs:docsOf(c)}));cb({docs:docsOf(c)});return()=>{}},doc:id=>ref(c+"/"+id)}}}}
async function run(o){
 const errs=[],store=o.store||{},saved=[];
 const mock={mcp:o.hs===undefined?null:{callTool:async()=>{if(o.hs==="decline"){const e=new Error("d");e.code="consent_declined";throw e}return{payload:{accountId:o.acc||20209541,userInformation:{email:o.hs,firstName:"Ana",lastName:"Pérez"}}}}},permissions:{state:async()=>o.perm||"prompt"},user:{me:async()=>({id:o.id||"u1",email:null,name:o.nm||"Ana Pérez"}),canEdit:async()=>!!o.admin,profiles:async ids=>Object.fromEntries(ids.map(i=>[i,{name:i==="u1"?"Ana Pérez":"Colega "+i}]))},
  db:mkdb(store),downloads:{save:async r=>{saved.push(r.filename)}},assets:null};
 const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",beforeParse(w){
  w.addEventListener("error",e=>errs.push(e.message));
  w.scrollTo=()=>{};w.Image=class{set src(v){this._s=v;setTimeout(()=>this.onload&&this.onload(),1)}get width(){return 425}get height(){return 86}};
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>k==="measureText"?()=>({width:100}):()=>{},set:()=>true});
  w.HTMLCanvasElement.prototype.toDataURL=()=>"data:image/png;base64,AAAA";w.HTMLCanvasElement.prototype.toBlob=cb=>cb(new w.Blob(["x"]));
  w.claude={use:async n=>(mock[n]===undefined?null:mock[n])}}});
 const w=dom.window,d=w.document;const tick=(ms=30)=>new Promise(r=>setTimeout(r,ms));
 await tick(200);
 return{w,d,q:s=>d.querySelector(s),qa:s=>[...d.querySelectorAll(s)],tick,errs,store,saved,ev:s=>w.eval(s)}}
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)process.exitCode=1};
(async()=>{
 const txt=t=>t.q("#main").textContent;
 // A. sin HubSpot: solicitud y aprobación
 let store={};
 let t=await run({store});
 ok(/Solicita acceso/.test(txt(t)),"sin HubSpot ofrece solicitar acceso");
 t.q("#gEmail").value="x@gmail.com";[...t.qa(".btn")].find(b=>b.textContent==="Solicitar acceso").click();await t.tick();
 ok(/dominio|correo corporativo/i.test(txt(t))&&!store["requests/u1"],"rechaza correo externo");
 t.q("#gEmail").value="ana@mymarketlogic.com";[...t.qa(".btn")].find(b=>b.textContent==="Solicitar acceso").click();await t.tick();
 ok(store["requests/u1"]&&store["requests/u1"].em==="ana@mymarketlogic.com","solicitud escrita");
 [...t.qa(".btn")].find(b=>b.textContent==="Revisar estado").click();await t.tick();
 ok(/pendiente/i.test(txt(t)),"sigue pendiente");
 // editor aprueba
 let a=await run({admin:true,id:"adm",store,nm:"Alfredo"});
 ok(/Diagnóstico 1/.test(txt(a)),"editor entra directo");
 a.ev("L().lv=1;L().fo='a';S.view='app';render()");await a.tick();
 a.qa(".tabs button").find(b=>b.getAttribute("aria-label")==="Equipo").click();await a.tick(300);
 a.qa(".btn").find(b=>/^Accesos/.test(b.textContent)).click();await a.tick();
 ok(/ana@mymarketlogic.com/.test(txt(a)),"editor ve la solicitud");
 [...a.qa(".btn")].find(b=>b.textContent==="Aprobar").click();await a.tick(200);
 ok(store["access/u1"]&&store["access/u1"].ok===true&&!store["requests/u1"],"acceso aprobado");
 [...t.qa(".btn")].find(b=>b.textContent==="Revisar estado").click();await t.tick(100);
 ok(/Diagnóstico 1/.test(txt(t)),"usuario aprobado entra");
 // bloqueo
 [...a.qa(".btn")].find(b=>b.textContent==="Bloquear").click();await a.tick(200);
 ok(store["access/u1"].ok===false,"bloqueado");
 let b2=await run({store,hs:"ana@mymarketlogic.com",perm:"granted"});
 ok(/suspendido/.test(txt(b2)),"bloqueado gana aun con HubSpot");
 // B. HubSpot
 t=await run({hs:"ana@gmail.com"});
 [...t.qa(".btn")].find(b=>b.textContent==="Verificar con HubSpot").click();await t.tick(100);
 ok(/no es de MarketLogic/.test(txt(t)),"HubSpot de otro dominio rechazado");
 t=await run({hs:"ana@mymarketlogic.com",acc:999});
 [...t.qa(".btn")].find(b=>b.textContent==="Verificar con HubSpot").click();await t.tick(100);
 ok(/no es de MarketLogic/.test(txt(t)),"HubSpot de otra cuenta rechazado");
 t=await run({hs:"decline"});
 [...t.qa(".btn")].find(b=>b.textContent==="Verificar con HubSpot").click();await t.tick(100);
 ok(/No autorizaste/.test(txt(t)),"consentimiento rechazado");
 t=await run({hs:"ana@mymarketlogic.com",perm:"granted"});
 ok(/Diagnóstico 1/.test(txt(t))&&t.ev("S.vf")==="h","auto-verificación con permiso previo");
 t=await run({hs:"ana@mymarketlogic.com"});
 [...t.qa(".btn")].find(b=>b.textContent==="Verificar con HubSpot").click();await t.tick(100);
 ok(/Diagnóstico 1/.test(txt(t))&&t.ev("S.email")==="ana@mymarketlogic.com","HubSpot verificado entra");
 // C. flujo completo con HubSpot
 store={};t=await run({hs:"ana@mymarketlogic.com",perm:"granted",store});
for(let i=0;i<5;i++){t.q(".qopt").click();await t.tick()}
 ok(/Dónde quieres generar/.test(t.q("#main").textContent),"paso foco");
 t.qa(".qopt")[1].click();await t.tick();
 [...t.qa(".btn")].find(b=>b.textContent==="Ver mi ruta").click();await t.tick(50);
 ok(t.ev("L().lv")===0&&t.ev("L().fo")==="b","nivel 0 foco b");
 ok(t.qa(".mod").length===7,"7 módulos en ruta");
 ok(/Habilidades/.test(t.qa(".mod")[0].textContent),"foco b ordena módulo 3 primero");
 // módulo 3: lecciones
 t.qa(".mod")[0].click();await t.tick();
 ok(/Capítulo 3\.1/.test(t.q(".stage").textContent),"abre lección 3.1");
 ok(t.q("[aria-current=true]"),"capítulo activo");
 // quiz bloqueado
 ok(t.qa(".chap button")[3].disabled===true,"quiz bloqueado hasta terminar capítulos");
 for(let l=0;l<3;l++){
  for(let s=0;s<3;s++){[...t.qa(".stage-bot .btn")].find(b=>b.textContent==="Siguiente").click();await t.tick()}
  [...t.qa(".stage-bot .btn")].find(b=>/Terminar/.test(b.textContent)).click();await t.tick()}
 ok(t.ev("lessonsDoneAll()")===3,"3 lecciones completas");
 ok(/Pregunta 1 de 6/.test(t.q("#main").textContent),"quiz abre tras capítulos");
 const mo=t.ev("MODS[2]");
 for(let i=0;i<6;i++){
  const q=t.ev("S.qz.items[S.qz.i].q");const txt=q.o[q.a];
  [...t.qa(".qopt")].find(b=>b.textContent.slice(1)===txt||b.textContent.endsWith(txt)).click();await t.tick();
  [...t.qa(".btn")].find(b=>/Siguiente|Ver resultado/.test(b.textContent)).click();await t.tick()}
 ok(/Aprobado/.test(t.q("#main").textContent),"quiz aprobado 6/6");
 ok(t.ev("modPassed(MODS[2])")===true,"módulo 3 pasado");
 ok(t.ev("L().xp")===60,"xp 30+30");
 // misiones
 [...t.qa(".btn")].find(b=>/Ir a las misiones/.test(b.textContent)).click();await t.tick();
 ok(t.qa(".mis").length===4,"4 misiones del módulo 3");
 const open=[...t.qa(".mis .btn")].find(b=>b.textContent==="Entregar misión");open.click();await t.tick();
 t.q("textarea").value="Hice el pitch con un colega y salió bien";
 [...t.qa(".btn")].find(b=>b.textContent==="Enviar").click();await t.tick(500);
 ok(t.ev("missDone()")===1,"misión entregada");
 ok(t.store["learners/u1"]&&t.store["learners/u1"].ms,"persistió en db");
 ok(t.store["pulse/u1"]&&t.store["pulse/u1"].ms===1,"pulso escrito");
 // misión bloqueada de otro módulo
 t.qa(".tabs button")[1].click();await t.tick();
 ok(t.qa(".mis.lock").length>0,"misiones bloqueadas visibles");
 ok(/Play Deck/.test(t.q("#main").textContent),"liga al Play Deck");
 // cert no disponible
 t.qa(".tabs button")[2].click();await t.tick();
 ok(/Aún no está disponible/.test(t.q("#main").textContent),"cert bloqueado");
 // completar todo por estado
 t.ev("MODS.forEach(m=>{L().qz[m.id]={best:6,pass:true,ts:1,tries:1}});L().ms.m1a={ts:1,ev:'x'};L().ms.m2a={ts:1,ev:'x'}");
 t.ev("render()");await t.tick();
 [...t.qa(".btn")].find(b=>/Empezar examen/.test(b.textContent)).click();await t.tick();
 for(let i=0;i<15;i++){const q=t.ev("S.ex.items[S.ex.i].q");const txt=q.o[q.a];
  [...t.qa(".qopt")].find(b=>b.textContent.endsWith(txt)).click();await t.tick();
  [...t.qa(".btn")].find(b=>/Siguiente|Terminar examen/.test(b.textContent)).click();await t.tick()}
 ok(/100%/.test(t.q("#main").textContent),"examen 100%");
 [...t.qa(".btn")].find(b=>b.textContent==="Continuar").click();await t.tick();
 ok(/Genera tu certificado/.test(t.q("#main").textContent),"cert disponible");
 [...t.qa(".btn")].find(b=>b.textContent==="Generar certificado").click();await t.tick(300);
 ok(t.ev("L().cert&&L().cert.code").startsWith("MLA-"),"código de certificado");
 const dl=[...t.qa(".btn")].find(b=>b.textContent==="Descargar PNG");dl.click();await t.tick(100);
 ok(t.saved[0]==="certificado-academia-marketlogic.png","descarga ofrecida");
 ok(t.errs.length===0,"sin errores JS: "+t.errs.join("|"));
 // 3 admin con gmail
 store=t.store;
 a=await run({admin:true,id:"adm",store,nm:"Alfredo"});
 ok(/Diagnóstico 1/.test(a.q("#main").textContent),"admin con gmail entra");
 a.ev("L().lv=1;L().fo='a';S.view='app';render()");await a.tick();
 const tabs=a.qa(".tabs button").map(b=>b.getAttribute("aria-label"));ok(tabs.includes("Equipo"),"pestaña Equipo");
 a.qa(".tabs button")[3].click();await a.tick(300);
 ok(a.qa(".tbl tbody tr").length>=1,"tabla equipo");
 ok(/Por validar/.test(a.q("#main").textContent),"cola por validar");
 [...a.qa(".btn")].find(b=>b.textContent==="Validar").click();await a.tick(200);
 ok(store["vals/u1"],"validación escrita");
 [...a.qa(".btn")].find(b=>b.textContent==="Exportar CSV").click();await a.tick(100);
 ok(a.saved[0]==="academia-equipo.csv","CSV ofrecido");
 a.qa(".btn").find(b=>b.textContent==="Videos").click();await a.tick();
 ok(a.qa("input[type=url]").length===21,"21 slots de video");
 a.qa("input[type=url]")[0].value="https://example.com/v1";
 [...a.qa(".btn")].find(b=>b.textContent==="Guardar enlace").click();await a.tick(100);
 ok(store["config/videos"]&&store["config/videos"]["1_1"].u==="https://example.com/v1","video guardado");
 ok(a.errs.length===0,"sin errores admin: "+a.errs.join("|"));
 // 4 usuario vuelve y ve video link + validación
 let u=await run({hs:"ana@mymarketlogic.com",perm:"granted",store});
 ok(!/Diagnóstico/.test(u.q("#main").textContent),"usuario recurrente sin onboarding");
 ok(u.ev("S.vals.m1a")||u.ev("Object.keys(S.vals).length")>=1,"ve validaciones");
 u.ev("go('mod',1)");await u.tick();
 ok(/Ver video del capítulo/.test(u.q("#main").textContent),"video enlace visible");
 // D. guardado
 u.ev("L().lv=1;L().fo='a';S.view='app';render()");await u.tick();
 u.ev("addXp(5);save()");await u.tick(700);
 ok(u.ev("S.sync")==="ok","indicador: guardado en la nube");
 store.__fail="permission_denied";u.ev("addXp(5);save()");await u.tick(700);
 ok(u.ev("S.sync")==="local"&&u.ev("S.noWrite")===true,"sin permiso: modo local con aviso");
 ok(/Contributor/.test(u.q("#main").textContent),"aviso Contributor visible");
 delete store.__fail;
 let v=await run({hs:"ana@mymarketlogic.com",perm:"granted",store:{}});
 v.ev("L().lv=1;L().fo='a';S.view='app';render()");await v.tick();
 v.ev("S.db.doc('learners/u1').set").length;
 store.__fail="unavailable";const st2={__fail:"unavailable"};
 let r=await run({hs:"ana@mymarketlogic.com",perm:"granted",store:st2});
 r.ev("L().lv=1;L().fo='a';S.view='app';render();addXp(7);save()");await r.tick(700);
 ok(r.ev("S.sync")==="err","error transitorio: reintentando");
 delete st2.__fail;await r.tick(8500);
 ok(r.ev("S.sync")==="ok"&&st2["learners/u1"]&&st2["learners/u1"].xp===7,"reintento exitoso guarda");
 // merge local+nube
 const m=r.ev("JSON.stringify(mergeL({les:{'1.1':1},ms:{},qz:{1:{best:4,pass:false}},ex:{best:50,tries:1},xp:10,t:5},{les:{'1.2':2},ms:{m1a:{ts:1}},qz:{1:{best:6,pass:true}},ex:{best:80,tries:2},xp:30,t:9}))");
 const mm=JSON.parse(m);
 ok(mm.les['1.1']&&mm.les['1.2']&&mm.ms.m1a&&mm.qz[1].pass&&mm.qz[1].best===6&&mm.ex.best===80&&mm.xp===30,"mergeL une sin perder");
 // copia de respaldo
 u.ev("go('ruta')");await u.tick();
 [...u.qa(".btn")].find(b=>b.textContent==="Descargar copia").click();await u.tick(100);
 ok(u.saved.includes("mi-avance-academia-marketlogic.json"),"respaldo ofrecido");
 console.log("done");
})().catch(e=>{console.error("CRASH",e);process.exit(1)});
