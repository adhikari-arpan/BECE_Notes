// For the pull request check only: GitHub's machine checks out just .github/ and Website/ because the
// notes are too big to download. The site is built from the list of files on disk, so every missing
// tracked file gets an empty stand-in. Run from Website/.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const files = execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean);

let created = 0;
for (const file of files) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) continue;
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, '');
  created++;
}
console.log(`Created ${created} empty stand-ins for ${files.length} tracked files.`);
