/* Plataforma PWA de la Academia MarketLogic.
   Expone la misma interfaz que usaba la app dentro de claude.ai (window.claude.use),
   pero respaldada por Supabase (datos y login con Google). La app no cambia. */
(function(){
"use strict";
const CFG=window.MLA_CONFIG||{};
const DOMAIN=(CFG.domain||"mymarketlogic.com").toLowerCase();
const POLL_MS=45000;
const cfgOk=!!(CFG.supabaseUrl&&CFG.supabaseAnonKey&&!/TU-PROYECTO|PEGA_AQUI/.test(CFG.supabaseUrl+CFG.supabaseAnonKey));
let sb=null,session=null;
if(cfgOk&&window.supabase){
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"pkce"}});
}

/* ---- errores con los mismos códigos que espera la app ---- */
function mkErr(e){
  const raw=(e&&(e.code||e.status))||"";
  let code="error";
  if(String(raw)==="42501"||/row-level security|permission denied/i.test((e&&e.message)||""))code="permission_denied";
  else if(String(raw)==="PGRST301"||String(raw)==="401"||/jwt/i.test((e&&e.message)||""))code="unauthorized";
  else if(/fetch|network|failed/i.test((e&&e.message)||""))code="network";
  const x=new Error((e&&e.message)||"error");x.code=code;x.detail=e;return x}

/* ---- autenticación ---- */
function urlError(){
  try{
    const q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.replace(/^#/,""));
    const d=q.get("error_description")||h.get("error_description");
    if(!d)return"";
    history.replaceState(null,"",location.pathname);
    return /mymarketlogic|Database error/i.test(d)?"Esa cuenta no pertenece a MarketLogic. Usa tu correo @"+DOMAIN+".":"No se pudo completar el acceso: "+d}
  catch(e){return""}}
const auth={
  async ready(){
    if(!sb)return null;
    const r=await sb.auth.getSession();session=r.data.session||null;
    sb.auth.onAuthStateChange((_ev,s)=>{session=s||null});
    return session},
  async signIn(){
    if(!sb)throw new Error("sin configuración");
    const r=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname,queryParams:{hd:DOMAIN,prompt:"select_account"}}});
    if(r.error)throw r.error},
  async signOut(stay){
    try{if(sb)await sb.auth.signOut()}catch(e){}
    try{Object.keys(localStorage).filter(k=>/^sb-/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}
    if(!stay)location.reload()},
  urlError};
const uid=()=>session&&session.user?session.user.id:null;

/* ---- base de datos: API tipo documento sobre la tabla public.docs ---- */
const T="docs";
const ci=p=>{const i=p.indexOf("/");return{coll:p.slice(0,i),id:p.slice(i+1)}};
const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
function mkSnap(path,row){return{exists:!!row,id:ci(path).id,data:()=>row?clone(row.data):undefined}}
function docRef(path){
  const {id}=ci(path);
  const ref={id,path,
    async get(){
      const r=await sb.from(T).select("path,data").eq("path",path).maybeSingle();
      if(r.error)throw mkErr(r.error);
      return mkSnap(path,r.data)},
    async set(d){
      const r=await sb.from(T).upsert({path,data:clone(d),updated_at:new Date().toISOString()},{onConflict:"path"});
      if(r.error)throw mkErr(r.error)},
    async update(d){
      const cur=await ref.get();
      await ref.set(Object.assign({},cur.exists?cur.data():{},clone(d)))},
    async delete(){
      const r=await sb.from(T).delete().eq("path",path);
      if(r.error)throw mkErr(r.error)},
    onSnapshot(cb,errCb){
      let alive=true;
      const run=async()=>{try{const s=await ref.get();if(alive)cb(s)}catch(e){if(errCb)errCb(e)}};
      run();
      const t=setInterval(run,POLL_MS);
      return()=>{alive=false;clearInterval(t)}}};
  return ref}
function collRef(coll){
  const fetchAll=async()=>{
    const r=await sb.from(T).select("path,data").eq("coll",coll).limit(5000);
    if(r.error)throw mkErr(r.error);
    return{docs:r.data.map(x=>({id:ci(x.path).id,data:()=>clone(x.data)}))}};
  return{
    async get(){return fetchAll()},
    doc:id=>docRef(coll+"/"+id),
    onSnapshot(cb,errCb){
      let alive=true,ch=null;
      const run=async()=>{try{const s=await fetchAll();if(alive)cb(s)}catch(e){if(errCb)errCb(e)}};
      run();
      const t=setInterval(run,POLL_MS);
      try{
        ch=sb.channel("docs-"+coll+"-"+Math.random().toString(36).slice(2,7))
          .on("postgres_changes",{event:"*",schema:"public",table:T,filter:"coll=eq."+coll},()=>{run()})
          .subscribe()}catch(e){}
      return()=>{alive=false;clearInterval(t);try{if(ch)sb.removeChannel(ch)}catch(e){}}}}}
const db={doc:docRef,collection:collRef};

/* ---- usuario ---- */
const nameFromEmail=e=>String(e||"").split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase());
let adminP=null;
const user={
  async me(){
    const u=session&&session.user;if(!u)throw new Error("sin sesión");
    const m=u.user_metadata||{};
    return{id:u.id,email:String(u.email||"").toLowerCase(),name:m.full_name||m.name||nameFromEmail(u.email)}},
  async id(){return uid()},
  async canEdit(){
    if(!adminP)adminP=sb.rpc("is_admin").then(r=>!!(r&&r.data===true)).catch(()=>false);
    return adminP},
  async isOwner(){return user.canEdit()},
  async can(){return null},
  async profiles(ids){
    const out={};
    if(!ids||!ids.length)return out;
    const r=await sb.from("profiles").select("id,name,email").in("id",ids);
    if(r.error)throw mkErr(r.error);
    (r.data||[]).forEach(p=>{out[p.id]={name:p.name||nameFromEmail(p.email)}});
    return out}};

/* ---- descargas ---- */
const downloads={async save({filename,data}){
  const blob=data instanceof Blob?data:new Blob([data],{type:/\.csv$/i.test(filename)?"text/csv;charset=utf-8":"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}};

/* ---- instalación de la PWA ---- */
let deferred=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;window.dispatchEvent(new Event("mla:installable"))});
window.addEventListener("appinstalled",()=>{deferred=null});
const install={
  can:()=>!!deferred,
  async prompt(){if(!deferred)return;deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null}};

/* ---- API pública, misma forma que window.claude ---- */
const caps={user,db,downloads};
window.claude={
  __pwa:true,cfgOk,auth,install,
  async use(name){return cfgOk?(caps[name]||null):null}};

/* ---- service worker y aviso de nueva versión ---- */
if("serviceWorker" in navigator&&location.protocol!=="file:"){
  window.addEventListener("load",()=>{
    const had=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").catch(()=>{});
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(!had)return;
      const b=document.createElement("button");
      b.textContent="Hay una versión nueva. Toca para actualizar";
      b.setAttribute("style","position:fixed;left:50%;transform:translateX(-50%);bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:99;background:#171B26;color:#fff;border:0;border-radius:34px;padding:12px 22px;font:600 14px 'Open Sans',system-ui,sans-serif;cursor:pointer");
      b.onclick=()=>location.reload();document.body.appendChild(b)})})}
})();
