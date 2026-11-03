create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null,
  balance integer not null default 0,
  created_at timestamptz not null default now()
);
