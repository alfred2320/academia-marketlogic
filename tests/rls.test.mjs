// Prueba de las reglas de seguridad (RLS) de supabase/schema.sql usando Postgres en WASM (PGlite).
// Uso: npm i @electric-sql/pglite && node tests/rls.test.mjs
import {PGlite} from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const dir=path.dirname(fileURLToPath(import.meta.url));
const schema=fs.readFileSync(path.join(dir,"../supabase/schema.sql"),"utf8");
const db=new PGlite();
let pass=0,fail=0;
const ok=(c,m)=>{if(c){pass++;console.log("PASS",m)}else{fail++;console.log("FAIL",m)}};

// Simulación mínima del esquema auth de Supabase
await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
create publication supabase_realtime;
grant usage on schema public, auth to anon, authenticated;
`);
await db.exec(schema);
await db.exec(`grant select,insert,update,delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;`);
await db.exec(schema); // idempotente

const A="11111111-1111-1111-1111-111111111111",B="22222222-2222-2222-2222-222222222222",ADM="33333333-3333-3333-3333-333333333333";
await db.exec(`insert into public.admins values ('jefa@mymarketlogic.com')`);
await db.exec(`insert into auth.users(id,email,raw_user_meta_data) values
 ('${A}','ana@mymarketlogic.com','{"full_name":"Ana Pérez"}'),
 ('${B}','beto@mymarketlogic.com','{"name":"Beto"}'),
 ('${ADM}','jefa@mymarketlogic.com','{}')`);

async function as(sub,email,sql){
  await db.exec(`set role authenticated; select set_config('request.jwt.claims','${JSON.stringify({sub,email})}',false);`);
  try{const r=await db.query(sql);return{rows:r.rows}}
  catch(e){return{err:e.message}}
  finally{await db.exec("reset role")}}

// registro
let r=await db.query("select count(*)::int n from public.profiles");
ok(r.rows[0].n===3,"el trigger crea perfiles");
let blockedSignup=false;
try{await db.exec("insert into auth.users(email) values ('intruso@gmail.com')")}catch(e){blockedSignup=/Solo cuentas/.test(e.message)}
ok(blockedSignup,"no se pueden crear cuentas fuera del dominio");
let adminGmail=true;
await db.exec("insert into public.admins values ('editor@gmail.com')");
try{await db.exec("insert into auth.users(email) values ('editor@gmail.com')")}catch(e){adminGmail=false}
ok(adminGmail,"un admin listado puede registrarse aunque no sea del dominio");

// aprendiz
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('learners/${A}','{"xp":10}')`);
ok(!r.err,"Ana guarda su avance");
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('learners/${B}','{"xp":999}')`);
ok(!!r.err,"Ana no escribe el avance de otra persona");
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('pulse/${A}','{"xp":10}')`);
ok(!r.err,"Ana publica su pulso");
await as(B,"beto@mymarketlogic.com",`insert into public.docs(path,data) values ('learners/${B}','{"xp":5}')`);
await as(B,"beto@mymarketlogic.com",`insert into public.docs(path,data) values ('pulse/${B}','{"xp":5}')`);
r=await as(A,"ana@mymarketlogic.com",`select path from public.docs order by path`);
ok(r.rows.map(x=>x.path).join()===`learners/${A},pulse/${A},pulse/${B}`,"Ana ve su avance y el ranking, no el avance de Beto");
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('config/videos','{"1_1":{"u":"x"}}')`);
ok(!!r.err,"Ana no edita la configuración");
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('access/${A}','{"ok":true}')`);
ok(!!r.err,"Ana no se autoriza a sí misma");
r=await as(A,"ana@mymarketlogic.com",`insert into public.docs(path,data) values ('vals/${A}','{"m":1}')`);
ok(!!r.err,"Ana no se valida a sí misma");
r=await as(A,"ana@mymarketlogic.com",`update public.docs set data='{"xp":50}' where path='learners/${A}'`);
r=await as(A,"ana@mymarketlogic.com",`select data->>'xp' xp from public.docs where path='learners/${A}'`);
ok(r.rows[0]&&r.rows[0].xp==="50","Ana actualiza su avance");
r=await as(A,"ana@mymarketlogic.com",`delete from public.docs where path='learners/${A}'`);
r=await as(A,"ana@mymarketlogic.com",`select 1 from public.docs where path='learners/${A}'`);
ok(r.rows.length===1,"Ana no puede borrar documentos");

