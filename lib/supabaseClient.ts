import { createClient } from "@supabase/supabase-js";

// Safe to expose client-side — the anon key only ever acts within whatever
// Row Level Security policies are defined in schema.sql. It can never grant
// scan credits or read another user's data on its own.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
