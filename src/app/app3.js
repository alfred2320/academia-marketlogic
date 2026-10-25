/* ===== Módulo: lecciones animadas, quiz y misiones ===== */
function viewModule(m){
 const mo=modOf(S.modId);m.replaceChildren();
 if(!S.sub){const nl=mo.lessons.find(l=>!lessonDone(l.id));S.sub=nl?"l:"+nl.id:(modPassed(mo)?"m":"q")}
 const d=modPassed(mo);
 m.appendChild(el("div",{class:"crumb"},el("button",{on:{click:()=>go("ruta")}},"Mi ruta"),"/",el("span",null,"Módulo "+mo.id)));
 m.appendChild(el("div",{class:"mod-h"},el("div",null,el("span",{class:"kick"},"Módulo "+mo.id+" · Sesión "+mo.id+" · "+mo.min+" min"),el("h1",null,mo.t),el("p",{class:"muted"},mo.p)),
  el("div",{class:"row"},el("span",{class:"pill "+(d?"ok":"")},d?"Módulo completo":"En curso"),el("span",{class:"pill"},bundleOf(mo).n))));
 const side=el("nav",{class:"chap","aria-label":"Capítulos"});
 mo.lessons.forEach((l,i)=>side.appendChild(el("button",{class:lessonDone(l.id)?"done":"","aria-current":S.sub==="l:"+l.id?"true":null,on:{click:()=>{clearTimeout(timer);S.sub="l:"+l.id;S.sc=0;S.qz=null;render()}}},
  el("span",{class:"ck"},lessonDone(l.id)?"✓":i+1),el("span",null,el("b",{style:"font-family:var(--fh);font-size:13px"},"Capítulo "+(i+1)),el("br"),el("span",{class:"muted",style:"font-size:13px"},l.t)))));
 const open=quizOpen(mo);
 side.appendChild(el("button",{class:d?"done":"","aria-current":S.sub==="q"?"true":null,disabled:!open,on:{click:()=>{S.sub="q";S.qz=null;render()}}},
  el("span",{class:"ck"},d?"✓":"?"),el("span",null,el("b",{style:"font-family:var(--fh);font-size:13px"},"Quiz del módulo"),el("br"),el("span",{class:"muted",style:"font-size:13px"},open?"6 preguntas · aprueba con "+Math.ceil(mo.q.length*PASS):"Termina los capítulos para abrirlo"))));
 const ms=MISSIONS.filter(x=>x.m===mo.id);
 side.appendChild(el("button",{"aria-current":S.sub==="m"?"true":null,on:{click:()=>{S.sub="m";render()}}},
  el("span",{class:"ck"},"★"),el("span",null,el("b",{style:"font-family:var(--fh);font-size:13px"},"Misiones BLITZ"),el("br"),el("span",{class:"muted",style:"font-size:13px"},ms.length+" misiones ligadas al Play Deck"))));
 const main=el("div",null);
 if(S.sub&&S.sub[0]==="l")lessonStage(main,mo,mo.lessons.find(l=>l.id===S.sub.slice(2)));
 else if(S.sub==="q")quizView(main,mo);
 else missionList(main,ms,true);
 m.appendChild(el("div",{class:"lay"},side,main))}
function bundleOf(mo){return BUNDLES.find(b=>b.id===mo.b)}

