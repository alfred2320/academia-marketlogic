/* ===== Examen, certificado y panel de equipo ===== */
const EXAM_N=15;
function mkExam(){
 let pick=[];
 MODS.forEach(m=>{pick=pick.concat(shuffle(EXAM.filter(e=>e.m===m.id)).slice(0,2))});
 const rest=shuffle(EXAM.filter(e=>pick.indexOf(e)<0));
 pick.push(rest[0]);
 return{items:shuffle(pick).map(q=>({q,ord:shuffle(q.o.map((_,i)=>i)),pick:null})),i:0,done:false}}
function certReqs(){
 const l=L(),min=S.cfg.blitz.min||3;
 return[
  {ok:modsDone()===MODS.length,t:"Aprobar los 7 quizzes de módulo",d:modsDone()+" de "+MODS.length},
  {ok:l.ex.best>=PASS*100,t:"Aprobar el examen final con 80% o más",d:l.ex.best?"Mejor resultado: "+l.ex.best+"%":"Sin intentos"},
  {ok:missDone()>=min,t:"Entregar al menos "+min+" misiones BLITZ",d:missDone()+" entregadas"}]}
function viewCert(m){
 m.replaceChildren();
 const rq=certReqs(),allm=rq[0].ok;
 m.appendChild(el("div",{class:"crumb"},el("span",null,"Cierre del programa")));
 m.appendChild(el("h1",{style:"font-size:clamp(26px,4vw,38px);font-weight:900;margin-bottom:6px"},"Examen final y certificado"));
 m.appendChild(el("p",{class:"muted",style:"margin-bottom:18px"},"Tres requisitos. Cuando los cumplas, generas tu certificado."));
 const li=rq.map(r=>el("li",{class:r.ok?"ok":""},el("span",{class:"dot"},r.ok?"✓":""),el("span",null,el("b",null,r.t),el("span",{class:"muted"}," · "+r.d))));
 m.appendChild(el("div",{class:"card"},el("ul",{class:"reqs",style:"padding:0;margin:0"},li)));
 m.appendChild(el("div",{style:"height:16px"}));
 if(S.ex&&!S.ex.done)return examView(m);
 if(S.ex&&S.ex.done)return examResult(m);
 const l=L();
 m.appendChild(el("div",{class:"card"},el("span",{class:"kick"},"Examen final"),el("h3",{style:"font-size:20px;margin:6px 0"},EXAM_N+" escenarios de venta"),
  el("p",{class:"muted"},allm?"Se arma con preguntas de los 7 módulos. Necesitas "+Math.ceil(EXAM_N*PASS)+" para aprobar. Puedes repetirlo.":"Se abre cuando apruebes los 7 quizzes de módulo."),
  el("div",{style:"margin-top:14px"},el("button",{class:"btn",disabled:!allm,on:{click:()=>{S.ex=mkExam();render()}}},l.ex.tries?"Repetir examen":"Empezar examen")))); 
 m.appendChild(el("div",{style:"height:16px"}));
 certBlock(m)}
function examView(m){
 const z=S.ex,it=z.items[z.i],q=it.q,n=z.items.length;
 const card=el("div",{class:"card"});
 card.appendChild(el("div",{class:"steps"},z.items.map((x,j)=>el("i",{class:x.pick!=null?"ok":j===z.i?"on":""}))));
 card.appendChild(el("span",{class:"kick"},"Examen · "+(z.i+1)+" de "+n+" · Módulo "+q.m));
 card.appendChild(el("h2",{style:"font-size:clamp(20px,3vw,26px);font-weight:800;margin:8px 0 6px"},q.q));
 it.ord.forEach((oi,k)=>card.appendChild(el("button",{class:"qopt"+(it.pick===k?" sel":""),on:{click:()=>{it.pick=k;render()}}},el("span",{class:"k"},"ABCD"[k]),el("span",null,q.o[oi]))));
 card.appendChild(el("div",{style:"margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"},
  z.i>0?el("button",{class:"btn ghost",on:{click:()=>{z.i--;render()}}},"Anterior"):null,
  el("button",{class:"btn",disabled:it.pick==null,on:{click:()=>{if(z.i<n-1)z.i++;else{z.done=true;gradeExam(z)}render()}}},z.i<n-1?"Siguiente":"Terminar examen"),
  el("button",{class:"lnk",on:{click:()=>{S.ex=null;render()}}},"Salir sin calificar")));
 m.appendChild(card)}
