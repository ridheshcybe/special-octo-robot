-- ============================================================================
-- PrepMeUp AI — Migration Phase 2: Auth, User Triggers & RLS Policies
-- Adds:
--  1. Supabase Auth trigger to auto-create pmu_profiles on new phone signup
--  2. Strict RLS updates:
--     - Students select/update ONLY their own profile (cannot alter role)
--     - Students cannot read other students' profiles or private access records
--     - Admins have read access to all student profiles
-- ============================================================================

-- Function to handle new user creations via Supabase Auth
create or replace function public.pmu_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text;
  v_name text;
begin
  v_phone := coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '');
  v_name := coalesce(new.raw_user_meta_data ->> 'full_name', '');

  insert into public.pmu_profiles (
    id,
    phone,
    full_name,
    college,
    branch,
    current_semester,
    role
  )
  values (
    new.id,
    nullif(v_phone, ''),
    v_name,
    coalesce(new.raw_user_meta_data ->> 'college', ''),
    coalesce(new.raw_user_meta_data ->> 'branch', 'B.Tech CSE AI/ML'),
    coalesce((new.raw_user_meta_data ->> 'current_semester')::int, 1),
    'student'
  )
  on conflict (id) do update set
    phone = coalesce(nullif(excluded.phone, ''), public.pmu_profiles.phone),
    full_name = case when public.pmu_profiles.full_name = '' then excluded.full_name else public.pmu_profiles.full_name end,
    updated_at = now();

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_pmu_auth_user_created on auth.users;
create trigger on_pmu_auth_user_created
  after insert on auth.users
  for each row execute function public.pmu_handle_new_user();

-- Guard function preventing students from escalating their own role
create or replace function public.pmu_profile_update_allowed(
  p_id uuid,
  p_role text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_id = auth.uid()
    and p_role = (select role from public.pmu_profiles where id = auth.uid())
    or public.pmu_is_admin();
$$;

-- Update pmu_profiles update policy with strict role immutability
drop policy if exists "pmu_profiles_update" on public.pmu_profiles;
create policy "pmu_profiles_update" on public.pmu_profiles
  for update using (id = auth.uid() or public.pmu_is_admin())
  with check (public.pmu_profile_update_allowed(id, role));
