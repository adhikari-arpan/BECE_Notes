#!/usr/bin/env node
/**
 * Keeps the two repositories in step:
 *   - BECE_Notes-originals (private): the clean files. The owner pushes here.
 *   - BECE_Notes (public): the same content, with every PDF and image watermarked.
 *
 * Commands (run by the workflows in .github/workflows):
 *   publish  <originals> <public> <before> <after>   replay new private commits onto the public repo, stamped
 *   pr       <pr-checkout> <base-sha> <originals> <pr-number>
 *                                                    stamp a pull request's new PDFs/images in place and keep
 *                                                    the clean versions on branch incoming/pr-<n> of the originals
 *   syncback <public> <originals> <before> <after>   copy merged public commits back to the private repo,
 *                                                    using the clean versions saved for that pull request
 *
 * Every replayed commit keeps its author, date and message; only the committer is the bot. Commits made
 * by the bot are skipped by the other direction, so nothing loops.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const BOT = { name: 'BECE Vault Bot', email: 'bot@notes.arpanadhikari7.com.np' };
const MEDIA = /\.(pdf|jpe?g|png)$/i;
const ZERO = /^0+$/;
const WATERMARK = path.resolve(process.env.WATERMARK_SCRIPT ?? 'Website/scripts/watermark.mjs');

const git = (cwd, args, opts = {}) =>
  execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd, encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const gitBuf = (cwd, args) => execFileSync('git', args, { cwd, maxBuffer: 1 << 30 });

/** Watermarks the given files in place (skips ones already stamped). */
function stamp(files) {
  if (!files.length) return;
  execFileSync('node', [WATERMARK, ...files], { stdio: 'inherit' });
}
function unstamped(files) {
  if (!files.length) return [];
  try {
    execFileSync('node', [WATERMARK, '--check', ...files], { encoding: 'utf8' });
    return [];
  } catch (err) {
    return String(err.stdout).split('\n').filter((l) => l.startsWith('unstamped  ')).map((l) => l.slice(11).trim());
  }
}

/** Commits in before..after (oldest first) not made by the bot, with their metadata. */
function commitsToReplay(repo, before, after) {
  const range = ZERO.test(before) ? after : `${before}..${after}`;
  const out = git(repo, ['log', '--reverse', '--first-parent', '--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%cn%x1f%ce%x1f%B%x1e', range]);
  return out.split('\x1e').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [sha, an, ae, ad, cn, ce, ...msg] = r.split('\x1f');
    return { sha, an, ae, ad, cn, ce, message: msg.join('\x1f').trim() };
  }).filter((c) => c.ce !== BOT.email);
}

/** Files changed by a commit against its first parent: [status, path, newPath?]. */
function changes(repo, sha) {
  const out = git(repo, ['diff-tree', '-r', '-M', '--no-commit-id', '--name-status', '-z', '--root', sha]);
  const parts = out.split('\0').filter((p, i, a) => i < a.length - 1 || p);
  const list = [];
  for (let i = 0; i < parts.length;) {
    const status = parts[i++];
    if (status[0] === 'R' || status[0] === 'C') list.push([status[0], parts[i++], parts[i++]]);
    else list.push([status[0], parts[i++]]);
  }
  return list;
}

function writeFrom(srcRepo, sha, file, destRepo, destFile = file) {
  const dest = path.join(destRepo, destFile);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, gitBuf(srcRepo, ['show', `${sha}:${file}`]));
  return dest;
}

function commitAs(repo, c, extraMessage = '') {
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--allow-empty', '-q', '-m', c.message + extraMessage], {
    env: { ...process.env, GIT_AUTHOR_NAME: c.an, GIT_AUTHOR_EMAIL: c.ae, GIT_AUTHOR_DATE: c.ad,
      GIT_COMMITTER_NAME: BOT.name, GIT_COMMITTER_EMAIL: BOT.email },
  });
}

/** Applies one commit's changes from `src` into `dest`; `media(path)` decides what to do with PDFs/images. */
function applyCommit(src, dest, c, onMedia) {
  for (const [status, a, b] of changes(src, c.sha)) {
    if (status === 'D') { fs.rmSync(path.join(dest, a), { force: true }); continue; }
    if (status === 'R') fs.rmSync(path.join(dest, a), { force: true });
    const file = status === 'R' || status === 'C' ? b : a;
    const written = writeFrom(src, c.sha, file, dest);
    if (MEDIA.test(file)) onMedia(file, written);
  }
}

/* ------------------------------------------------------------------ */