function ytId(u){const m=String(u||"").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);return m?m[1]:""}
function vidKind(u){return ytId(u)?"y":/\.(mp4|webm)(\?|#|$)/i.test(u||"")?"a":"l"}
function videoBlock(les){
 const v=S.cfg.videos[keyOf(les.id)];
 if(!v||!v.u)return el("div",{class:"vid"},el("span",{class:"pill"},"Video"),el("span",{class:"muted",style:"font-size:13px"},"El video de este capítulo lo carga el equipo de Marketing. Mientras tanto, mira la lección animada."));
 if(v.k==="a"||(v.k==="l"&&/\.(mp4|webm)(\?|#|$)/i.test(v.u))){
  const vd=el("video",{controls:true,preload:"metadata",playsinline:true,src:v.u});
  const box=el("div",{class:"vid",style:"display:block"},vd);
  vd.addEventListener("error",()=>{box.replaceChildren(el("a",{class:"btn sm",href:v.u,target:"_blank",rel:"noopener"},"Abrir video"))});
  return box}
 const yt=ytId(v.u);
 if(yt&&window.claude&&window.claude.__pwa)return el("div",{class:"vid",style:"display:block"},el("div",{class:"ytw"},el("iframe",{src:"https://www.youtube-nocookie.com/embed/"+yt+"?rel=0&modestbranding=1",title:"Video del capítulo "+les.id,allow:"accelerometer; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:true,loading:"lazy",referrerpolicy:"strict-origin-when-cross-origin"})),el("a",{class:"lnk",style:"display:inline-block;margin-top:8px;font-size:13px",href:v.u,target:"_blank",rel:"noopener"},"Abrir en YouTube"));
 return el("div",{class:"vid"},el("span",{class:"pill or"},"Video"),el("a",{class:"btn sm",href:v.u,target:"_blank",rel:"noopener"},"Ver video del capítulo"),el("span",{class:"muted",style:"font-size:13px"},"Se abre en otra pestaña."))}

function lessonStage(host,mo,les){
 const sc=les.sc,i=Math.min(S.sc,sc.length-1),s=sc[i],dur=reduce()?0:9;
 const st=el("div",{class:"stage"});
 st.appendChild(el("div",{class:"stage-top"},el("span",{class:"t"},"Capítulo "+les.id+" · "+les.t),el("span",{class:"t"},(i+1)+" / "+sc.length)));
 const seg=el("div",{class:"seg"+(S.play&&dur&&!lessonLast(i,sc)?" play":""),style:"--dur:"+dur+"s"});
 sc.forEach((_,j)=>seg.appendChild(el("i",{class:j<i?"on":j===i?"cur on":""},j===i?el("b"):null)));
 st.appendChild(seg);
 const sceneEl=el("div",{class:"scene"+(s.s?" wide":""),"aria-live":"polite"});
 if(s.s)sceneEl.appendChild(el("div",{class:"big"},s.s));
 sceneEl.appendChild(el("div",null,el("span",{class:"kick k"},s.k),el("h2",{style:"margin:8px 0 10px"},s.h),el("p",null,s.b)));
 st.appendChild(sceneEl);
 const prev=el("button",{class:"btn ghost sm",disabled:i===0,on:{click:()=>{S.sc=i-1;render()}}},"Anterior");
 const last=lessonLast(i,sc);
 const next=last?el("button",{class:"btn sm",on:{click:()=>finishLesson(mo,les)}},lessonDone(les.id)?"Lección completa":"Terminar capítulo"):el("button",{class:"btn sm",on:{click:()=>{S.sc=i+1;render()}}},"Siguiente");
 const pl=el("button",{class:"btn ghost sm","aria-pressed":S.play?"true":"false",on:{click:()=>{S.play=!S.play;render()}}},S.play&&dur?"Pausar":"Reproducir");
 st.appendChild(el("div",{class:"stage-bot"},el("div",{class:"row",style:"gap:8px"},prev,pl),next));
 host.appendChild(st);
 host.appendChild(videoBlock(les));
 const idx=mo.lessons.indexOf(les);
 host.appendChild(el("p",{class:"muted",style:"margin-top:14px;font-size:13px"},"Tarea de la sesión: "+mo.tarea.join(" ")));
 if(S.play&&dur&&!last)timer=setTimeout(()=>{S.sc=i+1;render()},dur*1000)}
const lessonLast=(i,sc)=>i>=sc.length-1;
function finishLesson(mo,les){
 const first=!lessonDone(les.id);
 if(first){L().les[les.id]=Date.now();addXp(10);save()}
 const idx=mo.lessons.indexOf(les);
 clearTimeout(timer);
 if(idx<mo.lessons.length-1){S.sub="l:"+mo.lessons[idx+1].id;S.sc=0;if(first)toast("+10 pts. Capítulo completo.")}
 else{S.sub="q";S.qz=null;toast(first?"+10 pts. Ya puedes tomar el quiz.":"Quiz del módulo")}
 render();window.scrollTo(0,0)}

/* ---------- quiz ---------- */
function mkQuiz(qs){return{items:qs.map(q=>({q,ord:shuffle(q.o.map((_,i)=>i)),pick:null})),i:0,done:false}}
function quizView(host,mo){
 if(!quizOpen(mo)){host.appendChild(el("div",{class:"panel"},"Termina los 3 capítulos para abrir el quiz."));return}
 if(!S.qz||S.qz.mod!==mo.id){S.qz=mkQuiz(mo.q);S.qz.mod=mo.id}
 const z=S.qz;
 if(z.done)return quizResult(host,mo,z);
 const it=z.items[z.i],q=it.q,n=z.items.length;
 const card=el("div",{class:"card"});
 card.appendChild(el("div",{class:"steps"},z.items.map((x,j)=>el("i",{class:x.pick==null?(j===z.i?"on":""):(x.ord[x.pick]===x.q.a?"ok":"ko")}))));
 card.appendChild(el("span",{class:"kick"},"Pregunta "+(z.i+1)+" de "+n));
 card.appendChild(el("h2",{style:"font-size:clamp(20px,3vw,26px);font-weight:800;margin:8px 0 6px"},q.q));
 it.ord.forEach((oi,k)=>{
  let cls="qopt";
  if(it.pick!=null){if(oi===q.a)cls+=" ok";else if(k===it.pick)cls+=" ko"}
  card.appendChild(el("button",{class:cls,disabled:it.pick!=null,on:{click:()=>{it.pick=k;render()}}},el("span",{class:"k"},"ABCD"[k]),el("span",null,q.o[oi])))});
 if(it.pick!=null){
  const right=it.ord[it.pick]===q.a;
  card.appendChild(el("div",{class:"panel",style:"margin-top:14px","aria-live":"polite"},el("b",{style:"font-family:var(--fh)"},right?"Correcto. ":"No exactamente. "),q.e));
  card.appendChild(el("div",{style:"margin-top:14px"},el("button",{class:"btn",on:{click:()=>{if(z.i<n-1)z.i++;else{z.done=true;gradeQuiz(mo,z)}render()}}},z.i<n-1?"Siguiente":"Ver resultado")))}
 host.appendChild(card)}
function gradeQuiz(mo,z){
 const sc=z.items.filter(x=>x.ord[x.pick]===x.q.a).length,need=Math.ceil(mo.q.length*PASS),pass=sc>=need;
 const prev=L().qz[mo.id],first=!(prev&&prev.pass);
 L().qz[mo.id]={best:Math.max(sc,prev?prev.best:0),pass:pass||(prev&&prev.pass)||false,ts:Date.now(),tries:(prev?prev.tries:0)+1};
 if(pass&&first){addXp(30);toast("+30 pts. Módulo completo.")}
 z.sc=sc;z.pass=pass;save()}
function quizResult(host,mo,z){
 const need=Math.ceil(mo.q.length*PASS);
 const nx=nextMod();
 host.appendChild(el("div",{class:"card"},
  el("span",{class:"kick"},z.pass?"Aprobado":"Casi"),
  el("h2",{style:"font-size:clamp(24px,4vw,34px);font-weight:900;margin:6px 0"},z.sc+" de "+z.items.length+" correctas"),
  el("p",{class:"muted"},z.pass?"Desbloqueaste las misiones BLITZ de este módulo.":"Necesitas "+need+" para aprobar. Repasa los capítulos y vuelve a intentarlo."),
  el("div",{style:"margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"},
   z.pass?el("button",{class:"btn",on:{click:()=>{S.sub="m";render()}}},"Ir a las misiones"):null,
   z.pass&&nx&&nx.id!==mo.id?el("button",{class:"btn ghost",on:{click:()=>go("mod",nx.id)}},"Siguiente módulo"):null,
   el("button",{class:"btn ghost",on:{click:()=>{S.qz=null;render()}}},"Repetir quiz"))))}

/* ---------- misiones ---------- */
function relevant(x){const f=L().fo||"a";return f==="a"||x.f==="a"||x.f===f}
function missionCard(x){
 const mo=modOf(x.m),unlocked=modPassed(mo),sub=L().ms[x.id],val=S.vals&&S.vals[x.id];
 const cls="mis"+(sub?" done":!unlocked?" lock":"");
 const c=el("article",{class:cls});
 c.appendChild(el("div",{class:"row",style:"gap:8px;justify-content:space-between"},
  el("span",{class:"kick"},"Módulo "+x.m+" · "+(x.f==="n"?"Cuentas nuevas":x.f==="b"?"Clientes actuales":"Ambos")),
  el("span",{class:"row",style:"gap:6px"},el("span",{class:"pill"},"Nivel "+LEV[x.lv-1]),el("span",{class:"pill or"},x.xp+" pts"))));
 c.appendChild(el("h4",null,x.t));
 c.appendChild(el("p",{style:"color:var(--body)"},x.d));
 c.appendChild(el("div",{class:"cardchips","aria-label":"Jugadas del Play Deck"},x.cards.map(n=>{const cd=cardOf(n);return el("span",{class:"cc",title:cd?cd.t:""},el("b",null,String(n).padStart(2,"0")),cd?cd.t:"")})));
 if(sub){
  c.appendChild(el("div",{class:"row",style:"gap:8px"},el("span",{class:"pill ok"},val?"Validada por el equipo":"Entregada "+fmtD(sub.ts)),sub.n?el("span",{class:"pill"},sub.n+" realizadas"):null,
   el("button",{class:"lnk",on:{click:()=>{S.open=S.open===x.id?null:x.id;render()}}},S.open===x.id?"Cerrar":"Editar entrega")));
  c.appendChild(el("p",{class:"muted",style:"font-size:13px"},"“"+sub.ev+"”"))}
 if(!sub&&!unlocked){c.appendChild(el("p",{style:"font-size:13px"},"Aprueba el quiz del módulo "+x.m+" para desbloquear."));c.appendChild(el("button",{class:"btn ghost sm",on:{click:()=>go("mod",x.m,"q")}},"Ir al módulo"));return c}
 if(!sub||S.open===x.id){
  if(S.open!==x.id&&!sub){c.appendChild(el("div",{class:"row",style:"gap:8px"},el("button",{class:"btn sm",on:{click:()=>{S.open=x.id;render()}}},"Entregar misión"),el("a",{class:"btn ghost sm",href:S.cfg.blitz.play||PLAY_URL,target:"_blank",rel:"noopener"},"Abrir Play Deck")));return c}
  const ev=el("textarea",{class:"txa",placeholder:x.ev+" (mínimo 10 caracteres)",id:"ev-"+x.id});ev.value=sub?sub.ev:"";
  const nn=x.goal?el("input",{class:"inp",type:"number",min:"0",max:"999",value:sub&&sub.n!=null?sub.n:x.goal,"aria-label":"Cuántas realizaste",style:"max-width:140px"}):null;
  const er=el("div",{class:"err",role:"alert"});
  c.appendChild(el("div",{class:"fld"},el("label",{for:"ev-"+x.id},"Evidencia: "+x.ev),ev));
  if(nn)c.appendChild(el("div",{class:"fld"},el("label",null,"¿Cuántas realizaste? (meta "+x.goal+")"),nn));
  c.appendChild(er);
  c.appendChild(el("div",{class:"row",style:"gap:8px"},el("button",{class:"btn sm",on:{click:()=>{
   const t=ev.value.trim();if(t.length<10){er.textContent="Cuéntanos un poco más (mínimo 10 caracteres).";return}
   const first=!L().ms[x.id];L().ms[x.id]={ts:Date.now(),ev:t.slice(0,600),n:nn?Math.max(0,Math.min(999,+nn.value||0)):null};
   if(first)addXp(x.xp);S.open=null;save();toast(first?"+"+x.xp+" pts. Misión entregada.":"Entrega actualizada.");render()}}},"Enviar"),
   el("button",{class:"btn ghost sm",on:{click:()=>{S.open=null;render()}}},"Cancelar")))}
 return c}
function missionList(host,list,inModule){
 const l=list.slice().sort((a,b)=>(!!L().ms[a.id])-(!!L().ms[b.id])||(relevant(b)-relevant(a))||(a.lv-b.lv));
 host.appendChild(el("div",{class:"grid"},l.map(missionCard)));
 if(inModule&&!l.length)host.appendChild(el("div",{class:"panel"},"Sin misiones."))}
function viewMissions(m){
 m.replaceChildren();
 m.appendChild(el("div",{class:"hero",style:"grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)"},
  el("div",{class:"hero-l"},el("span",{class:"kick"},"Del aprendizaje a la acción"),el("h1",null,"Misiones "+(S.cfg.blitz.name||"BLITZ")),el("p",null,"Cada misión se ancla a jugadas del Play Deck. Aprueba el quiz del módulo, ejecuta en cuentas reales y entrega tu evidencia."),
   el("div",{style:"margin-top:18px"},el("a",{class:"btn",href:S.cfg.blitz.play||PLAY_URL,target:"_blank",rel:"noopener"},"Abrir el Sales Play Deck"))),
  blitzCard()));
 const all=MISSIONS.filter(relevant),done=all.filter(x=>L().ms[x.id]).length;
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Tus misiones"),el("div",{class:"row",style:"gap:8px"},
  [["all","Todas"],["mine","Para mi nivel"],["open","Pendientes"],["done","Entregadas"]].map(([k,n])=>el("button",{class:"btn sm "+(S.mf===k?"":"ghost"),"aria-pressed":S.mf===k?"true":"false",on:{click:()=>{S.mf=k;render()}}},n)),
  el("span",{class:"pill ok"},done+" de "+all.length+" entregadas"))));
 let list=all;
 if(S.mf==="mine")list=all.filter(x=>x.lv<=L().lv+1);
 if(S.mf==="open")list=all.filter(x=>!L().ms[x.id]);
 if(S.mf==="done")list=all.filter(x=>L().ms[x.id]);
 const g=el("div",{class:"grid g2"});
 list.slice().sort((a,b)=>(!!L().ms[a.id])-(!!L().ms[b.id])||a.m-b.m||a.lv-b.lv).forEach(x=>g.appendChild(missionCard(x)));
 m.appendChild(g);
 if(!list.length)m.appendChild(el("div",{class:"panel"},"No hay misiones en este filtro."))}