// gmail sin ser admin
r=await as("44444444-4444-4444-4444-444444444444","externo@gmail.com",`select * from public.docs`);
ok(r.rows&&r.rows.length===0,"una cuenta externa no ve nada");
r=await as("44444444-4444-4444-4444-444444444444","externo@gmail.com",`insert into public.docs(path,data) values ('learners/44444444-4444-4444-4444-444444444444','{}')`);
ok(!!r.err,"una cuenta externa no escribe");
r=await as("44444444-4444-4444-4444-444444444444","externo@gmail.com",`select * from public.profiles`);
ok(r.rows&&r.rows.length===0,"una cuenta externa no ve perfiles");

// admin
r=await as(ADM,"jefa@mymarketlogic.com",`select count(*)::int n from public.docs`);
ok(r.rows[0].n===4,"la admin ve todo");
r=await as(ADM,"jefa@mymarketlogic.com",`insert into public.docs(path,data) values ('config/videos','{"1_1":{"u":"https://youtu.be/abc","k":"y"}}')`);
ok(!r.err,"la admin guarda configuración");
r=await as(ADM,"jefa@mymarketlogic.com",`insert into public.docs(path,data) values ('vals/${A}','{"m1":1}')`);
ok(!r.err,"la admin valida misiones");
r=await as(A,"ana@mymarketlogic.com",`select path from public.docs where path in ('vals/${A}','config/videos') order by path`);
ok(r.rows.length===2,"Ana lee su validación y la configuración");
r=await as(ADM,"jefa@mymarketlogic.com",`select public.is_admin() a`);
ok(r.rows[0].a===true,"is_admin es true para la admin");
r=await as(A,"ana@mymarketlogic.com",`select public.is_admin() a`);
ok(r.rows[0].a===false,"is_admin es false para Ana");

// bloqueo
await as(ADM,"jefa@mymarketlogic.com",`insert into public.docs(path,data) values ('access/${A}','{"ok":false,"em":"ana@mymarketlogic.com"}')`);
r=await as(A,"ana@mymarketlogic.com",`update public.docs set data='{"xp":9999}' where path='learners/${A}'`);
r=await as(ADM,"jefa@mymarketlogic.com",`select data->>'xp' xp from public.docs where path='learners/${A}'`);
ok(r.rows[0].xp==="50","una persona bloqueada ya no puede guardar");
r=await as(A,"ana@mymarketlogic.com",`select path from public.docs`);
ok(r.rows.length===1&&r.rows[0].path===`access/${A}`,"una persona bloqueada solo ve su estado de acceso");
await as(ADM,"jefa@mymarketlogic.com",`update public.docs set data='{"ok":true}' where path='access/${A}'`);
r=await as(A,"ana@mymarketlogic.com",`update public.docs set data='{"xp":60}' where path='learners/${A}'`);
r=await as(ADM,"jefa@mymarketlogic.com",`select data->>'xp' xp from public.docs where path='learners/${A}'`);
ok(r.rows[0].xp==="60","al reactivar vuelve a guardar");

// formato de path
r=await db.query("select 1").then(()=>null);
let badPath=false;try{await db.exec("insert into public.docs(path) values ('sin-barra')")}catch(e){badPath=true}
ok(badPath,"rechaza rutas mal formadas");
console.log(`\n${pass} PASS, ${fail} FAIL`);process.exit(fail?1:0);
