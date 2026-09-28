-- Subscription X-Ray — pay-to-scan schema
-- Model: no free tier. A successful payment grants exactly one scan credit.
-- The scanner is locked until the signed-in user has at least one credit,
-- and using it consumes exactly one credit, atomically (see the function
-- below — this is what actually prevents a double-click or two open tabs
-- from turning one paid credit into two free scans).

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  scan_credits integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  subscription_count integer not null default 0,
  monthly_total numeric(12,2) not null default 0,
  annual_total numeric(12,2) not null default 0
);

create table if not exists detected_subscriptions (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  merchant text not null,
  amount numeric(12,2) not null,
  frequency text not null,
  occurrences integer not null,
  monthly_equivalent numeric(12,2) not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  razorpay_payment_id text unique,   -- unique: makes webhook retries idempotent,
                                       -- so Razorpay re-sending the same event
                                       -- can never grant a second free credit
  amount numeric(12,2),
  status text,
  created_at timestamptz not null default now()
);

-- Row Level Security: a user can see their own profile and their own scan
-- history, and nothing else. Nobody can write scan_credits directly —
-- credits only move via the SECURITY DEFINER functions below, so a user
-- can't just UPDATE their own row to grant themselves free scans.

alter table profiles enable row level security;
alter table scans enable row level security;
alter table detected_subscriptions enable row level security;
alter table payments enable row level security;

create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "read own scans" on scans for select using (auth.uid() = user_id);
create policy "read own detected subscriptions" on detected_subscriptions for select using (auth.uid() = user_id);
create policy "read own payments" on payments for select using (auth.uid() = user_id);

-- Lets a signed-in user save their OWN scan results (and only their own —
-- the WITH CHECK clause blocks inserting a row under someone else's
-- user_id). Needed so a paid scan's results survive closing the tab.
create policy "insert own scans" on scans for insert with check (auth.uid() = user_id);
create policy "insert own detected subscriptions" on detected_subscriptions for insert with check (auth.uid() = user_id);

-- Lets a new user's own signup create their profile row as a defensive
-- backup (the trigger below is the primary mechanism).
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

-- CRITICAL: without this, a profiles row is never created on signup at all
-- — auth.users gets a row automatically via Supabase Auth, but nothing else
-- creates the matching profiles row, which means the webhook below could
-- never find anyone to credit. This trigger is what actually connects a
-- new signup to a row that can hold scan_credits.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, scan_credits)
  values (new.id, new.email, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Called by the webhook (service role) right after a verified payment.
-- Grants a pack of scan credits (default 12 — one ₹69 payment = 12 scans,
-- not just one) rather than a single credit. Idempotent by construction:
-- the caller inserts into `payments` first with the unique
-- razorpay_payment_id — if that insert is skipped because the payment was
-- already recorded, this function is never even called again for it.
create or replace function grant_scan_credit(target_user uuid, credits integer default 12)
returns integer
language plpgsql
security definer
as $$
declare
  remaining integer;
begin
  update profiles
  set scan_credits = scan_credits + credits
  where id = target_user
  returning scan_credits into remaining;

  return remaining;
end;
$$;

revoke all on function grant_scan_credit(uuid, integer) from public;

-- Called by the signed-in user's browser right when a scan completes.
-- The WHERE scan_credits > 0 makes this a single atomic row update, so two
-- concurrent calls (double-click, two open tabs) can't both succeed against
-- the same one credit — this was tested directly, not just assumed.
create or replace function consume_scan_credit()
returns integer
language plpgsql
security definer
as $$
declare
  remaining integer;
begin
  update profiles
  set scan_credits = scan_credits - 1
  where id = auth.uid() and scan_credits > 0
  returning scan_credits into remaining;

  if remaining is null then
    raise exception 'No scan credits remaining';
  end if;

  return remaining;
end;
$$;

revoke all on function consume_scan_credit() from public;
grant execute on function consume_scan_credit() to authenticated;
