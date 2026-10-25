/* ===== Panel de equipo (editores) ===== */
async function loadTeam(){
 S.team={rows:[],vals:{},loading:true};render();
 try{
  const sn=await S.db.collection("learners").get();
  S.team.rows=sn.docs.map(d=>Object.assign({id:d.id},d.data()));
  const vs=await S.db.collection("vals").get();vs.docs.forEach(d=>{S.team.vals[d.id]=d.data()});
  S.team.acc={};S.team.req=[];
  try{const ac=await S.db.collection("access").get();ac.docs.forEach(d=>{S.team.acc[d.id]=d.data()})}catch(e){}
  try{const rq=await S.db.collection("requests").get();S.team.req=rq.docs.map(d=>Object.assign({id:d.id},d.data()))}catch(e){}
  await resolveNames(S.team.rows.map(r=>r.id).concat(S.team.req.map(r=>r.id)));
 }catch(e){S.team.err="No se pudo leer el equipo ("+((e&&e.code)||"error")+")."}
 S.team.loading=false;render()}
function rowStats(r){
 const qz=r.qz||{},ms=r.ms||{},v=S.team.vals[r.id]||{};
 return{md:Object.values(qz).filter(q=>q&&q.pass).length,ls:Object.keys(r.les||{}).length,ms:Object.keys(ms).length,vl:Object.keys(ms).filter(k=>v[k]).length,ex:(r.ex&&r.ex.best)||0}}
