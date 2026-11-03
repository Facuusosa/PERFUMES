// PostToolUse(Edit|Write): corre `npm run typecheck` cuando se toca un
// archivo .ts/.tsx, y si falla le devuelve los errores a Claude al toque
// en vez de esperar al proximo build.
const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath =
      (input.tool_input && input.tool_input.file_path) ||
      (input.tool_response && input.tool_response.filePath) ||
      '';
    if (!/\.(ts|tsx)$/.test(filePath)) return;

    try {
      // Comando fijo (sin datos externos interpolados) -- execSync es seguro aca.
      execSync('npm run typecheck --silent', { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      const out = `${err.stdout || ''}${err.stderr || ''}`.trim();
      console.log(JSON.stringify({
        decision: 'block',
        reason: `Errores de TypeScript despues de este cambio:\n${out}`,
      }));
    }
  } catch {
    // input no parseable: no hacer nada
  }
});
