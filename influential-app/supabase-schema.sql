-- ============================================================
-- INFLUENTIAL – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 0. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES  (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('marca', 'influencer', 'creator')),
  name        text not null default '',
  handle      text unique,
  email       text not null,
  location    text default '',
  bio         text default '',
  photo_url   text default '',
  banner_idx  int default 0,
  instagram   text default '',
  tiktok      text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, name)
  values (
    new.id,
    new.email,
    case when new.email like '%@marca%' then 'marca' else 'influencer' end,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. INFLUENCERS
-- ============================================================
create table public.influencers (
  id              serial primary key,
  profile_id      uuid references public.profiles(id) on delete set null,
  handle          text not null,
  name            text default '',
  location        text default '',
  rating          numeric(2,1) default 0,
  description     text default '',
  photo_url       text default '',
  instagram       text default '',
  tiktok          text default '',
  followers_num   int default 0,
  engagement_num  numeric(4,1) default 0,
  created_at      timestamptz default now()
);

alter table public.influencers enable row level security;
create policy "Influencers are viewable by everyone"
  on public.influencers for select using (true);
create policy "Admins can manage influencers"
  on public.influencers for all using (true);

-- ============================================================
-- 3. INFLUENCER CATEGORIES  (many-to-many)
-- ============================================================
create table public.influencer_categories (
  influencer_id int references public.influencers(id) on delete cascade,
  category      text not null,
  primary key (influencer_id, category)
);

alter table public.influencer_categories enable row level security;
create policy "Influencer categories viewable by everyone"
  on public.influencer_categories for select using (true);
create policy "Admins can manage influencer categories"
  on public.influencer_categories for all using (true);

-- ============================================================
-- 4. CREATORS (UGC)
-- ============================================================
create table public.creators (
  id                  serial primary key,
  profile_id          uuid references public.profiles(id) on delete set null,
  handle              text not null,
  name                text default '',
  location            text default '',
  rating              numeric(2,1) default 0,
  description         text default '',
  photo_url           text default '',
  price_min           int default 0,
  price_max           int default 0,
  delivery_min        int default 1,
  delivery_max        int default 7,
  completed_projects  int default 0,
  created_at          timestamptz default now()
);

alter table public.creators enable row level security;
create policy "Creators are viewable by everyone"
  on public.creators for select using (true);
create policy "Admins can manage creators"
  on public.creators for all using (true);

-- ============================================================
-- 5. CREATOR SPECIALTIES & CONTENT TYPES
-- ============================================================
create table public.creator_specialties (
  creator_id  int references public.creators(id) on delete cascade,
  specialty   text not null,
  primary key (creator_id, specialty)
);

alter table public.creator_specialties enable row level security;
create policy "Creator specialties viewable by everyone"
  on public.creator_specialties for select using (true);
create policy "Admins can manage creator specialties"
  on public.creator_specialties for all using (true);

create table public.creator_content_types (
  creator_id    int references public.creators(id) on delete cascade,
  content_type  text not null,
  primary key (creator_id, content_type)
);

alter table public.creator_content_types enable row level security;
create policy "Creator content types viewable by everyone"
  on public.creator_content_types for select using (true);
create policy "Admins can manage creator content types"
  on public.creator_content_types for all using (true);

-- ============================================================
-- 6. BRANDS
-- ============================================================
create table public.brands (
  id          serial primary key,
  profile_id  uuid references public.profiles(id) on delete set null,
  handle      text not null,
  name        text default '',
  location    text default '',
  description text default '',
  logo_url    text default '',
  instagram   text default '',
  tiktok      text default '',
  created_at  timestamptz default now()
);

alter table public.brands enable row level security;
create policy "Brands are viewable by everyone"
  on public.brands for select using (true);
create policy "Admins can manage brands"
  on public.brands for all using (true);

-- ============================================================
-- 7. BRAND CATEGORIES
-- ============================================================
create table public.brand_categories (
  brand_id  int references public.brands(id) on delete cascade,
  category  text not null,
  primary key (brand_id, category)
);

alter table public.brand_categories enable row level security;
create policy "Brand categories viewable by everyone"
  on public.brand_categories for select using (true);
create policy "Admins can manage brand categories"
  on public.brand_categories for all using (true);

-- ============================================================
-- 8. BRAND POSTS (campaigns / opportunities)
-- ============================================================
create table public.brand_posts (
  id          serial primary key,
  brand_id    int references public.brands(id) on delete cascade,
  image_url   text default '',
  title       text not null,
  category    text default '',
  description text default '',
  created_at  timestamptz default now()
);

alter table public.brand_posts enable row level security;
create policy "Brand posts viewable by everyone"
  on public.brand_posts for select using (true);
create policy "Admins can manage brand posts"
  on public.brand_posts for all using (true);

-- ============================================================
-- 9. CONVERSATIONS & MESSAGES  (real-time chat)
-- ============================================================
create table public.conversations (
  id            serial primary key,
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (participant_a, participant_b)
);

alter table public.conversations enable row level security;
create policy "Users see own conversations"
  on public.conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);
