/*
# Reemplazar el placeholder de Armaf Odyssey Homme y fijar el estado real en el repo

1. Data Changes
- Actualiza `family` (unico campo que seguia siendo el placeholder generico 'Amaderado')
  y vuelve a escribir `notes`/`description` con el MISMO valor que ya esta en produccion
  (ver punto 2) para que esta migracion sea la fuente de verdad -- si el catalogo se
  recrea desde cero en otro ambiente, tiene que quedar igual a lo que hoy ve el cliente.
2. Important Notes -- hallazgo de esta sesion (2026-08-26)
- Al verificar en el sitio real (Supabase, no fallback) para escribir esta migracion, el
  campo `notes` YA NO decia "Notas por confirmar" sino "Cardamomo · Mandarina · Neroli",
  y `description` ya tenia texto real ("Cítrico y elegante, con cardamomo y mandarina que
  dan paso a un corazón de azahar y rosa sobre un fondo amaderado de sándalo, vainilla y
  ámbar."). Ninguna migracion committeada en este repo hace ese cambio -- alguien (Facu a
  mano en el dashboard de Supabase, u otra sesion de Claude Code corriendo en paralelo, ver
  [[project_sesiones-concurrentes]]) ya lo corrigio directo en produccion sin dejarlo
  registrado en `supabase/migrations/`. Esta migracion existe para que el repo vuelva a
  coincidir con la realidad, no para pisar un fix que ya estaba bien.
- `subtitle` ('Elegante · masculino') tampoco se toca -- ya era razonable y no es el
  placeholder.
- Fuente para `family`: Fragrantica (https://www.fragrantica.com/perfume/Armaf/Odyssey-Homme-64464.html),
  familia Oriental con base amaderada. No confundir con "Odyssey Homme White Edition"
  (Fragrantica ID 64466), producto distinto que no esta en este catalogo.
*/

UPDATE public.perfumes SET
  family = 'Oriental amaderado',
  notes = 'Cardamomo · Mandarina · Neroli',
  description = 'Cítrico y elegante, con cardamomo y mandarina que dan paso a un corazón de azahar y rosa sobre un fondo amaderado de sándalo, vainilla y ámbar.',
  updated_at = now()
WHERE id = 'armaf-odyssey-homme';
