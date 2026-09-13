// SessionStart: avisa si Gisela (la clienta) agrego o edito un producto en el
// catalogo de Supabase desde la ultima vez que se abrio una sesion en este
// proyecto. Solo avisa, no bloquea ni escribe nada en el repo (el estado vive
// en un archivo local gitignored). Pedido por Facu 2026-09-13.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(ROOT, '.claude', 'catalog-last-check.local.json');
const ENV_FILE = path.join(ROOT, '.env');

function leerEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const vars = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return vars;
}

function haceTiempo(fecha) {
  const ms = Date.now() - new Date(fecha).getTime();
  const minutos = Math.round(ms / 60000);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} hora${horas === 1 ? '' : 's'}`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} dia${dias === 1 ? '' : 's'}`;
}

async function main() {
  const env = leerEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const previo = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : null;

  const response = await fetch(
    `${url}/rest/v1/perfumes?select=id,name,created_at,updated_at&order=updated_at.desc&limit=10`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!response.ok) return;
  const productos = await response.json();
  if (!Array.isArray(productos) || productos.length === 0) return;

  const masReciente = productos[0].updated_at;
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ lastSeenUpdatedAt: masReciente }, null, 2));

  // Primera vez que corre este hook: no hay base de comparacion, solo guardar y no avisar.
  if (!previo?.lastSeenUpdatedAt) return;

  const nuevos = productos.filter((p) => new Date(p.updated_at) > new Date(previo.lastSeenUpdatedAt));
  if (nuevos.length === 0) return;

  const detalle = nuevos
    .map((p) => {
      const accion = Math.abs(new Date(p.created_at) - new Date(p.updated_at)) < 2000 ? 'agrego' : 'edito';
      return `- ${accion} "${p.name}" (${haceTiempo(p.updated_at)})`;
    })
    .join('\n');

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        `Aviso de catalogo -- Gisela hizo cambios en el catalogo de A&G Perfumes desde la ultima sesion:\n${detalle}\n` +
        `Contale a Facu apenas arranque la sesion.`,
    },
  }));
}

main().catch(() => {
  // si Supabase no responde, no hay internet, o cambio el formato -- no bloquear el arranque
});
