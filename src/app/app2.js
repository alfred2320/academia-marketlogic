/* ===== Onboarding y Mi ruta ===== */
function viewOnboard(m){
 const o=S.ob,n=DIAG.length;m.replaceChildren();
 const wrap=el("div",{style:"max-width:720px;margin:0 auto"});
 const tot=n+1;
 wrap.appendChild(el("div",{class:"steps"},Array.from({length:tot},(_,i)=>el("i",{class:i<o.i?"ok":i===o.i?"on":""}))));
 if(o.i<n){
  const q=DIAG[o.i];
  wrap.appendChild(el("span",{class:"kick"},"Diagnóstico "+(o.i+1)+" de "+n));
  wrap.appendChild(el("h1",{style:"font-size:clamp(24px,4vw,34px);font-weight:900;margin:8px 0 6px"},q.q));
  wrap.appendChild(el("p",{class:"muted"},"Sin respuestas correctas. Con esto ordenamos tu ruta."));
  q.o.forEach((t,i)=>wrap.appendChild(el("button",{class:"qopt",on:{click:()=>{o.pts[o.i]=q.pts[i];o.i++;render()}}},el("span",{class:"k"},"ABC"[i]),el("span",null,t))));
  if(o.i>0)wrap.appendChild(el("p",{style:"margin-top:16px"},el("button",{class:"lnk",on:{click:()=>{o.i--;render()}}},"Volver")));
 }else{
  wrap.appendChild(el("span",{class:"kick"},"Tu alcance"));
  wrap.appendChild(el("h1",{style:"font-size:clamp(24px,4vw,34px);font-weight:900;margin:8px 0 6px"},"¿Dónde quieres generar resultados en este BLITZ?"));
  wrap.appendChild(el("p",{class:"muted"},"Tu foco cambia el orden de los módulos y las misiones que te proponemos."));
  ["n","b","a"].forEach(k=>{const f=FOCUS[k];
   wrap.appendChild(el("button",{class:"qopt"+(o.fo===k?" sel":""),on:{click:()=>{o.fo=k;render()}}},el("span",{class:"k"},k==="n"?"N":k==="b"?"C":"A"),el("span",null,el("b",{style:"font-family:var(--fh)"},f.n),el("br"),el("span",{class:"muted"},f.d))))});
  wrap.appendChild(el("div",{style:"margin-top:18px;display:flex;gap:12px;align-items:center"},
   el("button",{class:"btn",disabled:!o.fo,on:{click:finishOnboard}},"Ver mi ruta"),
   el("button",{class:"lnk",on:{click:()=>{o.i--;render()}}},"Volver")))}
 m.appendChild(wrap)}
function finishOnboard(){
 const sum=S.ob.pts.reduce((a,b)=>a+(b||0),0);
 L().lv=sum<=3?0:sum<=7?1:2;L().fo=S.ob.fo;save();
 S.view="app";S.tab="ruta";render();
 toast("Tu nivel: "+LEV[L().lv]+". Ruta lista.")}

function modOrder(){return FOCUS[L().fo||"a"].ord.map(modOf)}
function nextMod(){return modOrder().find(m=>!modPassed(m))}
function lessonsTotal(){return MODS.reduce((a,m)=>a+m.lessons.length,0)}
function lessonsDoneAll(){return Object.keys(L().les).length}
function ringSvg(p){
 const r=40,c=2*Math.PI*r;
 const s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox","0 0 100 100");s.setAttribute("aria-hidden","true");
 s.innerHTML='<circle cx="50" cy="50" r="40" fill="none" stroke="#3a4152" stroke-width="10"/><circle cx="50" cy="50" r="40" fill="none" stroke="#FF5B09" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+(c*p/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 50 50)" style="transition:stroke-dasharray .8s"/>';
 return s}
function blitzCard(){
 const b=S.cfg.blitz;
 const sum=S.pulse.reduce((a,p)=>a+(p.ms||0),0)+(S.pulse.find(p=>p.id===S.uid)?0:Object.keys(L().ms).length);
 const goal=b.goal||50,p=Math.min(100,pct(sum,goal));
 const top=S.pulse.slice().sort((a,b2)=>(b2.xp||0)-(a.xp||0)).slice(0,5).filter(x=>(x.xp||0)>0);
 const dates=(b.start||b.end)?[b.start,b.end].filter(Boolean).join(" a "):"";
 return el("section",{class:"blitz","aria-label":"Estado del BLITZ"},
  el("span",{class:"kick"},"Campaña en ejecución"),
  el("h2",null,b.name||"BLITZ"),
  el("p",{style:"color:var(--body)"},b.desc),
  dates?el("p",{class:"muted",style:"font-size:13px"},dates):null,
  el("div",null,el("div",{style:"display:flex;justify-content:space-between;font-family:var(--fh);font-weight:800;font-size:13px;margin-bottom:6px"},el("span",null,"Misiones del equipo"),el("span",null,sum+" / "+goal)),el("div",{class:"bar-p"},el("i",{style:"width:"+p+"%"}))),
  top.length?el("ol",{class:"lb"},top.map((x,i)=>el("li",null,el("span",null,(i+1)+". "+(x.id===S.uid?"Tú":nameOf(x.id))),el("b",{style:"font-family:var(--fh)"},(x.xp||0)+" pts")))):null,
  el("button",{class:"btn sm",on:{click:()=>go("mis")}},"Ver mis misiones"))}
