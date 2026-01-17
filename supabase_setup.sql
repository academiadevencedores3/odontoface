-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Services Table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) not null,
  duration_min int default 60,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Professionals Table
create table public.professionals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  specialty text not null,
  photo_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Appointments Table
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  client_name text not null,
  client_phone text not null,
  date date not null,
  time text not null, -- Storing as 'HH:mm' for simplicity
  status text default 'pending', -- pending, confirmed, completed, cancelled
  service_id uuid references public.services(id) on delete set null,
  professional_id uuid references public.professionals(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.appointments enable row level security;

-- 5. RLS Policies

-- Services: Everyone can read, only authenticated (admins) can modify
create policy "Public services are viewable by everyone" on public.services
  for select using (true);

create policy "Admins can insert services" on public.services
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update services" on public.services
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete services" on public.services
  for delete using (auth.role() = 'authenticated');

-- Professionals: Everyone can read, only authenticated (admins) can modify
create policy "Public professionals are viewable by everyone" on public.professionals
  for select using (true);

create policy "Admins can insert professionals" on public.professionals
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update professionals" on public.professionals
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete professionals" on public.professionals
  for delete using (auth.role() = 'authenticated');

-- Appointments: Public can create, Admins can do everything
create policy "Public can create appointments" on public.appointments
  for insert with check (true);

create policy "Admins can view all appointments" on public.appointments
  for select using (auth.role() = 'authenticated');

create policy "Admins can update appointments" on public.appointments
  for update using (auth.role() = 'authenticated');

-- 6. Insert Mock Data (Optional, run if you want initial data)
insert into public.services (title, price, duration_min) values
('Harmonização Facial', 2500.00, 60),
('Clareamento a Laser', 800.00, 60),
('Lentes de Contato Dental', 12000.00, 120),
('Limpeza Profunda', 350.00, 45);

insert into public.professionals (name, specialty, photo_url) values
('Dr. Roberto Silva', 'Cirurgião Dentista', 'https://picsum.photos/id/1062/400/400'),
('Dra. Ana Costa', 'Estética Facial', 'https://picsum.photos/id/338/400/400');
