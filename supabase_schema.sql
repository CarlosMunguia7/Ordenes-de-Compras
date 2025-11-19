-- ========================================
-- SCRIPT COMPLETO PARA SUPABASE
-- Sistema de Órdenes de Compra
-- ========================================

-- 1. Tabla de Perfiles (Usuarios públicos)
-- Supabase maneja los usuarios en 'auth.users', pero esta tabla 'profiles'
-- nos sirve para guardar datos extra como el Nombre y el Rol (Jefe/Empleado).
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text default 'employee', -- 'employee' o 'boss'
  created_at timestamptz default now()
);

-- 2. Tabla de Órdenes
create table orders (
  id uuid default gen_random_uuid() primary key,
  request_number serial,
  created_at timestamptz default now(),
  user_id uuid references profiles(id), -- Vincula con el perfil del usuario
  title text, -- NUEVO: Título de la orden
  status text default 'pending',
  total_amount decimal(10,2),
  justification text,
  reviewer_notes text
);

-- 3. Tabla de Items de la Orden
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_name text not null,
  supplier text, -- NUEVO: Proveedor del producto
  quantity integer not null,
  unit_price decimal(10,2) not null
);

-- 4. Seguridad (RLS)
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Políticas de Perfiles
create policy "Perfiles visibles por todos" on profiles for select using (true);
create policy "Usuario puede editar su propio perfil" on profiles for update using (auth.uid() = id);

-- Políticas de Órdenes
create policy "Usuarios pueden ver todas las ordenes" on orders for select to authenticated using (true);
create policy "Usuarios pueden crear ordenes" on orders for insert to authenticated with check (auth.uid() = user_id);
create policy "Jefes pueden actualizar ordenes" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'boss')
);
create policy "Usuarios pueden actualizar sus propias ordenes" on orders for update using (auth.uid() = user_id);
create policy "Usuarios pueden eliminar sus propias ordenes" on orders for delete using (auth.uid() = user_id);

-- Políticas de Items
create policy "Usuarios pueden ver items" on order_items for select to authenticated using (true);
create policy "Usuarios pueden crear items" on order_items for insert to authenticated with check (true);
create policy "Usuarios pueden actualizar items de sus ordenes" on order_items for update using (
  exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);
create policy "Usuarios pueden eliminar items de sus ordenes" on order_items for delete using (
  exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid())
);

-- 5. Trigger para crear perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