function viewHome(m){
 m.replaceChildren();
 const md=modsDone(),p=pct(md,MODS.length),nx=nextMod(),l=L();
 const hero=el("div",{class:"hero"},
  el("div",{class:"hero-l"},
   el("span",{class:"kick"},FOCUS[l.fo||"a"].n+" · Nivel "+LEV[l.lv||0]),
   el("h1",null,nx?"Sigue con "+nx.t:"Completaste los 7 módulos"),
   el("p",null,nx?nx.p:"Rinde el examen final, entrega tus misiones y descarga tu certificado."),
   el("div",{class:"ring"},ringSvg(p),el("div",null,el("div",{class:"num"},p+"%"),el("small",null,md+" de "+MODS.length+" módulos · "+lessonsDoneAll()+" de "+lessonsTotal()+" lecciones · "+xpTotal()+" pts"))),
   el("div",{style:"margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"},
    nx?el("button",{class:"btn",on:{click:()=>go("mod",nx.id)}},"Continuar"):el("button",{class:"btn",on:{click:()=>go("cert")}},"Ir al examen"),
    el("button",{class:"btn ghost",style:"color:#fff;border-color:#4a5163",on:{click:()=>{L().lv=null;S.ob={i:0,pts:[],fo:null};S.view="onboard";render()}}},"Cambiar nivel o foco"))),
  blitzCard());
 m.appendChild(hero);
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Tu ruta de entrenamiento"),el("span",{class:"muted"},LEVELS[l.lv||0].c)));
 const ord=modOrder().map(x=>x.id);
 const bs=BUNDLES.slice().sort((a,b)=>Math.min(...a.mods.map(i=>ord.indexOf(i)))-Math.min(...b.mods.map(i=>ord.indexOf(i))));
 bs.forEach((b,bi)=>{
  const mods=b.mods.map(modOf).sort((a,c)=>ord.indexOf(a.id)-ord.indexOf(c.id));
  const done=mods.every(modPassed);
  m.appendChild(el("section",{class:"bundle"+(done?" done":"")},
   el("div",{class:"bundle-h"},el("span",{class:"bn"},done?"✓":bi+1),el("div",{style:"flex:1;min-width:200px"},el("h3",null,"Bundle "+(bi+1)+": "+b.n),el("p",{class:"muted",style:"font-size:13px"},b.d)),
    el("span",{class:"pill"},"Jugadas: "+b.cats.map(c=>CATN[c]).join(", "))),
   el("div",{class:"grid g2"},mods.map(mo=>modCard(mo,nx&&nx.id===mo.id)))))});
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Cierra con certificado"),el("button",{class:"btn ghost sm",on:{click:()=>go("cert")}},"Ver requisitos")));
 m.appendChild(el("div",{class:"panel"},el("p",null,"Para certificarte necesitas: los 7 quizzes aprobados, el examen final con 80% o más y al menos "+(S.cfg.blitz.min||3)+" misiones BLITZ entregadas.")));
 m.appendChild(backupPanel())}
function backupPanel(){
 const f=el("input",{type:"file",accept:"application/json,.json",hidden:true});
 f.addEventListener("change",async()=>{const fl=f.files[0];if(!fl)return;
  try{const j=JSON.parse(await fl.text());if(!j||j.app!=="mla"||!j.L||typeof j.L!=="object")throw 0;
   S.L=Object.assign(newL(),mergeL(L(),j.L));S.L.em=S.email||S.L.em;save();toast("Copia restaurada y unida a tu avance.");render()}
  catch(e){toast("Ese archivo no es una copia de la Academia.")}});
 return el("section",{class:"panel",style:"margin-top:24px"},el("span",{class:"kick"},"Tu avance"),
  el("p",{style:"margin:6px 0 12px"},S.sync==="ok"?"Tu avance se guarda solo en la nube cada vez que completas algo.":"Tu avance se guarda en este navegador. Descarga una copia por si cambias de equipo."),
  el("div",{class:"row",style:"gap:8px"},
   el("button",{class:"btn ghost sm",on:{click:async()=>{
    try{const d=await claude.use("downloads");if(!d)throw 0;await d.save({filename:"mi-avance-academia-marketlogic.json",data:JSON.stringify({app:"mla",v:1,ts:Date.now(),L:L()})});toast("Copia guardada.")}
    catch(e){if(e&&e.code==="declined")return;toast("No se pudo abrir la descarga.")}}}},"Descargar copia"),
   el("button",{class:"btn ghost sm",on:{click:()=>f.click()}},"Restaurar copia"),
   el("button",{class:"btn ghost sm",on:{click:()=>{flush();toast("Sincronizando...")}}},"Guardar ahora"),f))}
function modCard(mo,rec){
 const d=modPassed(mo),ld=modLessonsDone(mo),q=L().qz[mo.id];
 const ms=MISSIONS.filter(x=>x.m===mo.id&&L().ms[x.id]).length;
 return el("button",{class:"mod"+(d?" done":rec?" rec":""),on:{click:()=>go("mod",mo.id)},"aria-label":"Módulo "+mo.id+": "+mo.t},
  el("span",{class:"mn"},"MÓDULO "+mo.id+(rec?" · EMPIEZA AQUÍ":"")),
  el("h4",null,mo.t),el("p",null,mo.p),
  el("div",{class:"mini"},el("i",{style:"width:"+pct(ld+(d?1:0),mo.lessons.length+1)+"%"})),
  el("div",{class:"meta"},
   el("span",{class:"pill"},ld+"/"+mo.lessons.length+" lecciones"),
   q?el("span",{class:"pill "+(q.pass?"ok":"")},"Quiz "+q.best+"/"+mo.q.length):el("span",{class:"pill"},"Quiz"),
   ms?el("span",{class:"pill dk"},ms+" misión"+(ms>1?"es":"")):null,
   el("span",{class:"pill"},mo.min+" min")))}
