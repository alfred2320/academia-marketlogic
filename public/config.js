/* Configuración pública de la Academia. Estos valores NO son secretos:
   la seguridad la dan el login con Google y las reglas de la base (supabase/schema.sql).
   Supabase > Project Settings > API: copia "Project URL" y la clave "anon public". */
window.MLA_CONFIG = {
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabaseAnonKey: "PEGA_AQUI_LA_ANON_KEY",
  domain: "mymarketlogic.com",
  playUrl: ""   // enlace al Sales Play Deck; vacío usa el actual de claude.ai
};