create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create table public.messages (
  id              serial primary key,
  conversation_id int not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  text            text not null,
  created_at      timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users see messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
create policy "Users can send messages in own conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- Auto-update conversation.updated_at on new message
create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();

-- ============================================================
-- 10. ENABLE REALTIME on messages
-- ============================================================
alter publication supabase_realtime add table public.messages;

-- ============================================================
-- 11. STORAGE BUCKET for profile photos / banners
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Auth users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 12. SEED DATA  (the 6 influencers, 6 creators, 6 brands)
-- ============================================================

-- Influencers
insert into public.influencers (id, handle, name, location, rating, description, photo_url, instagram, tiktok, followers_num, engagement_num) values
  (1, '@santoslopez',    'Santos Lopez',       'Buenos Aires, Arg', 4.8, 'Amante de los autos con pasión por la velocidad y estilo.',           '', '22K', '22K', 22000, 7.2),
  (2, '@camilarodriguez', 'Camila Rodríguez',  'Córdoba, Arg',      4.5, 'Moda y estilo urbano con un toque de creatividad.',                   '', '35K', '18K', 35000, 5.8),
  (3, '@matiasperez',    'Matías González',    'Rosario, Arg',      4.2, 'Tech reviewer y fanático de los gadgets.',                            '', '15K', '28K', 28000, 8.5),
  (4, '@valentinalopez', 'Valentina López',    'Mendoza, Arg',      4.9, 'Lifestyle, viajes y bienestar personal.',                             '', '50K', '42K', 50000, 6.1),
  (5, '@nicolasmartinez','Nicolás Martínez',   'CABA, Arg',         4.0, 'Deportes extremos y aventura al aire libre.',                         '', '12K', '9K',  12000, 9.3),
  (6, '@sofiagomez',     'Sofía Gómez',        'La Plata, Arg',     4.7, 'Gastronomía, recetas saludables y vida fit.',                         '', '28K', '33K', 33000, 7.8);

insert into public.influencer_categories (influencer_id, category) values
  (1, 'Autos'), (1, 'Lifestyle'), (1, 'Deportes'),
  (2, 'Moda'), (2, 'Lifestyle'), (2, 'Belleza'),
  (3, 'Tecnología'), (3, 'Gaming'), (3, 'Lifestyle'),
  (4, 'Lifestyle'), (4, 'Viajes'), (4, 'Bienestar'),
  (5, 'Deportes'), (5, 'Aventura'), (5, 'Fitness'),
  (6, 'Gastronomía'), (6, 'Salud'), (6, 'Fitness');

-- Creators (UGC)
insert into public.creators (id, handle, name, location, rating, description, photo_url, price_min, price_max, delivery_min, delivery_max, completed_projects) values
  (1, '@lucas_crea',     'Lucas Fernández',    'Buenos Aires, Arg', 4.7, 'Contenido UGC de producto con estética minimalista.',          '', 15000, 50000,  3, 5,  48),
  (2, '@mariabelen_ugc', 'María Belén Ruiz',   'Córdoba, Arg',      4.9, 'Especialista en contenido gastronómico y lifestyle.',          '', 20000, 70000,  2, 4,  72),
  (3, '@tomiugc',        'Tomás Herrera',       'Rosario, Arg',      4.3, 'Videos dinámicos para marcas de tecnología y gaming.',         '', 10000, 35000,  4, 7,  31),
  (4, '@julieta.content','Julieta Navarro',     'Mendoza, Arg',      4.6, 'UGC de moda, belleza y cuidado personal.',                    '', 25000, 80000,  3, 6,  55),
  (5, '@fede_creates',   'Federico Sosa',       'CABA, Arg',         4.1, 'Contenido deportivo y fitness con energía.',                   '', 12000, 40000,  2, 5,  39),
  (6, '@caro.ugc',       'Carolina Méndez',     'La Plata, Arg',     4.8, 'Creadora de contenido para marcas de hogar y decoración.',     '', 18000, 60000,  5, 10, 63);

insert into public.creator_specialties (creator_id, specialty) values
  (1, 'Producto'), (1, 'Lifestyle'), (1, 'Gastronomía'),
  (2, 'Gastronomía'), (2, 'Lifestyle'), (2, 'Bienestar'),
  (3, 'Tecnología'), (3, 'Gaming'), (3, 'Unboxing'),
  (4, 'Moda'), (4, 'Belleza'), (4, 'Skincare'),
  (5, 'Deportes'), (5, 'Fitness'), (5, 'Outdoor'),
  (6, 'Hogar'), (6, 'Decoración'), (6, 'Lifestyle');

insert into public.creator_content_types (creator_id, content_type) values
  (1, 'Video'), (1, 'Foto'), (1, 'Reel'),
  (2, 'Video'), (2, 'Foto'), (2, 'Story'),
  (3, 'Video'), (3, 'Reel'), (3, 'Short'),
  (4, 'Video'), (4, 'Foto'), (4, 'Reel'),
  (5, 'Video'), (5, 'Reel'), (5, 'Short'),
  (6, 'Video'), (6, 'Foto'), (6, 'Story');

-- Brands
insert into public.brands (id, handle, name, location, description, logo_url, instagram, tiktok) values
  (1, '@volvocars',    'VolvoCars',      'Suecia / CABA',      'Innovación y seguridad en cada vehículo.',                    '', '22K', '22K'),
  (2, '@audiofficial', 'Audi',           'Alemania / CABA',    'Diseño, tecnología y performance de vanguardia.',             '', '35K', '18K'),
  (3, '@fordarg',      'Ford Argentina', 'CABA, Arg',          'Fuerza y tradición en cada camino.',                          '', '15K', '28K'),
  (4, '@toyotaarg',    'Toyota',         'CABA, Arg',          'Calidad, durabilidad y confianza.',                           '', '50K', '42K'),
  (5, '@jeep',         'Jeep',           'CABA, Arg',          'Aventura y libertad sin límites.',                            '', '12K', '9K'),
  (6, '@mercedesbenz', 'Mercedes-Benz',  'Alemania / CABA',    'Lujo, innovación y tradición desde 1886.',                    '', '28K', '33K');

insert into public.brand_categories (brand_id, category) values
  (1, 'Autos'), (1, 'Lifestyle'), (1, 'Deportes'),
  (2, 'Autos'), (2, 'Lifestyle'), (2, 'Tecnología'),
  (3, 'Autos'), (3, 'Deportes'), (3, 'Aventura'),
  (4, 'Autos'), (4, 'Lifestyle'), (4, 'Familia'),
  (5, 'Autos'), (5, 'Aventura'), (5, 'Deportes'),
  (6, 'Autos'), (6, 'Lujo'), (6, 'Lifestyle');

-- Reset sequences
select setval('public.influencers_id_seq', 6);
select setval('public.creators_id_seq', 6);
select setval('public.brands_id_seq', 6);
