import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------
//  ENV VARIABLES (VITE PREFIX REQUIRED)
// ----------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Supabase environment variables missing. Make sure you have:\n" +
      "VITE_SUPABASE_URL=...\n" +
      "VITE_SUPABASE_ANON_KEY=...\n" +
      "in your .env.local file."
  );
}

// ----------------------------------------------------
//  SAFE FETCH WRAPPER (Fixes Chrome/Brave Race Issues)
// ----------------------------------------------------
const safeFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, init).catch((err) => {
    console.warn("⚠️ Global fetch error intercepted:", err);
    throw err;
  });

// ----------------------------------------------------
//  SUPABASE CLIENT (Most stable configuration)
// ----------------------------------------------------
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage, // more stable than sessionStorage for SPA
  },
  global: {
    fetch: safeFetch,
  },
});
