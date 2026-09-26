import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Serves pdf.js's runtime data files at `/pdfjs/…`: WebAssembly image decoders (fax/CCITT and
 * JBIG2 scans, JPEG 2000), character maps, standard fonts and colour profiles. pdf.js loads these
 * on demand; without them it silently skips those images and many scanned notes render blank.
 * They come straight from the installed pdfjs-dist package so they always match its version.
 */

const DIRS = ['wasm', 'cmaps', 'standard_fonts', 'iccs'];
const URL_PREFIX = '/pdfjs/';

const MIME: Record<string, string> = {
  '.wasm': 'application/wasm',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.bcmap': 'application/octet-stream',
  '.pfb': 'application/octet-stream',
  '.ttf': 'font/ttf',
  '.icc': 'application/vnd.iccprofile',
};

function listFiles(dir: string, base = dir): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return listFiles(full, base);
    return [path.relative(base, full).split(path.sep).join('/')];
  });
}

export function pdfjsAssetsPlugin(): Plugin {
  let root = '';
  const pkgDir = () => path.dirname(createRequire(path.join(root, 'package.json')).resolve('pdfjs-dist/package.json'));

  return {
    name: 'pdfjs-assets',
    configResolved(config) {
      root = config.root;
    },
    // Dev server: stream the files from node_modules.
    configureServer(server) {
      server.middlewares.use(URL_PREFIX, (req, res, next) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
        if (!DIRS.includes(rel.split('/')[0])) return next();
        const full = path.resolve(pkgDir(), rel);
        if (!full.startsWith(pkgDir() + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) return next();
        res.setHeader('Content-Type', MIME[path.extname(full)] ?? 'application/octet-stream');
        fs.createReadStream(full).pipe(res);
      });
    },
    // Build: copy them into dist/pdfjs/.
    generateBundle() {
      for (const dir of DIRS) {
        const src = path.join(pkgDir(), dir);
        if (!fs.existsSync(src)) continue;
        for (const rel of listFiles(src)) {
          this.emitFile({ type: 'asset', fileName: `pdfjs/${dir}/${rel}`, source: fs.readFileSync(path.join(src, rel)) });
        }
      }
    },
  };
}
