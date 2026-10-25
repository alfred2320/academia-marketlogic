/* ===== Academia MarketLogic: núcleo ===== */
const DOMAIN="@mymarketlogic.com";
const PLAY_URL=(window.MLA_CONFIG&&window.MLA_CONFIG.playUrl)||"https://claude.ai/artifact/GmofmDvHagTFgxTZYLnpTk";
const PASS=.8;
const $=(s,r)=>(r||document).querySelector(s);
function el(t,a){const e=document.createElement(t);
 if(a)for(const x in a){const v=a[x];if(v==null||v===false)continue;
  if(x==="class")e.className=v;else if(x==="on"){for(const ev in v)e.addEventListener(ev,v[ev])}
  else if(x==="text")e.textContent=v;else if(x==="value"||x==="disabled"||x==="checked")e[x]=v;
  else e.setAttribute(x,v===true?"":v)}
 for(let i=2;i<arguments.length;i++)add(e,arguments[i]);return e}
function add(e,k){if(k==null||k===false)return;if(Array.isArray(k))k.forEach(x=>add(e,x));else e.appendChild(typeof k==="object"?k:document.createTextNode(String(k)))}
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmtD=t=>t?new Date(t).toLocaleDateString("es",{day:"numeric",month:"short",year:"numeric"}):"";
const pct=(a,b)=>b?Math.round(a*100/b):0;
const modOf=id=>MODS.find(m=>m.id===id);
const cardOf=n=>CARDS.find(c=>c.n===n);
const keyOf=id=>String(id).replace(".","_");
const LEV=["Arranque","Impulso","Liderazgo"];

const S={db:null,user:null,uid:"",email:"",name:"",vf:"",admin:false,L:null,local:false,warn:"",sync:"",syncMsg:"",noWrite:false,mcp:null,perm:null,acc:null,hsName:"",
 cfg:{blitz:Object.assign({},BLITZ_DEF,{min:3,play:PLAY_URL}),videos:{}},pulse:[],vals:{},names:{},
 view:"boot",tab:"ruta",modId:null,sub:null,sc:0,play:true,qz:null,ex:null,open:null,ob:null,team:null,tsub:"res",mf:"all"};
let timer=null,saveT=null,retryT=null;
const reduce=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}};
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{t.hidden=true},3200)}

/* ---------- datos del aprendiz ---------- */
function newL(){return{v:1,em:S.email,vf:S.vf,lv:null,fo:null,les:{},qz:{},ms:{},ex:{best:0,tries:0,ts:0},cert:null,xp:0,t0:Date.now(),t:Date.now()}}
const L=()=>S.L;
const lessonDone=id=>!!L().les[id];
const modLessonsDone=m=>m.lessons.filter(l=>lessonDone(l.id)).length;
const modPassed=m=>!!(L().qz[m.id]&&L().qz[m.id].pass);
const modsDone=()=>MODS.filter(modPassed).length;
const quizOpen=m=>L().lv>=1||modLessonsDone(m)===m.lessons.length;
const missDone=()=>Object.keys(L().ms).length;
const xpTotal=()=>L().xp;
function addXp(n){L().xp+=n}
function pulseOf(){const l=L();return{xp:l.xp,ms:Object.keys(l.ms).length,md:modsDone(),ex:l.ex.best>=PASS*100?1:0,ct:l.cert?1:0,t:Date.now()}}
/* une dos copias del avance sin perder nada */
function mergeL(a,b){
 const o=Object.assign({},a);
 o.les=Object.assign({},b.les||{},a.les||{});
 o.ms=Object.assign({},b.ms||{},a.ms||{});
 o.qz=Object.assign({},b.qz||{});
 Object.keys(a.qz||{}).forEach(k=>{const x=a.qz[k],y=o.qz[k];o.qz[k]=!y?x:{best:Math.max(x.best||0,y.best||0),pass:!!(x.pass||y.pass),ts:Math.max(x.ts||0,y.ts||0),tries:Math.max(x.tries||0,y.tries||0)}});
 const ea=a.ex||{best:0,tries:0,ts:0},eb=b.ex||{best:0,tries:0,ts:0};
 o.ex={best:Math.max(ea.best,eb.best),tries:Math.max(ea.tries,eb.tries),ts:Math.max(ea.ts,eb.ts)};
 o.cert=a.cert||b.cert||null;
 o.xp=Math.max(a.xp||0,b.xp||0);
 if(o.lv==null)o.lv=b.lv==null?null:b.lv;if(o.fo==null)o.fo=b.fo||null;
 o.t0=Math.min(a.t0||Date.now(),b.t0||Date.now());o.t=Math.max(a.t||0,b.t||0);
 return o}
