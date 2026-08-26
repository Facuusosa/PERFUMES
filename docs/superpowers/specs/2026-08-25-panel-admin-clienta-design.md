# Panel de administración para la clienta — carga de catálogo

## Contexto

El stack actual (Vite + React + TypeScript + Supabase, ver `CLAUDE.md`) no trae ningún panel
de administración. Todo el catálogo (`public.perfumes` en Supabase) se carga hoy con
migraciones SQL escritas a mano por Facu — la pregunta pendiente desde el reemplazo de stack
del 2026-08-17 ("cómo carga la clienta sin ayuda técnica") sigue abierta (ver `docs/PRODUCT.md`).

Durante el research de este spec se encontró una falla de seguridad activa, independiente de
si se construye el panel o no: la migración `20260815220935_create_perfume_catalog.sql`
habilita Row Level Security (RLS) en `public.perfumes` pero las políticas de INSERT/UPDATE/DELETE
están otorgadas al rol `anon` (cualquier visitante sin login). Como la "anon key" de Supabase
va expuesta en el bundle de JavaScript del sitio por diseño, hoy cualquier visitante que abra
las devtools del navegador puede escribir o borrar el catálogo completo sin autenticarse. Este
spec incluye cerrar esa falla como parte del trabajo, no como un extra.

Las fotos de producto (`public/images/perfumes/*.png`) son hoy archivos estáticos del repo,
parte del build de Vite — no viven en un storage. Para que la clienta suba fotos sin depender
de un deploy, hace falta Supabase Storage.

