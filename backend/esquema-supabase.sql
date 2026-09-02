-- ⚠️  OBSOLETO — NO LO EJECUTES. Conservado solo como registro.
--
-- Este archivo describe el primer intento de multi-tenancy: `tenants`, `profiles` y
-- `business_config` en el esquema `public`. La arquitectura que quedó en `main` el
-- 2026-09-02 es otra: **un esquema de Postgres por aplicación**.
--
--   `public`     solo lo compartido: la tabla `tenants` y la función `auth_tenant_id()`
--   `labrador`   las 18 tablas de Papas El Labrador
--   `palmas`     las 19 tablas de Las dos palmas
--
-- El SQL que SÍ se corre vive en el repo de cada aplicación, en su
-- `docs/esquema-supabase.sql`. El paso a paso está en `docs/PUESTA-EN-MARCHA-SUPABASE.md`.
--
-- Correr este archivo hoy recrearía justo las tablas que `backend/0-limpiar-public.sql`
-- borra, y el esquema nuevo fallaría: hace `create table public.tenants` SIN
-- `if not exists`.
--
-- ---------------------------------------------------------------------------------
--
-- Schema multitenant para Nexora / portal del cliente
-- Ejecutar en el proyecto Supabase del negocio.

create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  nombre text not null default '',
  rol text not null default 'admin' check (rol in ('admin', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists public.business_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);
create index if not exists idx_profiles_email on public.profiles(email);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_tenants on public.tenants;
create trigger set_updated_at_tenants
before update on public.tenants
for each row
execute function public.update_updated_at();

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row
execute function public.update_updated_at();

drop trigger if exists set_updated_at_business_config on public.business_config;
create trigger set_updated_at_business_config
before update on public.business_config
for each row
execute function public.update_updated_at();

-- Policy básico para el portal: el usuario solo puede ver el tenant al que pertenece.
-- Se activa con la autenticación real; aquí dejamos el esquema y los datos base.

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.business_config enable row level security;

drop policy if exists "tenants_select_for_authenticated_users" on public.tenants;
create policy "tenants_select_for_authenticated_users"
on public.tenants
for select
to authenticated
using (true);

drop policy if exists "profiles_select_for_authenticated_users" on public.profiles;
create policy "profiles_select_for_authenticated_users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "business_config_select_for_authenticated_users" on public.business_config;
create policy "business_config_select_for_authenticated_users"
on public.business_config
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_for_authenticated_users" on public.profiles;
create policy "profiles_insert_for_authenticated_users"
on public.profiles
for insert
to authenticated
with check (true);

drop policy if exists "profiles_update_for_authenticated_users" on public.profiles;
create policy "profiles_update_for_authenticated_users"
on public.profiles
for update
to authenticated
using (true)
with check (true);

-- Tenant base de ejemplo para usar como guía.
-- Reemplazar con el tenant real del negocio al momento de la puesta en marcha.
insert into public.tenants (slug, nombre)
values ('demo-tenant', 'Demo Tenant')
on conflict (slug) do nothing;
