import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Vercel's Supabase Integration sets SUPABASE_URL / SUPABASE_ANON_KEY or NEXT_PUBLIC_*
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    env.SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''

  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''

  const vapidPublicKey =
    env.VITE_VAPID_PUBLIC_KEY ||
    process.env.VITE_VAPID_PUBLIC_KEY ||
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    env.VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    ''

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      ...(vapidPublicKey ? { 'import.meta.env.VITE_VAPID_PUBLIC_KEY': JSON.stringify(vapidPublicKey) } : {}),
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      cors: true,
    },
  }
})

