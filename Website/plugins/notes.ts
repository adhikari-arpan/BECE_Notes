import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

/**
 * Scans the notes folders in the repository root (Semester_*, Electives, ...)
 * and exposes them to the app as `virtual:notes-manifest`.
 *
 * - Dev server: files are served straight from the repo at `/notes/<repo path>`.
 * - Build: files are linked from GitHub (raw / LFS media), so the 2+ GB of notes
 *   never have to be copied into `dist`.
 */

export interface NotesPluginOptions {
  /** Absolute path of the repository root that holds the notes folders. */
  repoRoot: string;
  /** GitHub `owner/name`, used for production file links. */
  repo: string;
  branch: string;
  /** Override the base URL files are loaded from in production builds. */
  fileBaseUrl?: string;
}

export interface ManifestEntry {
  /** Repo-relative path with forward slashes, e.g. `Semester_1/Calculus-I/Notes.pdf`. */
  path: string;
  size: number;
  /** ISO date of the last commit touching the file (falls back to mtime). */
  updated: string | null;
  /** Stored in Git LFS — must be fetched from the LFS media host. */
  lfs: boolean;
}

const VIRTUAL_ID = 'virtual:notes-manifest';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const URL_PREFIX = '/notes/';

const ROOT_DIR_PATTERN = /^(Semester_\d+|Electives|Engineering Entrance Preparation)$/;
const IGNORED_NAMES = new Set(['desktop.ini', 'Thumbs.db', '.DS_Store']);

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.c': 'text/plain; charset=utf-8',
  '.cpp': 'text/plain; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.java': 'text/plain; charset=utf-8',
  '.vhdl': 'text/plain; charset=utf-8',
  '.ipynb': 'application/json; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.doc': 'application/msword',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.xls': 'application/vnd.ms-excel',
};

function listNoteRoots(repoRoot: string): string[] {
  return fs
    .readdirSync(repoRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && ROOT_DIR_PATTERN.test(d.name))
    .map((d) => d.name);
}

function walk(dir: string, repoRoot: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('~$') || IGNORED_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, repoRoot, out);
    else if (entry.isFile()) out.push(path.relative(repoRoot, full).split(path.sep).join('/'));
  }
}