Investigación de soporte (Regla #00, verificado 2026-08-25):
- Plan free de Supabase: 500 MB de storage de archivos, 500 MB de base de datos, 50.000
  usuarios de Auth por mes, 5 GB de egress. Para 1 sola usuaria admin y ~50 fotos de producto,
  sobra ampliamente — costo $0. (Nota aparte, no bloqueante: los proyectos free se auto-pausan
  tras una semana sin actividad de API; con tráfico real de tienda no debería activarse.)
- Se comparó construir el panel a mano (React + Supabase directo) contra usar una librería de
  admin genérica (react-admin / Refine). Para una sola tabla con ~10 campos, el tiempo de
  configurar la librería (adaptador de datos para Supabase, theming) es comparable al de
  escribir el formulario a mano, y suma una dependencia + bundle extra sin beneficio real.
  Se descarta.
- Se comparó dar acceso directo a Supabase Studio (Table Editor) a la clienta. Es la opción de
  menor esfuerzo pero se descarta: expone toda la configuración del proyecto (otras tablas,
  ajustes, billing), no solo el catálogo, y usa una interfaz técnica ajena al sitio — contradice
  el requisito explícito de Facu de que la clienta nunca vea Supabase ni SQL.
- Se investigó si el comprador final (no la clienta) necesita una cuenta de usuario para
  comprar. Baymard Institute (referencia de usabilidad de checkout) documenta que ~24-26% de
  compradores abandonan el carrito específicamente por verse forzados a crear una cuenta antes
  de pagar, más ~19% adicional por fricción de contraseña. Combinado con que este sitio ya
  resuelve el pedido por WhatsApp (donde el comprador da nombre y dirección en el chat), no hay
  ningún beneficio a cambio de esa fricción. **Decisión: el comprador final nunca tiene cuenta
  ni login — eso no cambia con este spec.** El único login que se construye es el de la clienta
  administradora.

## Objetivo

La clienta (dueña del negocio, sin conocimientos técnicos) puede cargar, editar y eliminar
productos del catálogo — incluida la foto — desde una vista dentro del mismo sitio, sin tocar
Supabase, SQL, ni depender de Facu para cada alta. El resultado visual es indistinguible de un
producto cargado por migración SQL: el mismo template de tarjeta/modal se aplica a cualquier
fila de la tabla `perfumes`, sin importar cómo se cargó.

## Fuera de alcance

- **Productos con variantes** (ej. las distintas líneas de Yara, con foto y notas propias por
  variante). Son estructuralmente más complejos de formular y hoy son pocos — Facu los sigue
  cargando por SQL. Se puede sumar como mejora futura al formulario sin cambiar la arquitectura.
- **Cuentas de usuario para el comprador final** — decisión tomada arriba, no es un pendiente.
- **Gestión de pedidos** — el checkout sigue siendo 100% por WhatsApp, no hay tabla de pedidos.
- Compresión/optimización automática de imágenes al subir (se valida tipo y tamaño máximo, no
  se procesa la imagen).
- Recuperación de contraseña self-service para la clienta (con una sola usuaria, Facu se la
  resetea a mano desde Supabase si hace falta).

## Diseño

### 1. Acceso — ruta `/admin`, sin registro

Una URL propia del mismo sitio (`tu-dominio.com.ar/admin`), no enlazada desde ningún menú
público. `main.tsx` decide en el arranque, según `window.location.pathname`, si monta `<App />`
(la tienda) o `<AdminApp />` (el panel) — no hace falta traer react-router para una sola ruta
extra.

`AdminApp` consulta `supabase.auth.getSession()` y se suscribe a `onAuthStateChange()`:
- Sin sesión → renderiza `<Login />` (formulario email + contraseña, llama a
  `supabase.auth.signInWithPassword()`; error de credenciales muestra "Usuario o contraseña
  incorrectos").
- Con sesión → renderiza `<Dashboard />`, con botón de cerrar sesión.

No existe pantalla de registro. El usuario de la clienta lo crea Facu una única vez desde el
dashboard de Supabase (Authentication → Add user) y le pasa usuario/contraseña por fuera del
sitio.

**Corrección tras revisión antagónica (2026-08-26):** `netlify.toml` hoy no define ningún
redirect — Netlify sirve archivos estáticos y no sabe que `/admin` debe resolver a la SPA. Sin
esto, `/admin` funcionaría en desarrollo (Vite hace SPA-fallback solo) pero devolvería 404 en
producción apenas alguien refresque la página o entre por link directo. Este spec incluye
agregar a `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Seguridad — nueva migración RLS + Storage

Nueva migración que reemplaza las políticas de escritura de `public.perfumes`:
- `SELECT` se mantiene abierta a `anon, authenticated` (el catálogo tiene que seguir siendo
  visible sin login en la tienda).
- `INSERT`, `UPDATE`, `DELETE` pasan a exigir rol `authenticated` únicamente.

Se crea un bucket de Supabase Storage (`product-images`): lectura pública (para que las fotos
carguen en la tienda sin login), escritura (subir/borrar) restringida a `authenticated`.

**Corrección tras revisión antagónica (2026-08-26):** restringir a `authenticated` no alcanza
por sí solo. Por default, Supabase permite que cualquier visitante se cree una cuenta con
`supabase.auth.signUp()` desde la consola del navegador (la anon key ya está expuesta en el
bundle) — esa cuenta autocreada también sería `authenticated`, y el agujero de seguridad se
reubicaría en vez de cerrarse. Paso obligatorio, sin código: desde el dashboard de Supabase,
Authentication → Providers → Email, desactivar "Allow new users to sign up". Con el registro
público apagado, solo la cuenta que Facu crea a mano puede autenticarse, y recién ahí la
restricción a `authenticated` cierra el agujero de verdad — tanto en la tabla `perfumes` como
en el bucket `product-images`.

### 3. Dashboard — lista + alta/edición + baja

- Lista de productos: miniatura, nombre, categoría, precio, botones "Editar" / "Eliminar" por
  fila. Botón "+ Agregar producto" arriba.
- Un mismo componente de formulario sirve para alta y edición. Campos: nombre, subtítulo,
  categoría (select: Perfume / Combo / Victoria's Secret), familia olfativa, notas, precio
  (ARS, entero > 0), volumen, descripción, foto (`<input type="file">`, sube al bucket al
  guardar y persiste la URL pública resultante en `image`), y color de acento
  (`<input type="color">` con ayuda visible: "elegí el tono que más se parece al frasco"), con
  una vista previa en vivo de cómo queda la tarjeta del producto con ese color — así la clienta
  ve el resultado antes de guardar, en vez de tener que adivinar si combina.
- **Corrección tras revisión antagónica (2026-08-26) — formulario condicional por categoría:**
  `family` y `notes` son columnas `NOT NULL` en la tabla (`20260815220935_create_perfume_catalog.sql`),
  pero solo tienen sentido real para la categoría Perfume — pedirle "familia olfativa" a una
  bruma de Victoria's Secret o al combo Karseell confunde a la clienta. El formulario oculta
  esos dos campos cuando la categoría no es "Perfume" y completa esas columnas automáticamente
  con un valor fijo neutro (ej. igual al `subtitle`), transparente para la clienta.
- Alta: se genera un `id` slug a partir del nombre, verificando que no colisione con uno
  existente antes del INSERT; si colisiona, se muestra un error pidiendo ajustar el nombre (no
  se genera un sufijo automático silencioso).
- **Corrección tras revisión antagónica (2026-08-26) — el id nunca cambia después de creado:**
  el `id` es la primary key y la referencia usada por el carrito. Editar el nombre de un
  producto existente actualiza `name` pero nunca regenera ni modifica su `id` — evita romper
  referencias silenciosamente.
- Edición: si se reemplaza la foto, se sube la nueva y se actualiza `image`; si no se toca, se
  conserva la existente.
- Eliminar: modal de confirmación ("¿Seguro que querés eliminar [nombre]? No se puede
  deshacer") antes del DELETE. **Corrección tras revisión antagónica (2026-08-26):** al
  confirmar, además del DELETE en la tabla se borra del bucket la imagen asociada al producto,
  para no acumular archivos huérfanos.

### 4. Validación y errores

Campos obligatorios no vacíos, precio numérico > 0, foto obligatoria en alta (opcional en
edición si ya existe una). Tipo de archivo limitado a imágenes, tamaño máximo 5 MB con mensaje
claro si se excede. Botones muestran estado de carga ("Guardando...", "Subiendo foto...") para
evitar doble envío. Errores de red o de Supabase se muestran en el formulario sin perder los
datos ya tipeados.

### 5. Sin dependencias nuevas

Todo se construye con lo ya instalado (`@supabase/supabase-js`, React). No se suma ninguna
librería de UI ni de routing.

### 6. Testing

El proyecto no tiene suite de tests automatizados (consistente con el resto del código). Plan:
Facu prueba el flujo completo con datos de prueba, después hace una pasada mostrándoselo a la
clienta (o le graba un instructivo corto) antes de considerarlo entregado.
