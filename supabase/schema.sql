-- Пиксельное портфолио: выполнить в Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, icon_file text not null, sort_order integer not null default 0
);
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete cascade, title text not null, description text not null default '', created_at timestamptz not null default now(), sort_order integer not null default 0
);
create table if not exists public.work_images (
  id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade, storage_path text not null, sort_order integer not null default 0
);
create table if not exists public.phrases (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete cascade, icon_slug text, text text not null, created_at timestamptz not null default now(), check (category_id is not null or icon_slug is not null)
);
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(), label text not null, value text not null, href text, sort_order integer not null default 0
);
create table if not exists public.settings (
  key text primary key, value jsonb not null default '{}'::jsonb
);

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.works enable row level security;
alter table public.work_images enable row level security;
alter table public.phrases enable row level security;
alter table public.contacts enable row level security;
alter table public.settings enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.admin_profiles where user_id = auth.uid()) $$;

do $$ begin
  create policy "public read categories" on public.categories for select using (true);
  create policy "public read works" on public.works for select using (true);
  create policy "public read images" on public.work_images for select using (true);
  create policy "public read phrases" on public.phrases for select using (true);
  create policy "public read contacts" on public.contacts for select using (true);
  create policy "public read menu settings" on public.settings for select using (key = 'menu_positions');
  create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
  create policy "admin manage works" on public.works for all using (public.is_admin()) with check (public.is_admin());
  create policy "admin manage images" on public.work_images for all using (public.is_admin()) with check (public.is_admin());
  create policy "admin manage phrases" on public.phrases for all using (public.is_admin()) with check (public.is_admin());
  create policy "admin manage contacts" on public.contacts for all using (public.is_admin()) with check (public.is_admin());
  create policy "admin manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
exception when duplicate_object then null; end $$;

drop policy if exists "public read menu settings" on public.settings;
create policy "public read menu settings" on public.settings for select using (key = 'menu_positions');

insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict (id) do update set public = true;
do $$ begin
  create policy "public portfolio read" on storage.objects for select using (bucket_id = 'portfolio');
  create policy "admin portfolio upload" on storage.objects for insert with check (bucket_id = 'portfolio' and public.is_admin());
  create policy "admin portfolio update" on storage.objects for update using (bucket_id = 'portfolio' and public.is_admin());
  create policy "admin portfolio delete" on storage.objects for delete using (bucket_id = 'portfolio' and public.is_admin());
exception when duplicate_object then null; end $$;