function publish(originals, pub, before, after) {
  const commits = commitsToReplay(originals, before, after);
  for (const c of commits) {
    const media = [];
    applyCommit(originals, pub, c, (_, written) => media.push(written));
    stamp(media);
    commitAs(pub, c);
    console.log(`published ${c.sha.slice(0, 8)} ${c.message.split('\n')[0]}`);
  }
  if (commits.length) git(pub, ['push', 'origin', 'HEAD:main']);
}

function pr(prRepo, baseSha, originals, number) {
  const files = git(prRepo, ['diff', '--name-only', '--diff-filter=AMR', '-z', `${baseSha}...HEAD`]).split('\0').filter((f) => MEDIA.test(f));
  // `unstamped` returns the paths exactly as passed.
  const todo = new Set(unstamped(files.map((f) => path.join(prRepo, f))));
  const pending = files.filter((f) => todo.has(path.join(prRepo, f)));
  if (!pending.length) { console.log('All PDFs and images in this pull request are watermarked.'); return; }

  // Keep the clean versions privately before anything is changed.
  const branch = `incoming/pr-${number}`;
  try { git(originals, ['fetch', 'origin', branch]); git(originals, ['checkout', '-B', branch, 'FETCH_HEAD']); }
  catch { git(originals, ['checkout', '-B', branch, 'origin/main']); }
  for (const f of pending) {
    const dest = path.join(originals, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(prRepo, f), dest);
  }
  git(originals, ['add', '-A']);
  git(originals, ['commit', '-q', '--allow-empty', '-m', `Originals from pull request #${number}`],
    { env: { ...process.env, GIT_AUTHOR_NAME: BOT.name, GIT_AUTHOR_EMAIL: BOT.email, GIT_COMMITTER_NAME: BOT.name, GIT_COMMITTER_EMAIL: BOT.email } });
  git(originals, ['push', '-f', 'origin', `${branch}:${branch}`]);

  stamp(pending.map((f) => path.join(prRepo, f)));
  git(prRepo, ['add', '-A']);
  git(prRepo, ['commit', '-q', '-m', 'Add BECE Vault watermark'],
    { env: { ...process.env, GIT_AUTHOR_NAME: BOT.name, GIT_AUTHOR_EMAIL: BOT.email, GIT_COMMITTER_NAME: BOT.name, GIT_COMMITTER_EMAIL: BOT.email } });
  git(prRepo, ['push', 'origin', 'HEAD']);
  console.log(`Watermarked ${pending.length} file(s); the check will run again on the new commit.`);
}

function syncback(pub, originals, before, after) {
  const commits = commitsToReplay(pub, before, after);
  const branches = git(originals, ['ls-remote', '--heads', 'origin', 'incoming/*']).split('\n').filter(Boolean).map((l) => l.split('\trefs/heads/')[1]);
  let stampedAfter = [];
  for (const c of commits) {
    // A squash merge's message ends with "(#12)": its clean originals are on incoming/pr-12.
    const prNumber = /\(#(\d+)\)\s*$/m.exec(c.message.split('\n')[0])?.[1];
    const branch = prNumber && branches.includes(`incoming/pr-${prNumber}`) ? `incoming/pr-${prNumber}` : null;
    if (branch) git(originals, ['fetch', '-q', 'origin', `${branch}:${branch}`]);
    const unstampedHere = [];
    applyCommit(pub, originals, c, (file, written) => {
      if (branch) {
        try { fs.writeFileSync(written, gitBuf(originals, ['show', `${branch}:${file}`])); return; } catch { /* not saved: keep public copy */ }
      }
      unstampedHere.push(file);
    });
    commitAs(originals, c);
    stampedAfter.push(...unstamped(unstampedHere.map((f) => path.join(pub, f))));
    if (branch) git(originals, ['push', 'origin', '--delete', branch]);
    console.log(`synced ${c.sha.slice(0, 8)} ${c.message.split('\n')[0]}`);
  }
  if (commits.length) git(originals, ['push', 'origin', 'HEAD:main']);

  // Safety net: anything that reached public main without a watermark (e.g. edited on GitHub) is stamped now.
  stampedAfter = [...new Set(stampedAfter)];
  if (stampedAfter.length) {
    stamp(stampedAfter);
    git(pub, ['add', '-A']);
    git(pub, ['commit', '-q', '-m', 'Add BECE Vault watermark'],
      { env: { ...process.env, GIT_AUTHOR_NAME: BOT.name, GIT_AUTHOR_EMAIL: BOT.email, GIT_COMMITTER_NAME: BOT.name, GIT_COMMITTER_EMAIL: BOT.email } });
    git(pub, ['push', 'origin', 'HEAD:main']);
  }
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'publish') publish(...args);
else if (cmd === 'pr') pr(...args);
else if (cmd === 'syncback') syncback(...args);
else { console.error('usage: sync.mjs publish|pr|syncback ...'); process.exit(2); }