/* estado de guardado: ok, wait, err, local */
function setSync(s){S.sync=s;const e=$("#sync");if(e){e.className="pill "+(s==="ok"?"ok":s==="wait"?"":"or");e.textContent=({ok:"Guardado en la nube",wait:"Guardando...",err:"No se pudo guardar. Reintentando",local:"Solo en este navegador"})[s]||"";e.title=S.syncMsg||""}}
function save(){L().t=Date.now();lsSet("mla_L_"+S.uid,JSON.stringify(L()));if(S.db&&!S.noWrite){setSync("wait");clearTimeout(saveT);saveT=setTimeout(flush,400)}else setSync("local")}
async function flush(){
 clearTimeout(saveT);clearTimeout(retryT);
 if(!S.db||S.noWrite||!S.L)return;
 try{await S.db.doc("learners/"+S.uid).set(L());await S.db.doc("pulse/"+S.uid).set(pulseOf());S.syncMsg="Último guardado "+new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"});setSync("ok")}
 catch(e){const c=e&&e.code;
  if(c==="permission_denied"||c==="not_granted"||c==="forbidden"||c==="unauthorized"){S.noWrite=true;S.warn="Tu acceso no permite guardar en la nube. Pide al editor que te comparta con nivel Contributor. Mientras tanto tu avance queda en este navegador y puedes descargar una copia.";setSync("local");render()}
  else{S.syncMsg="Error "+(c||"de red");setSync("err");retryT=setTimeout(flush,8000)}}}
function leaving(){if(S.L)lsSet("mla_L_"+S.uid,JSON.stringify(L()));if(S.db&&!S.noWrite&&S.sync!=="ok")flush()}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")leaving()});
window.addEventListener("pagehide",leaving);

/* ---------- arranque y autenticación ---------- */
const HS_ACCOUNT=20209541;
const okMail=e=>/^[^\s@]+@mymarketlogic\.com$/i.test(e||"");
const VF={h:"HubSpot",a:"Aprobado",e:"Editor",g:"Google"};
async function hubspotWho(){
 if(!S.mcp)throw{code:"unavailable"};
 const r=await S.mcp.callTool("HubSpot","get_user_details",{});
 let p=r&&r.payload;
 if(!p&&r&&r.content){try{p=JSON.parse((r.content.find(c=>c.type==="text")||{}).text)}catch(e){}}
 if(typeof p==="string"){try{p=JSON.parse(p)}catch(e){}}
 const ui=(p&&p.userInformation)||{};
 return{email:String(ui.email||"").toLowerCase(),acc:p&&p.accountId,name:[ui.firstName,ui.lastName].filter(Boolean).join(" ")}}
async function tryHubspot(){
 const w=await hubspotWho();
 if(!okMail(w.email)||(w.acc!=null&&+w.acc!==HS_ACCOUNT))throw{code:"not_corporate",email:w.email};
 S.email=w.email;S.vf="h";if(w.name)S.hsName=w.name;return true}
async function readAccess(){
 if(!S.db)return null;
 try{const sn=await S.db.doc("access/"+S.uid).get();return sn.exists?sn.data():null}catch(e){return null}}
const isPwa=()=>!!(window.claude&&window.claude.__pwa);
async function bootPwa(){
 const C=window.claude;
 if(!C.cfgOk)return gateView("Falta configurar la conexión (archivo config.js). Revisa docs/SETUP.md.");
 let ses=null;try{ses=await C.auth.ready()}catch(e){}
 if(!ses)return pwaGate(C.auth.urlError());
 try{S.user=await C.use("user");S.db=await C.use("db")}catch(e){}
 const me=await S.user.me();
 S.uid=me.id;S.name=me.name||"";S.email=me.email||"";
 try{S.admin=!!(await S.user.canEdit())}catch(e){}
 if(!S.admin&&!okMail(S.email)){await C.auth.signOut(true);return pwaGate("Usa tu cuenta corporativa "+DOMAIN+".")}
 S.acc=await readAccess();
 if(S.acc&&S.acc.ok===false&&!S.admin)return blocked();
 S.vf=S.admin?"e":"g";
 return enter()}
function pwaGate(note){
 const er=el("div",{class:"err",role:"alert"},note||"");
 const b=el("button",{class:"btn",on:{click:async()=>{b.disabled=true;b.textContent="Abriendo Google...";try{await window.claude.auth.signIn()}catch(e){b.disabled=false;b.textContent="Entrar con Google";er.textContent="No se pudo iniciar el acceso. Intenta de nuevo."}}}},"Entrar con Google");
 gateView("Acceso solo para el equipo de MarketLogic. Entra con tu cuenta corporativa "+DOMAIN+".",el("div",{class:"fld"},b,er))}
async function boot(){
 gateView("Verificando tu acceso...");
 if(isPwa())return bootPwa();
 const use=(window.claude&&window.claude.use)?window.claude.use.bind(window.claude):async()=>null;
 try{S.user=await use("user")}catch(e){}
 try{S.db=await use("db")}catch(e){}
 try{S.mcp=await use("mcp")}catch(e){}
 try{S.perm=await use("permissions")}catch(e){}
 if(S.user){try{const me=await S.user.me();S.uid=me.id||"";S.name=me.name||""}catch(e){}
  try{S.admin=!!(await S.user.canEdit())}catch(e){}
  try{const w=await S.user.can("data.write");if(w===false)S.noWrite=true}catch(e){}}
 if(!S.uid){S.uid=lsGet("mla_uid")||("loc-"+Math.random().toString(36).slice(2,10));lsSet("mla_uid",S.uid)}
 if(S.admin){S.vf="e";return enter()}
 S.acc=await readAccess();
 if(S.acc&&S.acc.ok===false)return blocked();
 let st="prompt";try{if(S.perm)st=await S.perm.state("mcp")}catch(e){}
 if(st==="granted"){try{await tryHubspot();return enter()}catch(e){}}
 if(S.acc&&S.acc.ok===true){S.email=S.acc.em||"";S.vf="a";return enter()}
 return authGate()}
function gateView(msg,extra){
 const m=$("#main");$("#bar").hidden=true;$("#foot").hidden=true;m.className="";m.replaceChildren(
  el("div",{class:"gate"},el("div",{class:"gate-in"},el("img",{src:LOGO_URI,alt:"MarketLogic"}),el("span",{class:"kick"},"Sales Learning Path"),el("h1",null,"Academia MarketLogic"),el("p",null,msg),extra)))}
function blocked(){gateView("Tu acceso a esta academia está suspendido. Escribe al equipo de Marketing si crees que es un error.",el("div",null,el("p",{class:"err"},"Acceso restringido."),isPwa()?el("button",{class:"btn ghost",style:"margin-top:14px",on:{click:()=>window.claude.auth.signOut()}},"Salir"):null))}
async function authGate(note){
 let req=null;
 if(S.db){try{const sn=await S.db.doc("requests/"+S.uid).get();if(sn.exists)req=sn.data()}catch(e){}}
 const er=el("div",{class:"err",role:"alert"},note||"");
 const box=el("div",null);
 if(S.mcp){
  const b=el("button",{class:"btn",on:{click:async()=>{
   b.disabled=true;b.textContent="Verificando...";er.textContent="";
   try{await tryHubspot();enter()}
   catch(e){b.disabled=false;b.textContent="Verificar con HubSpot";
    er.textContent=e&&e.code==="not_corporate"?"Esa cuenta de HubSpot"+(e.email?" ("+e.email+")":"")+" no es de MarketLogic.":e&&e.code==="declined"||e&&e.code==="not_granted"||e&&e.code==="consent_declined"?"No autorizaste la verificación. Puedes pedir acceso con tu correo.":"No se pudo verificar con HubSpot. Pide acceso con tu correo."}}}},"Verificar con HubSpot");
  box.appendChild(el("div",{class:"fld"},el("label",null,"Opción 1 · Automática"),el("p",{style:"margin-bottom:12px"},"Confirmamos tu correo corporativo con tu cuenta de HubSpot de MarketLogic. Solo leemos tu correo y nombre."),b))}
 const inp=el("input",{class:"inp",type:"email",placeholder:"nombre"+DOMAIN,autocomplete:"email",id:"gEmail",value:req?req.em:""});
 const st=el("p",{style:"margin-top:10px"},req?"Solicitud enviada. Un editor debe aprobarla.":"");
 const send=el("button",{class:"btn ghost",on:{click:async()=>{
  const v=inp.value.trim().toLowerCase();er.textContent="";
  if(!okMail(v)){er.textContent="Usa tu correo corporativo "+DOMAIN;return}
  if(!S.db){er.textContent="No hay base compartida disponible en esta vista.";return}
  try{await S.db.doc("requests/"+S.uid).set({em:v,ts:Date.now(),nm:S.name||""});st.textContent="Solicitud enviada. Un editor debe aprobarla.";recheck.hidden=false}
  catch(e){er.textContent="No pudimos enviar la solicitud. Pide que te compartan la Academia con nivel Contributor."}}}},req?"Reenviar solicitud":"Solicitar acceso");
 const recheck=el("button",{class:"btn ghost",hidden:!req,on:{click:async()=>{
  S.acc=await readAccess();
  if(S.acc&&S.acc.ok===false)return blocked();
  if(S.acc&&S.acc.ok===true){S.email=S.acc.em||"";S.vf="a";return enter()}
  st.textContent="Sigue pendiente de aprobación."}}},"Revisar estado");
 box.appendChild(el("div",{class:"fld"},el("label",{for:"gEmail"},S.mcp?"Opción 2 · Con aprobación de un editor":"Solicita acceso"),inp,el("div",{style:"margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"},send,recheck),st));
 box.appendChild(er);
 gateView("Acceso solo para el equipo de MarketLogic. Verifica tu identidad para entrar.",box)}

async function enter(){
 gateView("Cargando tu avance...");
 let cloud=null,loc=null;
 if(S.db){
  try{const sn=await S.db.doc("learners/"+S.uid).get();if(sn.exists)cloud=sn.data()}
  catch(e){S.syncMsg="Sin lectura de la base ("+((e&&e.code)||"error")+")"}}
 try{const j=lsGet("mla_L_"+S.uid);if(j)loc=JSON.parse(j)}catch(e){}
 const base=newL();
 S.L=cloud&&loc?Object.assign(base,mergeL(cloud,loc)):Object.assign(base,cloud||loc||{});
 if(S.email)S.L.em=S.email;S.L.vf=S.vf||S.L.vf;
 if(S.db){
  try{const c=await S.db.doc("config/blitz").get();if(c.exists)Object.assign(S.cfg.blitz,c.data())}catch(e){}
  try{const v=await S.db.doc("config/videos").get();if(v.exists)S.cfg.videos=v.data()}catch(e){}
  try{const v=await S.db.doc("vals/"+S.uid).get();if(v.exists)S.vals=v.data()}catch(e){}
  try{S.db.collection("pulse").onSnapshot(sn=>{S.pulse=sn.docs.map(d=>Object.assign({id:d.id},d.data()));resolveNames(S.pulse.map(p=>p.id));if(S.view==="app"&&(S.tab==="ruta"||S.tab==="mis"))render()},()=>{})}catch(e){}}
 if(S.noWrite&&S.db)S.warn="Tu acceso no permite guardar en la nube. Pide al editor que te comparta con nivel Contributor. Mientras tanto tu avance queda en este navegador y puedes descargar una copia.";
 if(!S.db)S.warn="Esta vista no tiene base compartida. Tu avance queda en este navegador.";
 $("#bar").hidden=false;$("#foot").hidden=false;
 S.view=L().lv==null?"onboard":"app";
 if(S.view==="onboard")S.ob={i:0,pts:[],fo:null};
 render();
 if(S.db&&!S.noWrite)flush();else setSync("local")}
async function resolveNames(ids){
 if(!S.user||!S.user.profiles)return;
 const need=ids.filter(i=>!(i in S.names));if(!need.length)return;
 try{const ps=await S.user.profiles(need);need.forEach(i=>{S.names[i]=(ps[i]&&ps[i].name)||""});}catch(e){need.forEach(i=>{S.names[i]=""})}
 if(S.view==="app"&&(S.tab==="ruta"||S.tab==="mis"))render()}
const nameOf=id=>S.names[id]||"Colega";

/* ---------- render raíz ---------- */
function go(tab,mod,sub){clearTimeout(timer);S.tab=tab;S.modId=mod||null;S.sub=sub||null;S.sc=0;S.qz=null;S.open=null;render();window.scrollTo(0,0);try{$("#main").focus({preventScroll:true})}catch(e){}}
function render(){
 clearTimeout(timer);
 if(S.view==="boot")return;
 const m=$("#main");m.className="wrapx";
 renderBar();
 if(S.view==="onboard")viewOnboard(m);
 else if(S.tab==="mod")viewModule(m);
 else if(S.tab==="mis")viewMissions(m);
 else if(S.tab==="cert")viewCert(m);
 else if(S.tab==="team")viewTeam(m);
 else viewHome(m);
 if(S.warn&&S.view==="app")m.insertBefore(el("div",{class:"banner",role:"status"},S.warn),m.firstChild)}
function tabBadge(k){
 try{
  if(!S.L||S.L.lv==null)return"";
  if(k==="ruta")return modsDone()+"/"+MODS.length;
  if(k==="mis")return missDone()?String(missDone()):"";
  if(k==="cert"){if(S.L.cert)return"\u2713";const r=certReqs().filter(x=>x.ok).length;return r+"/3"}
 }catch(e){}
 return""}
function renderBar(){
 const t=$("#tabs");t.replaceChildren();
 t.setAttribute("role","navigation");
 if(S.view==="app"){
  const T=[["ruta","Mi ruta","Mi ruta"],["mis","Misiones BLITZ","Misiones"],["cert","Examen y certificado","Certificado"]];
  if(S.admin)T.push(["team","Equipo","Equipo"]);
  T.forEach(([k,n,sh])=>{
   const cur=(S.tab===k||(S.tab==="mod"&&k==="ruta"));
   const bd=tabBadge(k);
   const b=el("button",{"aria-current":cur?"page":null,"data-k":k,"aria-label":n,on:{click:()=>go(k)}},el("span",{class:"lg"},n),el("span",{class:"sm","aria-hidden":"true"},sh));
   if(bd)b.appendChild(el("i",{class:"tb"+(bd==="\u2713"?" ok":"")},bd));
   t.appendChild(b)});
  t.onkeydown=e=>{
   const bs=[...t.querySelectorAll("button")],i=bs.indexOf(document.activeElement);
   if(i<0)return;
   let j=null;
   if(e.key==="ArrowRight")j=(i+1)%bs.length;
   else if(e.key==="ArrowLeft")j=(i-1+bs.length)%bs.length;
   else if(e.key==="Home")j=0;
   else if(e.key==="End")j=bs.length-1;
   if(j!==null){e.preventDefault();bs[j].focus()}};
  const c=t.querySelector('[aria-current="page"]');
  if(c&&c.scrollIntoView)try{c.scrollIntoView({block:"nearest",inline:"center"})}catch(e){}}
 const w=$("#who");w.replaceChildren();
 if(S.L){w.appendChild(el("b",{title:S.email},S.name||S.email||"Invitado"));
  if(S.L.lv!=null)w.appendChild(el("span",{class:"pill or"},LEV[S.L.lv]));
  w.appendChild(el("span",{id:"sync",class:"pill"}));setSync(S.sync||"local");
  if(isPwa()){
   if(window.claude.install&&window.claude.install.can())w.appendChild(el("button",{class:"btn ghost sm bar-b",on:{click:()=>window.claude.install.prompt()}},"Instalar app"));
   w.appendChild(el("button",{class:"btn ghost sm bar-b",on:{click:()=>window.claude.auth.signOut()}},"Salir"))}}
}
$("#goHome").addEventListener("click",()=>{if(S.view==="app")go("ruta")});
