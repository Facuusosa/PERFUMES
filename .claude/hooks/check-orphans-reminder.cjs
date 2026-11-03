// SessionStart: avisa si hay archivos/carpetas sin trackear en git hace mas de
// una semana -- señal de que quedaron sueltos y nadie los revisó (huerfanos,
// prototipos, exports de prueba). No los toca, solo recuerda correr /limpiar
// (Facu pidió 2026-09-07 que esto sea automatico porque se olvida de correrlo).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DIAS_AVISO = 7;
const MS_AVISO = DIAS_AVISO * 24 * 60 * 60 * 1000;

try {
  const output = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  const untracked = output
    .split('\n')
    .filter((line) => line.startsWith('?? '))
    .map((line) => line.slice(3).trim());

  const viejos = [];
  for (const entry of untracked) {
    const full = path.join(ROOT, entry.replace(/\/$/, ''));
    try {
      const stat = fs.statSync(full);
      if (Date.now() - stat.mtimeMs > MS_AVISO) viejos.push(entry);
    } catch {
      // pudo haberse borrado entre el status y el stat -- ignorar
    }
  }

  if (viejos.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext:
          `Aviso automático de limpieza -- hay ${viejos.length} archivo(s)/carpeta(s) sin ` +
          `trackear en git hace más de ${DIAS_AVISO} días (puede ser algo suelto que nadie ` +
          `revisó):\n${viejos.map((v) => `- ${v}`).join('\n')}\n` +
          `Sugerir a Facu correr /limpiar para revisar si hay algo para sacar.`,
      },
    }));
  }
} catch {
  // si algo falla (no es repo git, etc.) no bloquear el arranque de la sesión
}
