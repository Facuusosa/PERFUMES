// SessionStart: avisa si alguna carpeta de trabajo (gitignored, no de codigo)
// pesa mas de lo esperado -- para agarrar backups/exports que quedan
// olvidados y comen espacio en disco sin que nadie los mire (ver limpieza
// 2026-08-30: assets-originales-fotos-perfumes/ eran 114 MB redundantes
// porque ya estaban a salvo en el historial de git).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const IGNORE_ALWAYS = new Set(['node_modules', 'dist', '.git', '.superpowers']);
// Carpetas de trabajo conocidas y su limite razonable en MB antes de avisar.
const KNOWN_LIMITS_MB = { 'fotos-clienta': 250 };
const UNKNOWN_FOLDER_LIMIT_MB = 20; // cualquier carpeta nueva no listada arriba

function sizeMB(dir) {
  let bytes = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) bytes += sizeMB(full) * 1024 * 1024;
    else bytes += fs.statSync(full).size;
  }
  return bytes / 1024 / 1024;
}

function isGitIgnored(name) {
  try {
    require('child_process').execFileSync('git', ['check-ignore', '-q', name], { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

try {
  const warnings = [];
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || IGNORE_ALWAYS.has(entry.name)) continue;
    if (!isGitIgnored(entry.name)) continue; // solo carpetas fuera de git

    const mb = Math.round(sizeMB(path.join(ROOT, entry.name)));
    const limit = KNOWN_LIMITS_MB[entry.name] ?? UNKNOWN_FOLDER_LIMIT_MB;
    if (mb > limit) {
      warnings.push(`- ${entry.name}/ pesa ${mb} MB (esperado hasta ${limit} MB)`);
    }
  }

  if (warnings.length) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext:
          'Aviso automatico de espacio en disco -- estas carpetas fuera de git pesan mas de lo esperado, revisar si sobra algo:\n' +
          warnings.join('\n'),
      },
    }));
  }
} catch {
  // si algo falla (no es repo git, etc.) no bloquear el arranque de la sesion
}
