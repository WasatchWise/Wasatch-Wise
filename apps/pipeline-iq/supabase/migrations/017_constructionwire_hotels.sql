-- ConstructionWire hotel market data schema

create table if not exists construction_hotels (
  id uuid primary key default gen_random_uuid(),
  cw_hotel_id text unique not null,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  room_count integer,
  rate_low numeric(10, 2),
  rate_high numeric(10, 2),
  opened_date date,
  chain text,
  scale text,
  star_rating integer,
  franchise text,
  cw_created_at date,
  cw_updated_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists construction_contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text,
  role text,
  phone text,
  email text,
  created_at timestamptz default now(),
  unique (name, company, role)
);

create table if not exists construction_hotel_contacts (
  hotel_id uuid references construction_hotels(id) on delete cascade,
  contact_id uuid references construction_contacts(id) on delete cascade,
  role_on_hotel text,
  primary key (hotel_id, contact_id, role_on_hotel)
);

create table if not exists construction_hotel_activities (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references construction_hotels(id) on delete cascade,
  activity_type text,
  activity_date date,
  description text,
  created_at timestamptz default now()
);

create index if not exists idx_construction_hotels_state on construction_hotels(state);
create index if not exists idx_construction_hotels_scale on construction_hotels(scale);
create index if not exists idx_construction_hotels_chain on construction_hotels(chain);
create index if not exists idx_construction_hotels_cw_updated on construction_hotels(cw_updated_at);
create index if not exists idx_construction_hotel_activities_hotel on construction_hotel_activities(hotel_id);
