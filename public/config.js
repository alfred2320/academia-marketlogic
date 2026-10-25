/* Configuración pública de la Academia. Estos valores NO son secretos:
   la seguridad la dan el login con Google y las reglas de la base (supabase/schema.sql).
   Supabase > Project Settings > API: copia "Project URL" y la clave "anon public". */
window.MLA_CONFIG = {
  supabaseUrl: "https://dcructyferltuaicrqsr.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnVjdHlmZXJsdHVhaWNycXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MjQxNDgsImV4cCI6MjEwODUwMDE0OH0.q-W7R1dRb4pCJDH2w2DJ4TIV9U9okm3ZOK6sKBImOrk",
  domain: "mymarketlogic.com",
  playUrl: ""   // enlace al Sales Play Deck; vacío usa el actual de claude.ai
};
