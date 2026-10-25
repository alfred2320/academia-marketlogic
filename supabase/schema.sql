-- Academia MarketLogic: esquema de Supabase
-- Pégalo completo en Supabase > SQL Editor > New query > Run.
-- Es seguro correrlo más de una vez.

-- 1. Administradores (editores). Agrega aquí a quienes ven el panel de equipo.
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

-- 2. Perfiles: nombre visible para el ranking. Lo llena un trigger al iniciar sesión.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  updated_at timestamptz not null default now()
);

-- 3. Documentos: avance, ranking, validaciones, accesos y configuración.
--    path = "coleccion/id", por ejemplo learners/<uuid>, pulse/<uuid>, config/videos
create table if not exists public.docs (
  path text primary key check (path ~ '^[a-z]+/[A-Za-z0-9_.@-]+$'),
  coll text generated always as (split_part(path, '/', 1)) stored,
  id   text generated always as (substr(path, strpos(path, '/') + 1)) stored,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 400000),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create index if not exists docs_coll_idx on public.docs (coll);

-- 4. Funciones de apoyo para las reglas de acceso
create or replace function public.jwt_email() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.email = public.jwt_email())
$$;

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select public.jwt_email() like '%@mymarketlogic.com' or public.is_admin()
$$;

create or replace function public.is_blocked() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.docs d
    where d.path = 'access/' || auth.uid()::text and (d.data ->> 'ok') = 'false'
  )
$$;

-- 5. Seguridad a nivel de fila
alter table public.docs enable row level security;
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
revoke all on public.docs, public.profiles, public.admins from anon;

drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to authenticated using (
  public.is_admin()
  or (
    public.is_member() and (
      -- su propio acceso siempre se puede leer, incluso si está bloqueado
      (coll = 'access' and id = auth.uid()::text)
      or (not public.is_blocked() and (
        coll in ('pulse', 'config')
        or (coll in ('learners', 'vals', 'requests') and id = auth.uid()::text)
      ))
    )
  )
);

drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  public.is_admin()
  or (
    public.is_member() and not public.is_blocked()
    and coll in ('learners', 'pulse', 'requests') and id = auth.uid()::text
  )
);

drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated
using (
  public.is_admin()
  or (
    public.is_member() and not public.is_blocked()
    and coll in ('learners', 'pulse', 'requests') and id = auth.uid()::text
  )
)
with check (
  public.is_admin()
  or (
    public.is_member() and not public.is_blocked()
    and coll in ('learners', 'pulse', 'requests') and id = auth.uid()::text
  )
);

drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated using (
  public.is_admin()
);

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (public.is_member());

drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins for select to authenticated using (public.is_admin());

-- 6. Solo cuentas @mymarketlogic.com (o administradores listados) pueden crear usuario
create or replace function public.guard_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(new.email, '')) not like '%@mymarketlogic.com'
     and not exists (select 1 from public.admins a where a.email = lower(coalesce(new.email, ''))) then
    raise exception 'Solo cuentas @mymarketlogic.com';
  end if;
  return new;
end $$;

drop trigger if exists guard_signup on auth.users;
create trigger guard_signup before insert on auth.users
  for each row execute function public.guard_signup();

-- 7. Perfil automático con el nombre de Google
create or replace function public.sync_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, updated_at)
  values (
    new.id, lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    now()
  )
  on conflict (id) do update
    set email = excluded.email, name = excluded.name, updated_at = now();
  return new;
end $$;

drop trigger if exists sync_profile on auth.users;
create trigger sync_profile after insert or update on auth.users
  for each row execute function public.sync_profile();

-- 8. Cambios en vivo para el ranking (opcional, la app también refresca sola)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

-- 9. SIGUIENTE PASO MANUAL: registra a los editores con su correo de trabajo
--    insert into public.admins (email) values ('tu.nombre@mymarketlogic.com');