function csvCell(v){let s=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return/[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
async function exportCsv(){
 const H=["Nombre","Correo","Correo verificado","Nivel","Foco","Modulos completos","Lecciones","Misiones entregadas","Misiones validadas","Mejor examen %","Certificado","Codigo","Puntos","Ultima actividad"];
 const rows=S.team.rows.map(r=>{const s=rowStats(r);return[nameOf(r.id),r.em||"",VF[r.vf]||"sin verificar",r.lv==null?"":LEV[r.lv],r.fo?FOCUS[r.fo].n:"",s.md,s.ls,s.ms,s.vl,s.ex,r.cert?fmtD(r.cert.ts):"",r.cert?r.cert.code:"",r.xp||0,fmtD(r.t)]});
 const csv="﻿"+[H].concat(rows).map(r=>r.map(csvCell).join(",")).join("\n");
 try{const dls=await claude.use("downloads");if(!dls)throw 0;await dls.save({filename:"academia-equipo.csv",data:csv});toast("CSV guardado.")}
 catch(e){if(e&&e.code==="declined")return;toast("No se pudo abrir la descarga del CSV.")}}
async function validate(uid,mid){
 try{const ref=S.db.doc("vals/"+uid);const sn=await ref.get();const cur=sn.exists?sn.data():{};cur[mid]=Date.now();await ref.set(cur);S.team.vals[uid]=cur;toast("Misión validada.");render()}
 catch(e){toast("No se pudo validar.")}}
function viewTeam(m){
 m.replaceChildren();
 if(!S.admin){m.appendChild(el("div",{class:"panel"},"Solo editores."));return}
 if(!S.db||S.local){m.appendChild(el("div",{class:"banner"},"El panel necesita la base compartida. Abre la Academia desde el enlace publicado con tu cuenta de editor."));return}
 if(!S.team){loadTeam();return}
 m.appendChild(el("div",{class:"row",style:"justify-content:space-between;margin-bottom:14px"},el("h1",{style:"font-size:clamp(26px,4vw,38px);font-weight:900"},"Equipo"),
  el("div",{class:"row",style:"gap:8px"},[["res","Resumen"],["acc","Accesos"+(S.team.req&&S.team.req.length?" ("+S.team.req.length+")":"")],["cfg","BLITZ"],["vid","Videos"]].map(([k,n])=>el("button",{class:"btn sm "+(S.tsub===k?"":"ghost"),on:{click:()=>{S.tsub=k;render()}}},n)),el("button",{class:"btn ghost sm",on:{click:loadTeam}},"Actualizar"))));
 if(S.team.loading){m.appendChild(el("p",{class:"muted"},"Cargando equipo..."));return}
 if(S.team.err)m.appendChild(el("div",{class:"banner"},S.team.err));
 if(S.tsub==="acc")return teamAccess(m);
 if(S.tsub==="cfg")return teamCfg(m);
 if(S.tsub==="vid")return teamVideos(m);
 const R=S.team.rows,st=R.map(rowStats);
 const sum=k=>st.reduce((a,x)=>a+x[k],0);
 m.appendChild(el("div",{class:"stats"},
  [[R.length,"Personas"],[R.filter(r=>r.cert).length,"Certificados"],[sum("ms"),"Misiones entregadas"],[R.length?Math.round(R.reduce((a,r,i)=>a+st[i].md,0)*100/(R.length*MODS.length))+"%":"0%","Avance medio"]].map(([n,t])=>el("div",{class:"stat"},el("b",null,String(n)),el("span",null,t)))));
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Personas"),el("button",{class:"btn sm",on:{click:exportCsv}},"Exportar CSV")));
 const rows=R.map((r,i)=>[r,st[i]]).sort((a,b)=>b[1].md-a[1].md||b[1].ms-a[1].ms);
 m.appendChild(el("div",{class:"scrollx"},el("table",{class:"tbl"},el("thead",null,el("tr",null,["Persona","Nivel y foco","Módulos","Misiones","Examen","Cert.","Pts","Actividad"].map(h=>el("th",null,h)))),
  el("tbody",null,rows.map(([r,s])=>el("tr",null,
   el("td",null,el("b",null,nameOf(r.id)),el("br"),el("span",{class:"muted"},r.em||"sin correo"),el("span",{class:"pill"+(r.vf?"":" or"),style:"margin-left:6px"},VF[r.vf]||"sin verificar")),
   el("td",null,r.lv==null?"-":LEV[r.lv],el("br"),el("span",{class:"muted"},r.fo?FOCUS[r.fo].n:"")),
   el("td",null,s.md+"/"+MODS.length),el("td",null,s.ms+(s.vl?" ("+s.vl+" val.)":"")),el("td",null,s.ex?s.ex+"%":"-"),el("td",null,r.cert?r.cert.code:"-"),el("td",null,String(r.xp||0)),el("td",null,fmtD(r.t))))))));
 if(!R.length)m.appendChild(el("p",{class:"muted",style:"margin-top:10px"},"Todavía nadie ha entrado."));
 const q=[];R.forEach(r=>Object.keys(r.ms||{}).forEach(k=>{if(!((S.team.vals[r.id]||{})[k])){const x=MISSIONS.find(z=>z.id===k);if(x)q.push([r,x,r.ms[k]])}}));
 q.sort((a,b)=>b[2].ts-a[2].ts);
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Por validar"),el("span",{class:"pill"},q.length+" pendientes")));
 q.slice(0,40).forEach(([r,x,s])=>m.appendChild(el("div",{class:"mis",style:"margin-bottom:10px"},
  el("div",{class:"row",style:"justify-content:space-between"},el("b",null,nameOf(r.id)+" · "+x.t),el("span",{class:"muted"},fmtD(s.ts))),
  el("p",{style:"color:var(--body)"},"“"+s.ev+"”"+(s.n!=null?" ("+s.n+" realizadas)":"")),
  el("div",null,el("button",{class:"btn sm",on:{click:()=>validate(r.id,x.id)}},"Validar")))));
 if(!q.length)m.appendChild(el("p",{class:"muted"},"Todo validado."))}
function teamCfg(m){
 const b=S.cfg.blitz,f={};
 const fld=(k,l,t,w)=>{const i=el(t==="area"?"textarea":"input",{class:t==="area"?"txa":"inp",type:t==="area"?null:t||"text",id:"c-"+k});i.value=b[k]==null?"":b[k];f[k]=i;return el("div",{class:"fld",style:w?"grid-column:span 2":""},el("label",{for:"c-"+k},l),i)};
 m.appendChild(el("div",{class:"card"},el("span",{class:"kick"},"Campaña"),el("h3",{style:"font-size:20px;margin:6px 0 12px"},"Configura el BLITZ en ejecución"),
  el("div",{class:"grid g2"},fld("name","Nombre"),fld("goal","Meta de misiones del equipo","number"),fld("start","Inicio (texto libre, ej. 2 nov)"),fld("end","Fin"),fld("min","Misiones mínimas para certificar","number"),fld("play","Enlace del Sales Play Deck","url"),fld("desc","Descripción","area",1)),
  el("div",{style:"margin-top:14px"},el("button",{class:"btn",on:{click:async()=>{
   const v={name:f.name.value.trim()||"BLITZ",desc:f.desc.value.trim(),start:f.start.value.trim(),end:f.end.value.trim(),goal:Math.max(1,+f.goal.value||50),min:Math.max(0,+f.min.value||3),play:f.play.value.trim()||PLAY_URL};
   try{await S.db.doc("config/blitz").set(v);Object.assign(S.cfg.blitz,v);toast("BLITZ actualizado.")}catch(e){toast("No se pudo guardar.")}}}},"Guardar"))))}
function teamVideos(m){
 const pwa=!!(window.claude&&window.claude.__pwa);
 m.appendChild(el("p",{class:"muted",style:"margin-bottom:12px"},pwa?"Pega el enlace de YouTube (video no listado) de cada capítulo. Se reproduce dentro de la Academia. También sirve un enlace directo a un archivo mp4.":"Pega el enlace de cada video (se abre en otra pestaña) o sube un clip corto de hasta 20 MB para reproducirlo dentro de la Academia."));
 const g=el("div",{class:"grid"});
 MODS.forEach(mo=>mo.lessons.forEach(l=>{
  const k=keyOf(l.id),cur=S.cfg.videos[k]||{};
  const inp=el("input",{class:"inp",type:"url",placeholder:"https://...","aria-label":"Enlace del video "+l.id});inp.value=cur.u||"";
  const save1=async(u,kind)=>{const nv=Object.assign({},S.cfg.videos);if(u)nv[k]={u,k:kind};else delete nv[k];
   try{await S.db.doc("config/videos").set(nv);S.cfg.videos=nv;toast("Video guardado.")}catch(e){toast("No se pudo guardar el video.")}};
  const up=el("input",{type:"file",accept:"video/mp4,video/webm",hidden:true});
  up.addEventListener("change",async()=>{const fl=up.files[0];if(!fl)return;
   try{const as=await claude.use("assets");if(!as)throw 0;toast("Subiendo...");const r=await as.upload(fl);inp.value=r.url;await save1(r.url,"a");render()}catch(e){toast("No se pudo subir el clip (máx. 20 MB, mp4 o webm).")}});
  g.appendChild(el("div",{class:"card"},el("div",{class:"row",style:"justify-content:space-between"},el("b",null,l.id+" · "+l.t),cur.u?el("span",{class:"pill ok"},cur.k==="a"?"Clip":cur.k==="y"?"YouTube":"Enlace"):el("span",{class:"pill"},"Sin video")),
   el("div",{class:"row",style:"margin-top:10px;gap:8px"},el("div",{style:"flex:1;min-width:220px"},inp),el("button",{class:"btn sm",on:{click:()=>save1(inp.value.trim(),vidKind(inp.value.trim()))}},"Guardar enlace"),pwa?null:el("button",{class:"btn ghost sm",on:{click:()=>up.click()}},"Subir clip"),up)))}));
 m.appendChild(g)}

async function setAccess(uid,em,ok,from){
 try{await S.db.doc("access/"+uid).set({ok,em:em||"",ts:Date.now(),by:S.uid});
  if(from==="req")await S.db.doc("requests/"+uid).delete();
  S.team.acc[uid]={ok,em};if(from==="req")S.team.req=S.team.req.filter(r=>r.id!==uid);
  toast(ok?"Acceso aprobado.":"Acceso bloqueado.");render()}
 catch(e){toast("No se pudo guardar el acceso.")}}
function teamAccess(m){
 const A=S.team.acc||{},R=S.team.req||[];
 m.appendChild(el("p",{class:"muted",style:"margin-bottom:12px"},"Quien abre la Academia con HubSpot de MarketLogic entra solo. Quien no tiene HubSpot pide acceso aquí. Bloquear a alguien le quita el acceso aunque su HubSpot sea válido."));
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Solicitudes"),el("span",{class:"pill"},R.length+" pendientes")));
 R.forEach(r=>{const good=okMail(r.em);
  m.appendChild(el("div",{class:"mis",style:"margin-bottom:10px"},
   el("div",{class:"row",style:"justify-content:space-between"},el("b",null,r.em||"sin correo"),el("span",{class:"muted"},fmtD(r.ts))),
   el("p",{style:"color:var(--body)"},(nameOf(r.id)!=="Colega"?nameOf(r.id)+". ":"")+(good?"Correo corporativo.":"Correo fuera del dominio corporativo: revisa antes de aprobar.")),
   el("div",{class:"row",style:"gap:8px"},el("button",{class:"btn sm",on:{click:()=>setAccess(r.id,r.em,true,"req")}},good?"Aprobar":"Aprobar de todos modos"),el("button",{class:"btn ghost sm",on:{click:()=>setAccess(r.id,r.em,false,"req")}},"Rechazar"))))});
 if(!R.length)m.appendChild(el("p",{class:"muted"},"Sin solicitudes."));
 m.appendChild(el("div",{class:"sec-h"},el("h2",null,"Personas y acceso")));
 const ids=Array.from(new Set(S.team.rows.map(r=>r.id).concat(Object.keys(A))));
 const rows=ids.map(id=>{const r=S.team.rows.find(x=>x.id===id)||{},a=A[id];return{id,em:(a&&a.em)||r.em||"",st:a&&a.ok===false?"Bloqueado":a&&a.ok?"Aprobado":VF[r.vf]||"Sin verificar"}});
 const trs=rows.map(x=>{
  const btn=x.id===S.uid?el("span",{class:"muted"},"Tú"):x.st==="Bloqueado"?el("button",{class:"btn ghost sm",on:{click:()=>setAccess(x.id,x.em,true)}},"Reactivar"):el("button",{class:"btn ghost sm",on:{click:()=>setAccess(x.id,x.em,false)}},"Bloquear");
  return el("tr",null,el("td",null,el("b",null,nameOf(x.id)),el("br"),el("span",{class:"muted"},x.em||"sin correo")),el("td",null,el("span",{class:"pill "+(x.st==="Bloqueado"?"or":"ok")},x.st)),el("td",null,btn))});
 const head=el("thead",null,el("tr",null,["Persona","Acceso","Acción"].map(h=>el("th",null,h))));
 m.appendChild(el("div",{class:"scrollx"},el("table",{class:"tbl"},head,el("tbody",null,trs))));
 if(!rows.length)m.appendChild(el("p",{class:"muted",style:"margin-top:10px"},"Todavía nadie ha entrado."))}
