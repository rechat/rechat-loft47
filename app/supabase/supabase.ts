import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log({ supabaseUrl }, { supabaseAnonKey })

if (!supabaseUrl) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL environment variable. Please check your .env file.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_ANON_KEY environment variable. Please check your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': 'supabase-js/2.39.7'
    }
  }
})
