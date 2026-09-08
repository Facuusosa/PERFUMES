// PreToolUse(Write): bloquea guardar .png en public/images/perfumes/.
// El proyecto solo usa WebP ahi -- fotos PNG sin comprimir ya causaron
// que Netlify pausara el sitio por exceso de bandwidth (ver CLAUDE.md).
let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = (input.tool_input && input.tool_input.file_path) || '';
    const normalized = filePath.replace(/\\/g, '/');
    if (/public\/images\/perfumes\/[^/]*\.png$/i.test(normalized)) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason:
            'Este proyecto solo usa WebP en public/images/perfumes/ (ya hubo un incidente de hosting por PNG sin comprimir). ' +
            'Convertir primero con: node scripts/optimize-images.mjs <carpeta-origen> public/images/perfumes',
        },
      }));
    }
  } catch {
    // input no parseable: no bloquear
  }
});