function gradeExam(z){
 const sc=z.items.filter(x=>x.ord[x.pick]===x.q.a).length,p=Math.round(sc*100/z.items.length),l=L();
 const was=l.ex.best>=PASS*100;
 l.ex={best:Math.max(l.ex.best,p),tries:l.ex.tries+1,ts:Date.now()};
 z.sc=sc;z.p=p;
 if(p>=PASS*100&&!was){addXp(100);toast("+100 pts. Examen aprobado.")}
 save()}
function examResult(m){
 const z=S.ex,pass=z.p>=PASS*100;
 const wrong=z.items.filter(x=>x.ord[x.pick]!==x.q.a);
 m.appendChild(el("div",{class:"card"},el("span",{class:"kick"},pass?"Aprobado":"Casi"),
  el("h2",{style:"font-size:clamp(28px,5vw,44px);font-weight:900;margin:6px 0"},z.p+"%"),
  el("p",{class:"muted"},z.sc+" de "+z.items.length+" correctas. "+(pass?"Ya cumples el requisito del examen.":"Necesitas "+Math.ceil(z.items.length*PASS)+" para aprobar.")),
  wrong.length?el("div",{style:"margin-top:14px"},el("b",{style:"font-family:var(--fh)"},"Para repasar"),wrong.map(x=>el("div",{class:"panel",style:"margin-top:10px"},el("b",null,x.q.q),el("br"),el("span",null,"Respuesta: "+x.q.o[x.q.a]+". "+x.q.e),el("br"),el("button",{class:"lnk",on:{click:()=>{S.ex=null;go("mod",x.q.m)}}},"Repasar módulo "+x.q.m)))):null,
  el("div",{style:"margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"},el("button",{class:"btn",on:{click:()=>{S.ex=null;render()}}},pass?"Continuar":"Volver"),!pass?el("button",{class:"btn ghost",on:{click:()=>{S.ex=mkExam();render()}}},"Repetir examen"):null)))}

