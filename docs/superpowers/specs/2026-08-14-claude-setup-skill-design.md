# Skill global `claude-setup` — auditar y scaffoldear .claude

## Contexto

Durante esta sesión se auditó a fondo `.claude/` de ecommerce-perfumes contra la
documentación oficial de Claude Code (`code.claude.com/docs/en/claude-directory` y
`.../worktrees`, verificadas por fetch directo, no por memoria). Se encontró y corrigió el
único gap real (`.claude/worktrees/` sin gitignorear); el resto del setup ya cumplía el
estándar oficial.

Facu pidió llevar ese conocimiento a `~/.claude` (global) como algo "maestro y
actualizable", reusable en cualquier proyecto futuro — no solo este. Se investigó (agente
con WebSearch) qué hace la comunidad más allá de lo oficial, y se corrió un debate
antagónico (2 agentes independientes, posturas opuestas, sin verse entre sí) sobre si
conviene construir esto ahora de forma rica (maximalista) o mínima/diferida (minimalista).

Hallazgo clave de la investigación: no existe públicamente un meta-skill que audite o
scaffoldee un `.claude` reusable entre proyectos — es un hueco real. Comparando repos
comunitarios: minimalista ([evantahler/dot-claude](https://github.com/evantahler/dot-claude),
~10 archivos) vs. maximalista ([zircote/.claude](https://github.com/zircote/.claude),
115+ agentes, calificado de "un montón" por el propio agente investigador). Consenso de
comunidad citado por varias fuentes 2026: "8-12 skills bien elegidas cubren el 80% del
valor"; "solo las líneas que cambian una decisión de Claude se ganan un lugar" (artículo de
anti-patrones de CLAUDE.md).

Ningún lado del debate ganó entero — la síntesis de abajo es la resolución.

## Objetivo

Fase 1: un skill global invocable a mano, `claude-setup`, con dos modos (`audit` y
`scaffold`), que aplica el estándar ya verificado (oficial + checklist depurado del debate)
a cualquier proyecto — nuevo o existente — sin repetir esta investigación desde cero cada
vez.

## Fuera de alcance (Fase 1)

- Nada de `rules/` ni `agents/` template especulativos — se evalúan recién en Fase 2, con
  gatillo explícito, no antes.
- Nada de sincronización multi-máquina de `~/.claude` (patrón que trajo la investigación de
  comunidad vía dotfiles/git) — no es un problema que Facu tenga hoy.
- Sin `.mcp.json` template — no hay ningún servidor MCP en uso en ningún proyecto real
  todavía.
- Invocación automática por Claude: siempre `disable-model-invocation: true`. Lo dispara
  Facu a propósito, nunca es una decisión unilateral de Claude.

## Diseño

### Ubicación y archivos

```
~/.claude/skills/claude-setup/
├── SKILL.md             (instrucciones + los dos modos)
└── reference/
    └── estandar.md      (checklist condensado y verificado)
```

Dos archivos, no más. La propia investigación de comunidad marca "8-12 skills bien
elegidas cubren el 80%"; fragmentar de más (rules/templates/scripts) sin necesidad
concreta repite el error que el debate descartó para Fase 1.

### `SKILL.md` — frontmatter

```yaml
name: claude-setup
description: Audita o scaffoldea la carpeta .claude de un proyecto contra el estándar verificado (oficial + checklist propio). Se invoca a mano con /claude-setup audit o /claude-setup scaffold.
disable-model-invocation: true
argument-hint: <audit|scaffold>
```

### Modo `audit` (`/claude-setup audit`)

Repite, como comando repetible, lo que se hizo a mano hoy con ecommerce-perfumes:

1. Lee `CLAUDE.md`, `.claude/settings.json`, `.claude/settings.local.json`, `.gitignore`, y
   lista qué hay en `.claude/` del proyecto actual (`skills/`, `rules/`, `agents/`,
   `worktrees/`, etc.).
2. Compara contra `reference/estandar.md`.
3. Reporta: qué cumple, qué falta de forma accionable (con la línea exacta a agregar — como
   el fix de `.claude/worktrees/` de hoy), y qué hay de más que no se está usando.

No escribe nada por su cuenta — reporta y pregunta antes de tocar archivos, mismo criterio
de "acción reversible vs. confirmar antes" que ya se sigue en esta sesión.

### Modo `scaffold` (`/claude-setup scaffold`)

Para un proyecto nuevo (carpeta vacía o recién iniciada):

1. Pregunta lo mínimo: una línea de qué es el proyecto, comandos de build/test/lint si ya
   existen.
2. Genera un `CLAUDE.md` mínimo (patrón de "4 cosas" validado por la investigación: qué es,
   comandos, convenciones puntuales del proyecto, qué NO hacer) y un `.claude/settings.json`
   con permisos base.
3. Agrega al `.gitignore` las líneas estándar (`.claude/settings.local.json`,
   `CLAUDE.local.md`, `.claude/worktrees/`).

No crea `rules/`, `agents/` ni ningún otro directorio — coherente con la doc oficial ("la
mayoría de usuarios solo edita CLAUDE.md y settings.json").

### `reference/estandar.md`

Versión condensada (no la referencia completa del artifact de hoy, que queda como historial
del chat) de: estructura oficial proyecto + global, tabla de precedencia de settings.json,
qué se autolimpia (`cleanupPeriodDays`) y qué no, checklist de `.gitignore`, y la regla de
tamaño de CLAUDE.md (< 200 líneas; cada línea se pregunta si su ausencia haría que Claude se
equivoque).

## Fases

**Fase 1 (esta sesión):** construir los 2 archivos de arriba y probarlo corriendo
`/claude-setup audit` sobre ecommerce-perfumes mismo — ya sabemos cuál debería ser el
resultado (coincide con la auditoría manual de hoy), así que sirve de test de humo sin
depender de un segundo proyecto.

**Fase 2 (diferida — gatillo explícito, no fecha de calendario):** se dispara recién cuando
`claude-setup audit` se haya corrido a mano en 2-3 proyectos reales (candidato natural:
Brújula de Precios). Ahí, y solo ahí, se evalúa si algún patrón se repitió sin cambios en
los 3 casos — únicamente ese patrón se promueve a una carpeta `templates/` dentro del mismo
skill. Si en 2-3 usos no se repite nada, Fase 2 no se hace.

## Decisiones descartadas (y por qué)

- **Skill con audit + scaffold + templates de rules/agents desde el día 1** (postura
  maximalista): descartado — codificaría los sesgos de un solo proyecto (N=1) como si
  fueran estándar universal, antes de tener evidencia de que algo se repite.
- **No construir nada, solo un archivo de notas sin invocación** (postura minimalista
  pura): descartado en parte — la investigación confirmó que nadie más resolvió esto
  públicamente y que el costo de un skill de 2 archivos es bajo. Se adoptó, en cambio, su
  gatillo explícito para Fase 2 y su rechazo a contenido especulativo.
- **Sincronizar `~/.claude` entre máquinas (dotfiles + git)**: patrón real que trajo la
  investigación de comunidad, pero no es un problema que Facu tenga hoy — no se resuelve en
  este spec.

## Próximo paso

Auto-revisión de este spec, y de ahí directo a `writing-plans` para armar el plan de
implementación en fases, como pidió Facu explícitamente.
