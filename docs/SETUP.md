# Guía de puesta en marcha

Tiempo estimado: 1 a 2 horas la primera vez. Necesitas ser administrador de Google Workspace, tener acceso a la cuenta de Cloudflare donde vive `mymarketlogic.net` y una cuenta de GitHub.

## 1. Supabase (datos y login)

1. Crea una cuenta en supabase.com y un proyecto nuevo (región cercana, por ejemplo East US). Guarda la contraseña de la base.
2. Abre **SQL Editor > New query**, pega todo `supabase/schema.sql` y pulsa **Run**. Debe terminar sin errores.
3. Abre **Project Settings > API** y copia el **Project URL** y la clave **anon public**.
4. Edita `public/config.js` con esos dos valores y haz commit.

## 2. Google (login con la cuenta de MarketLogic)

1. En console.cloud.google.com crea un proyecto dentro de la organización de MarketLogic.
2. **APIs y servicios > Pantalla de consentimiento de OAuth**: tipo de usuario **Interno** (solo cuentas del Workspace). Nombre: Academia MarketLogic.
3. **Credenciales > Crear credenciales > ID de cliente de OAuth > Aplicación web.** En **URI de redireccionamiento autorizados** pega:
   `https://TU-PROYECTO.supabase.co/auth/v1/callback`
   Copia el **ID de cliente** y el **secreto**.
4. En Supabase: **Authentication > Sign In / Providers > Google**. Actívalo y pega ID y secreto.
5. En Supabase: **Authentication > URL Configuration**:
   - Site URL: `https://academia.mymarketlogic.net`
   - Redirect URLs: la misma dirección y, si vas a probar en tu equipo, `http://localhost:8765`.

Con esto solo entran cuentas @mymarketlogic.com: Google las filtra (tipo Interno) y la base rechaza cualquier otro correo.

## 3. Cloudflare Pages (hosting)

1. Sube este proyecto a un repositorio privado de GitHub (ver docs/OPERACION.md, sección "Primer push").
2. En Cloudflare: **Workers & Pages > Create > Pages > Connect to Git** y elige el repositorio.
3. Configuración de build: Framework preset **None**, Build command **vacío**, Build output directory **`public`**.
4. Al terminar el primer despliegue, entra a **Custom domains > Set up a custom domain** y escribe `academia.mymarketlogic.net`. Cloudflare crea el DNS solo porque el dominio ya vive ahí.
5. Abre `https://academia.mymarketlogic.net`. Debe mostrar "Entrar con Google".

## 4. Primer administrador

En Supabase, **SQL Editor**:

```sql
insert into public.admins (email) values ('tu.nombre@mymarketlogic.com');
```

Cierra sesión y vuelve a entrar. Verás la pestaña **Equipo** (resumen, accesos, BLITZ, videos). Agrega más editores con el mismo comando.

## 5. Videos en YouTube

1. Los 21 videos están en `tools/video/videos/` (1_1.mp4 a 7_3.mp4). `tools/video/YOUTUBE.csv` trae el título y la descripción sugeridos de cada uno.
2. Súbelos a un canal de MarketLogic con visibilidad **No listado**.
3. En la Academia entra a **Equipo > Videos**, pega el enlace de cada capítulo y pulsa **Guardar enlace**. Se reproducen dentro de la app.

## 6. Prueba antes de abrir al equipo

1. Entra con tu cuenta, completa el diagnóstico y avanza una lección. Debe aparecer "Guardado en la nube".
2. Ciérralo y ábrelo en el celular con la misma cuenta: el avance debe estar.
3. Instálalo: en Android, menú del navegador > **Instalar app**. En iPhone, Safari > Compartir > **Agregar a pantalla de inicio**.
4. Pide a 2 o 3 personas que entren, y bloquea a una desde **Equipo > Accesos** para confirmar que pierde el acceso.
5. Intenta entrar con una cuenta @gmail.com: debe rechazarla.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| "Falta configurar la conexión" | `public/config.js` aún tiene los valores de ejemplo |
| Google dice "redirect_uri_mismatch" | El URI del paso 2.3 no coincide con el Project URL |
| Entra pero no guarda ("Solo en este navegador") | No se corrió `schema.sql` completo o el correo no es del dominio |
| No aparece la pestaña Equipo | Falta el correo en `public.admins` o es distinto al de Google (minúsculas) |
| La app no se actualiza | Cierra y abre la app; el aviso "Hay una versión nueva" aparece al detectar el despliegue |
| Proyecto Supabase pausado | El plan gratuito puede pausarse por inactividad: reactívalo desde el panel o pasa a un plan de pago |