/* ---------- certificado ---------- */
function codeFor(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return"MLA-"+h.toString(36).toUpperCase().padStart(7,"0").slice(0,7)}
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;setTimeout(()=>rej(new Error("img")),4000);i.src=src})}
async function drawCert(c){
 try{await Promise.all([document.fonts.load("900 80px Montserrat"),document.fonts.load("700 30px Montserrat"),document.fonts.load("400 28px 'Open Sans'")])}catch(e){}
 const W=1600,H=1130,cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");
 g.fillStyle="#fff";g.fillRect(0,0,W,H);
 g.fillStyle="#171B26";g.fillRect(0,0,W,230);
 try{const im=await loadImg(LOGO_URI);const h=74,w=h*im.width/im.height;g.drawImage(im,100,78,w,h)}catch(e){}
 g.textBaseline="alphabetic";g.textAlign="right";g.fillStyle="#CCD6DF";g.font="700 26px Montserrat, Arial, sans-serif";
 g.fillText("SALES LEARNING PATH",W-100,135);
 g.fillStyle="#FF5B09";g.fillRect(0,230,W,16);
 g.textAlign="center";
 g.fillStyle="#FF5B09";g.font="800 30px Montserrat, Arial, sans-serif";g.fillText("CERTIFICADO DE FINALIZACIÓN",W/2,345);
 g.fillStyle="#6B7280";g.font="400 30px 'Open Sans', Arial, sans-serif";g.fillText("MarketLogic Digital certifica que",W/2,420);
 let fs=104;g.fillStyle="#171B26";
 do{g.font="900 "+fs+"px Montserrat, Arial, sans-serif";fs-=4}while(g.measureText(c.nm).width>1300&&fs>40);
 g.fillText(c.nm,W/2,550);
 g.fillStyle="#FF5B09";g.fillRect(W/2-90,590,180,8);
 g.fillStyle="#171B26";g.font="400 32px 'Open Sans', Arial, sans-serif";
 const lines=["completó los 7 módulos del Digital Sales Learning Path,","aprobó el examen final con "+c.p+"% y entregó "+c.ms+" misiones "+(c.bl||"BLITZ")+"","aplicando lo aprendido con las jugadas del Sales Play Deck."];
 lines.forEach((t,i)=>g.fillText(t,W/2,670+i*50));
 g.fillStyle="#F5F5F5";g.fillRect(100,880,W-200,150);
 g.textAlign="left";g.fillStyle="#6B7280";g.font="700 20px Montserrat, Arial, sans-serif";
 g.fillText("FECHA",150,930);g.fillText("CÓDIGO",600,930);g.fillText("PROGRAMA",1000,930);
 g.fillStyle="#171B26";g.font="800 32px Montserrat, Arial, sans-serif";
 g.fillText(new Date(c.ts).toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"}),150,985);
 g.fillText(c.code,600,985);g.font="800 28px Montserrat, Arial, sans-serif";g.fillText("7 sesiones · 21 capítulos",1000,985);
 g.fillStyle="#FF5B09";g.fillRect(0,H-16,W,16);
 return cv}
function certBlock(m){
 const rq=certReqs(),all=rq.every(r=>r.ok),l=L();
 const wrap=el("div",{class:"card"});
 wrap.appendChild(el("span",{class:"kick"},"Certificado"));
 if(!all){wrap.appendChild(el("h3",{style:"font-size:20px;margin:6px 0"},"Aún no está disponible"));wrap.appendChild(el("p",{class:"muted"},"Cumple los tres requisitos de arriba para generarlo."));m.appendChild(wrap);return}
 const dflt=l.cert?l.cert.nm:(S.name||S.hsName||nameFromEmail(S.email));
 wrap.appendChild(el("h3",{style:"font-size:20px;margin:6px 0"},l.cert?"Tu certificado":"Genera tu certificado"));
 const inp=el("input",{class:"inp",id:"cNm",maxlength:"60",value:dflt,"aria-label":"Nombre en el certificado"});
 wrap.appendChild(el("div",{class:"fld"},el("label",{for:"cNm"},"Nombre que aparecerá"),inp));
 const prev=el("div",{style:"margin-top:16px"});
 const dl=el("button",{class:"btn ghost",hidden:true},"Descargar PNG");
 const mk=async()=>{
  const nm=inp.value.trim()||dflt;
  const ts=l.cert?l.cert.ts:Date.now();
  const c={nm,ts,p:l.ex.best,ms:missDone(),bl:S.cfg.blitz.name||"BLITZ",code:l.cert?l.cert.code:codeFor(S.uid+"|"+ts+"|"+nm)};
  const cv=await drawCert(c);
  l.cert={nm,ts,code:c.code,p:c.p,ms:c.ms};save();
  const url=cv.toDataURL("image/png");
  prev.replaceChildren(el("img",{class:"certimg",src:url,alt:"Certificado de "+nm}));
  dl.hidden=false;dl.onclick=async()=>{
   try{const dls=await claude.use("downloads");if(!dls)throw 0;const b=await new Promise(r=>cv.toBlob(r,"image/png"));
    await dls.save({filename:"certificado-academia-marketlogic.png",data:b});toast("Certificado guardado.")}
   catch(e){if(e&&e.code==="declined")return;toast("No se pudo abrir la descarga. Mantén presionada la imagen para guardarla.")}};
  if(!l.cert.shown){l.cert.shown=1;toast("Certificado listo. Código "+c.code)}};
 wrap.appendChild(el("div",{class:"row",style:"margin-top:14px;gap:10px"},el("button",{class:"btn",on:{click:mk}},l.cert?"Actualizar certificado":"Generar certificado"),dl));
 wrap.appendChild(prev);m.appendChild(wrap);
 if(l.cert)mk()}
function nameFromEmail(e){return(e||"").split("@")[0].split(/[._-]+/).filter(Boolean).map(s=>s[0].toUpperCase()+s.slice(1)).join(" ")||"Participante"}
