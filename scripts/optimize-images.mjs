import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';

const SRC_DIR = process.argv[2];
const OUT_DIR = process.argv[3];
const MAX_DIM = 1600;
const QUALITY = 85;

if (!SRC_DIR || !OUT_DIR) {
  console.error('Uso: node scripts/optimize-images.mjs <carpeta-origen-png> <carpeta-destino-webp>');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR).filter(f => extname(f).toLowerCase() === '.png');

let totalBefore = 0;
let totalAfter = 0;
const results = [];

for (const file of files) {
  const srcPath = join(SRC_DIR, file);
  const name = basename(file, extname(file));
  const outPath = join(OUT_DIR, `${name}.webp`);

  const before = statSync(srcPath).size;

  const img = sharp(srcPath);
  const meta = await img.metadata();
  const needsResize = Math.max(meta.width, meta.height) > MAX_DIM;

  let pipeline = img;
  if (needsResize) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_DIM : null,
      height: meta.height > meta.width ? MAX_DIM : null,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  await pipeline.webp({ quality: QUALITY }).toFile(outPath);

  const after = statSync(outPath).size;
  totalBefore += before;
  totalAfter += after;
  results.push({ file, before, after, resized: needsResize, origDim: `${meta.width}x${meta.height}` });
}

results.sort((a, b) => b.before - a.before);
for (const r of results) {
  console.log(`${r.file.padEnd(45)} ${r.origDim.padEnd(12)} ${(r.before/1024/1024).toFixed(2)}MB -> ${(r.after/1024).toFixed(0)}KB  ${r.resized ? '(resized)' : ''}`);
}

console.log('---');
console.log(`TOTAL: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB (${(100 - totalAfter/totalBefore*100).toFixed(1)}% reduccion)`);
console.log(`Archivos procesados: ${results.length}`);
