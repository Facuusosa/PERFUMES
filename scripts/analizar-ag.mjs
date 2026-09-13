#!/usr/bin/env node
// Agente de analytics A&G — parte "mecánica" del agente autónomo (issue #1
// en GitHub: https://github.com/Facuusosa/PERFUMES/issues/1).
//
// Este script SOLO junta datos y los guarda. NO decide qué está mal ni
// sugiere qué cambiar — eso lo hace Claude leyendo el snapshot generado acá,
// así el "cerebro" que aprende no queda encerrado en reglas fijas de código.
//
// Uso: node scripts/analizar-ag.mjs
// Requiere: .claude/analytics-tokens.local.json (gitignored, ver ese archivo)

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_PATH = join(ROOT, '.claude', 'analytics-tokens.local.json');
const HISTORY_DIR = join(ROOT, '.claude', 'analytics-history');

function loadTokens() {
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf-8'));
  } catch {
    console.error(
      `No encontré ${TOKENS_PATH}.\n` +
      'Ese archivo tiene las claves de solo lectura de PostHog y Cloudflare — sin eso el agente no puede consultar nada.'
    );
    process.exit(1);
  }
}

// --- PostHog: trae eventos crudos y los agrupa por día -------------------
async function fetchPostHogEvents(tokens, limit = 1000) {
  const { host, project_id, personal_api_key } = tokens.posthog;
  const url = `${host}/api/projects/${project_id}/events/?limit=${limit}&ordering=-timestamp`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${personal_api_key}` },
  });
  if (!res.ok) {
    throw new Error(`PostHog respondió ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.results ?? [];
}

// Filtra sesiones de desarrollo (localhost, 127.0.0.1) para no mezclar
// nuestras propias pruebas con clientas reales navegando el sitio en vivo.
function esTraficoReal(ev) {
  const url = ev.properties?.$current_url ?? '';
  return !url.includes('localhost') && !url.includes('127.0.0.1');
}

function groupByDay(events) {
  const byDate = {};
  for (const ev of events.filter(esTraficoReal)) {
    const date = ev.timestamp.slice(0, 10); // YYYY-MM-DD
    if (!byDate[date]) {
      byDate[date] = {
        date,
        visitantes: new Set(),
        pageviews: 0,
        whatsapp_checkout: 0,
        dead_clicks: 0,
        dead_swipes: 0,
      };
    }
    const day = byDate[date];
    day.visitantes.add(ev.distinct_id);
    if (ev.event === '$pageview') day.pageviews++;
    if (ev.event === 'whatsapp_checkout_click') day.whatsapp_checkout++;
    if (ev.event === '$dead_click') day.dead_clicks++;
    if (ev.event === '$dead_swipe') day.dead_swipes++;
  }
  return Object.values(byDate)
    .map((d) => ({ ...d, visitantes: d.visitantes.size }))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // más reciente primero
}

// --- Cloudflare: analytics agregados de la zona ---------------------------
async function fetchCloudflareSummary(tokens) {
  const { api_token, zone_id } = tokens.cloudflare;
  const since = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
  const until = new Date().toISOString();
  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zone_id}" }) {
          httpRequests1dGroups(
            limit: 10
            filter: { date_geq: "${since.slice(0, 10)}", date_leq: "${until.slice(0, 10)}" }
          ) {
            dimensions { date }
            sum { requests, cachedRequests, bytes }
          }
        }
      }
    }`;
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    return { error: `Cloudflare respondió ${res.status}` };
  }
  const json = await res.json();
  if (json.errors) {
    return { error: JSON.stringify(json.errors) };
  }
  const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
  const totals = groups.reduce(
    (acc, g) => ({
      requests: acc.requests + g.sum.requests,
      cachedRequests: acc.cachedRequests + g.sum.cachedRequests,
      bytes: acc.bytes + g.sum.bytes,
    }),
    { requests: 0, cachedRequests: 0, bytes: 0 }
  );
  return {
    requests: totals.requests,
    cachePct: totals.requests > 0 ? Math.round((totals.cachedRequests / totals.requests) * 1000) / 10 : null,
    mbServed: Math.round((totals.bytes / 1024 / 1024) * 10) / 10,
  };
}

// --- Historial: guarda snapshot de hoy, encuentra el anterior -------------
function saveSnapshot(data) {
  mkdirSync(HISTORY_DIR, { recursive: true });
  const filename = `${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(join(HISTORY_DIR, filename), JSON.stringify(data, null, 2));
  return join(HISTORY_DIR, filename);
}

function findPreviousSnapshot() {
  try {
    const files = readdirSync(HISTORY_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();
    // El [0] es el que se acaba de guardar en esta misma corrida; el anterior es [1]
    const prevFile = files[1];
    if (!prevFile) return null;
    return JSON.parse(readFileSync(join(HISTORY_DIR, prevFile), 'utf-8'));
  } catch {
    return null;
  }
}

// --- Main ------------------------------------------------------------------
async function main() {
  const tokens = loadTokens();

  console.log('Consultando PostHog...');
  const events = await fetchPostHogEvents(tokens);
  const porDia = groupByDay(events);

  console.log('Consultando Cloudflare...');
  const cloudflare = await fetchCloudflareSummary(tokens);

  const totales = porDia.reduce(
    (acc, d) => ({
      visitantes: acc.visitantes + d.visitantes,
      pageviews: acc.pageviews + d.pageviews,
      whatsapp_checkout: acc.whatsapp_checkout + d.whatsapp_checkout,
      dead_clicks: acc.dead_clicks + d.dead_clicks,
      dead_swipes: acc.dead_swipes + d.dead_swipes,
    }),
    { visitantes: 0, pageviews: 0, whatsapp_checkout: 0, dead_clicks: 0, dead_swipes: 0 }
  );
  const cvr = totales.pageviews > 0
    ? Math.round((totales.whatsapp_checkout / totales.pageviews) * 1000) / 10
    : 0;

  const snapshot = {
    generado: new Date().toISOString(),
    totales: { ...totales, cvr },
    porDia,
    cloudflare,
  };

  const path = saveSnapshot(snapshot);
  const anterior = findPreviousSnapshot();

  console.log('\n=== RESUMEN ===');
  console.log(`Visitantes: ${totales.visitantes}`);
  console.log(`Pageviews: ${totales.pageviews}`);
  console.log(`Compras (clic WhatsApp): ${totales.whatsapp_checkout}`);
  console.log(`CVR: ${cvr}%`);
  console.log(`Dead clicks: ${totales.dead_clicks}`);
  console.log(`Dead swipes: ${totales.dead_swipes}`);
  if (cloudflare.error) {
    console.log(`Cloudflare: no se pudo consultar (${cloudflare.error})`);
  } else {
    console.log(`Cloudflare — solicitudes: ${cloudflare.requests}, en cache: ${cloudflare.cachePct}%`);
  }

  if (anterior) {
    console.log('\n=== COMPARACIÓN CON SNAPSHOT ANTERIOR ===');
    console.log(`CVR anterior: ${anterior.totales.cvr}% → ahora: ${cvr}%`);
    console.log(`Dead clicks anterior: ${anterior.totales.dead_clicks} → ahora: ${totales.dead_clicks}`);
  } else {
    console.log('\n(Primer snapshot — no hay uno anterior para comparar todavía)');
  }

  console.log(`\nGuardado en: ${path}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
