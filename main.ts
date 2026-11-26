// DompetKeluarga — program pengantar entri (Node 22, pustaka standar saja).
//
// Menyalin situs statis di app/ dan tangkapan layar di screenshots/ ke
// direktori keluaran, lalu menulis dossier.json memakai pustaka vendored
// dari make.fun. Di luar wadah grader, MAKEFUN_OUTPUT_DIR menggantikan
// /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts harus dibiarkan apa adanya: pemeriksa
// membandingkan dossier.json dengan yang ditulis salinannya sendiri.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(rootDir, 'app'), join(outDir, 'app'), { recursive: true });

mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(rootDir, 'screenshots'))) {
  cpSync(join(rootDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Batas yang sama dengan yang dipakai pemeriksa: teks dossier dibatasi
// 160 KiB, maksimal 4 tangkapan layar @ 256 KiB, app/ maksimal 993
// berkas dan 16 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