function git(repoRoot: string, args: string[], input?: string): string | null {
  try {
    return execFileSync('git', ['-c', 'core.quotePath=false', ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      input,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

/** Map of path -> ISO date of the most recent commit touching it, from a single `git log` pass. */
function lastCommitDates(repoRoot: string, roots: string[]): Map<string, string> {
  const dates = new Map<string, string>();
  const log = git(repoRoot, ['log', '--no-renames', '--name-only', '--format=%x1e%cI', 'HEAD', '--', ...roots]);
  if (!log) return dates;
  for (const record of log.split('\x1e')) {
    const [date, ...files] = record.split('\n');
    for (const file of files) if (file && !dates.has(file)) dates.set(file, date.trim());
  }
  return dates;
}

function lfsPaths(repoRoot: string, roots: string[]): Set<string> {
  const out = git(repoRoot, ['ls-files', '-z', '--', ...roots]);
  if (!out) return new Set();
  // `check-attr -z` output is NUL-separated triples: <path> <attribute> <value>
  const attrs = (git(repoRoot, ['check-attr', '-z', '--stdin', 'filter'], out) ?? '').split('\0');
  const lfs = new Set<string>();
  for (let i = 0; i + 2 < attrs.length; i += 3) {
    if (attrs[i + 2] === 'lfs') lfs.add(attrs[i]);
  }
  return lfs;
}

function buildManifest(repoRoot: string, trackedOnly: boolean): ManifestEntry[] {
  const roots = listNoteRoots(repoRoot);
  let files: string[] = [];
  for (const root of roots) walk(path.join(repoRoot, root), repoRoot, files);

  // Production links point at GitHub, so only committed files will resolve there.
  if (trackedOnly) {
    const tracked = git(repoRoot, ['ls-files', '-z', '--', ...roots]);
    if (tracked) {
      const set = new Set(tracked.split('\0'));
      files = files.filter((f) => set.has(f));
    }
  }

  const dates = lastCommitDates(repoRoot, roots);
  const lfs = lfsPaths(repoRoot, roots);

  return files
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((file) => {
      const stat = fs.statSync(path.join(repoRoot, file));
      return {
        path: file,
        size: stat.size,
        updated: dates.get(file) ?? stat.mtime.toISOString(),
        lfs: lfs.has(file),
      };
    });
}

function serveNotes(server: ViteDevServer, repoRoot: string) {
  const roots = new Set(listNoteRoots(repoRoot));
  server.middlewares.use(URL_PREFIX, (req, res, next) => {
    let rel: string;
    try {
      rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '');
    } catch {
      return next();
    }
    const full = path.resolve(repoRoot, rel);
    const inRoot = full.startsWith(repoRoot + path.sep) && roots.has(rel.split('/')[0]);
    if (!inRoot || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    const ext = path.extname(full).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
    res.setHeader('Content-Length', fs.statSync(full).size);
    fs.createReadStream(full).pipe(res);
  });
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/**
 * Plain HTML summary of the collection, placed inside #root at build time. Search engines
 * read real text immediately; React replaces it as soon as the app mounts.
 */
function crawlableSummary(entries: ManifestEntry[]): string {
  const bySection = new Map<string, Map<string, number>>();
  for (const { path: file } of entries) {
    const [root, folder] = file.split('/');
    const subject = file.split('/').length > 2 ? folder.replace(/^_+/, '') : 'General resources';
    const subjects = bySection.get(root) ?? new Map<string, number>();
    subjects.set(subject, (subjects.get(subject) ?? 0) + 1);
    bySection.set(root, subjects);
  }
  const sections = [...bySection.entries()]
    // Semesters first (in order), then electives and other collections.
    .sort(([a], [b]) => Number(!a.startsWith('Semester_')) - Number(!b.startsWith('Semester_')) || a.localeCompare(b, undefined, { numeric: true }))
    .map(([root, subjects]) => {
      const n = /^Semester_(\d+)$/.exec(root)?.[1];
      const title = n
        ? `Semester ${ROMAN[Number(n)] ?? n} notes: Pokhara University BE Computer Engineering`
        : root === 'Electives' ? 'Elective subject notes' : `${root} notes`;
      const items = [...subjects.entries()].map(([name, count]) => `<li>${escapeHtml(name)} (${count} ${count === 1 ? 'file' : 'files'})</li>`).join('');
      const href = n ? `/semester-${n}` : root === 'Electives' ? '/electives' : '';
      const heading = href ? `<a href="${href}">${escapeHtml(title)}</a>` : escapeHtml(title);
      return `<section><h2>${heading}</h2><ul>${items}</ul></section>`;
    })
    .join('');
  return `<main><h1>BECE Notes: Pokhara University Computer Engineering notes</h1>` +
    `<p>Free semester-wise study notes for the Bachelor of Engineering in Computer Engineering (BECE) program under Pokhara University, Nepal: ` +
    `lecture notes, handwritten notes, question collections, past exam questions, lab reports and syllabus. ${entries.length} files in total.</p>` +
    `${sections}</main>`;
}

export function notesPlugin(options: NotesPluginOptions): Plugin {
  const repoRoot = path.resolve(options.repoRoot);
  let isBuild = false;

  return {
    name: 'bece-notes',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const { repo, branch } = options;
      const config = isBuild
        ? {
            fileBase: options.fileBaseUrl ?? `https://raw.githubusercontent.com/${repo}/${branch}/`,
            lfsBase: options.fileBaseUrl ?? `https://media.githubusercontent.com/media/${repo}/${branch}/`,
          }
        : {
            fileBase: URL_PREFIX,
            lfsBase: URL_PREFIX,
          };
      const entries = buildManifest(repoRoot, isBuild);
      return `export const config = ${JSON.stringify(config)};\nexport const entries = ${JSON.stringify(entries)};\n`;
    },
    transformIndexHtml(html) {
      if (!isBuild) return html;
      return html.replace('<div id="root"></div>', `<div id="root">${crawlableSummary(buildManifest(repoRoot, true))}</div>`);
    },
    configureServer(server) {
      serveNotes(server, repoRoot);

      // Rebuild the manifest when notes are added, removed or replaced.
      const roots = listNoteRoots(repoRoot).map((r) => path.join(repoRoot, r));
      server.watcher.add(roots);
      const refresh = (file: string) => {
        if (!roots.some((r) => file.startsWith(r + path.sep))) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (!mod) return;
        server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
      server.watcher.on('change', refresh);
    },
  };
}
