# Agente Autónomo de Análisis A&G Perfumes

**Filed:** 2026-09-12  
**Status:** Ready for implementation  
**Effort estimate:** ~4.5 horas (MVP)

---

## Context

A&G tiene 1.85% CVR (de cada 100 personas que entran, solo ~2 compran). PostHog y Cloudflare muestran QUÉ falla (botones rotos que la gente intenta usar pero no funcionan, conversión muy baja, gestos fallidos en celular). 

Hoy vos haces esto manual cada semana. Necesitamos un agente que lo haga automático.

## Current State

**Hoy:**
1. Vos entras a PostHog (herramienta de datos de usuarios) y Cloudflare (proveedor del sitio)
2. Anotás qué pasó
3. Analizás: "¿por qué tan baja la conversión?"
4. Pensás: "¿qué cambio haría diferencia?"
5. Vos entrás al código y lo modificás
6. Vos subes el cambio a la web
7. Una semana después, ves si funcionó

**Lo que revisamos:**
- `src/App.tsx` = el archivo donde está TODO el sitio (los botones, los textos, los colores)
- Cuando vos escribís `npm run dev`, se abre una versión del sitio en TU compu (localhost:5173)
- Cloudflare = la empresa que sirve el sitio a todo el mundo
- NO tocar: las fotos, la base de datos (Supabase), la estructura por dentro

## Proposed Change

Un agente (un programa de IA) que:

1. **Cada 7 días, o cuando vos le pidas ahora:**
   - Entra automáticamente a PostHog
   - Entra automáticamente a Cloudflare
   - Recopila los datos (cuánta gente entró, cuántos compraron, qué botones se rompieron)

2. **Genera un reporte visual (HTML = página web que podés ver)** con:
   - Números de la semana (60 visitantes, 2 conversiones, 34 botones rotos)
   - Comparación: "La semana pasada era X, esta semana es Y"
   - Identifica los 3 problemas más grandes
   - **Sugiere 2 opciones DISTINTAS** (no son variantes de lo mismo, son opciones reales que compiten):
     - Opción A: "Hacé el botón de WhatsApp más grande" (fundamento: la gente no lo ve)
     - Opción B: "Mejorá el texto del botón" (fundamento: la gente no entiende qué hace)

3. **Vos eleís UNA opción**

4. **El agente hace el cambio automáticamente:**
   - Abre el archivo `App.tsx`
   - Hace el cambio exacto que sugirió
   - Verifica que no haya ERRORES (compila correctamente = el código funciona)
   - Abre tu compu en localhost (http://localhost:5173)
   - Te muestra: "Mirá, acá está el cambio en tu compu, antes de subirlo a la web"

5. **Vos navegás el sitio en tu compu, ves el cambio, verificás:**
   - "¿Se ve bien?"
   - "¿No se rompió nada?"
   - "¿Me gusta?"

6. **Cuando vos decís: "OK, aprobado"**

7. **El agente sube TODO automáticamente:**
   - Guarda los cambios (git commit = grabar el cambio)
   - Lo envía a GitHub (repositorio = nube donde vive el código)
   - Cloudflare lo ve, automáticamente compila y lo sube a la web
   - **Listo. Cambio en vivo. Vos no tocás nada.**

8. **La semana siguiente:**
   - El agente mira los datos NUEVOS
   - Compara: "La semana pasada 1.85% CVR, esta semana 2.5% CVR — ¡mejoró!"
   - Sugiere qué hacer después

## ✅ Cosas que el agente TIENE que hacer bien (o no funciona)

1. ✅ Reporte con números REALES de PostHog + Cloudflare (no números inventados)
2. ✅ 2 opciones reales (no son variantes de lo mismo, son cosas distintas)
3. ✅ Plan detallado: "Voy a cambiar esto en el archivo `App.tsx`, en la línea X, porque..."
4. ✅ Cambio en el código sin ERRORES (el código compila = funciona, no se rompe)
5. ✅ Lo ves en tu compu ANTES (localhost) para verificar que está bien
6. ✅ Cambio sube automáticamente cuando vos digas "ok" (sin que vos hagas nada más)
7. ✅ Si se rompe en la web: el agente automáticamente lo DESHACE en 2 minutos
8. ✅ Se guarda un registro: "21/09 cambié botón, resultados: dead clicks bajaron 40%"
9. ✅ La semana siguiente: nuevo análisis, nuevas 2 opciones, nuevo ciclo

## Verificación (Testing Plan)

| Tipo | Qué se verifica | Cuántos |
|------|-----------------|---------|
| Automático | El agente calcula bien (1.85% → 2.1% = +0.25%) | +3 |
| Flujo completo | Datos → análisis → 2 opciones → cambio en código → sube a web | +1 |
| Manual (vos) | Vos navegás localhost, ves el cambio, verificás que esté bien | +1 |

## Rollback Plan (Si algo falla)

- **El agente lo ve antes de subir:** bloquea automáticamente, no sube, te avisa
- **Se sube pero rompe la web:** el agente automáticamente lo REVIERTE (deshace el cambio) en 2 minutos
- **La semana siguiente:** el agente propone alternativa diferente

## Effort Estimate

- Agente entra a PostHog/Cloudflare y recopila datos: 2 horas
- Lógica para sugerir 2 opciones distintas: 1 hora
- Validar cambios (que no haya errores) y subir automático: 1.5 horas
- **Total: ~4.5 horas** (primera vez que se arma)

## Archivos que toca el agente

| Archivo | Qué cambia |
|---------|-----------|
| `src/App.tsx` | Botones (tamaño, colores), textos, layout (dónde va cada cosa) |
| (Reporte nuevo) | Página HTML que ves cada semana |

## Archivos que NO toca NUNCA

- Fotos (no las modifica)
- Base de datos Supabase (no cambia estructura)
- Nuevas funcionalidades grandes (solo sugiere, no las hace)
- Otros proyectos (Brújula, Odiseo — este es independiente)
- No sube automático al principio (primero manual on-demand, luego vemos si hacemos automático)

## Out of Scope

- Fotos del catálogo
- Schema Supabase
- Nuevas funcionalidades (solo sugerir)
- Integración otros proyectos
- Cron automático aún (manual on-demand primero)

## Próximos pasos

1. ✅ Spec aprobada por Facu
2. ⏳ Implementación (armar agente)
3. ⏳ Testing en A&G
4. ⏳ Primera semana de uso real
5. ⏳ Evaluar si agregar cron automático cada 7 días
