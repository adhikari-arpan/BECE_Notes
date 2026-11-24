/**
 * POST /api/send-paper  (multipart form, from the /send-paper page)
 *
 * A past exam paper sent from the website, without GitHub: the file is checked, named
 * (`2024_Fall_DBMS.pdf`) and put in a new pull request on the public repository, exactly as if the
 * student had opened one. The usual checks and the watermark run on it, and nothing goes live until
 * the pull request is merged. The sender's name (if given) is kept in a `Contributed-by:` line, which
 * the Contributors page counts.
 *
 * Needs GITHUB_CONTRIB_TOKEN (Vercel environment variable): a fine-grained token for
 * adhikari-arpan/BECE_Notes with "Contents" and "Pull requests" set to read and write.
 *
 * Self-contained on purpose (no imports from the site): the subject folder and its short form are
 * checked against the repository itself.
 */

const REPO = 'adhikari-arpan/BECE_Notes';
const ROOT = 'Past Question Collection';
/** Vercel accepts request bodies up to 4.5 MB; the files themselves may use 4 MB of it. */
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 8;
/** At most this many website papers waiting for review at once (stops a flood). */
const MAX_PENDING = 30;
const BRANCH_PREFIX = 'paper/';

type Kind = 'pdf' | 'jpg' | 'png';

class Problem extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** What a file really is, from its first bytes (not its name). */
function kindOf(bytes: Uint8Array): Kind | null {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf'; // %PDF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  return null;
}

/** One line of plain text from a form field: no line breaks or markup, trimmed and capped. */
const clean = (v: FormDataEntryValue | null, max: number) =>
  (typeof v === 'string' ? v : '').replace(/[\r\n\t<>`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64');

async function github<T = unknown>(token: string, path: string, init: RequestInit = {}): Promise<{ status: number; data: T }> {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'bece-vault-send-paper',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, data: data as T };
}

async function must<T = unknown>(token: string, path: string, init?: RequestInit): Promise<T> {
  const { status, data } = await github<T>(token, path, init);
  if (status >= 300) {
    console.error('GitHub API', init?.method ?? 'GET', path, status, JSON.stringify(data).slice(0, 300));
    throw new Problem(502, 'Couldn’t save your paper right now. Please try again in a few minutes.');
  }
  return data;
}

const encode = (p: string) => p.split('/').map(encodeURIComponent).join('/');

export async function POST(request: Request): Promise<Response> {
  const token = process.env.GITHUB_CONTRIB_TOKEN;
  if (!token) return json(503, { error: 'Sending papers from the website isn’t switched on yet. Please use GitHub for now.' });

  try {
    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > MAX_BYTES + 256 * 1024) throw new Problem(413, 'That’s too big: the files can be 4 MB in total. Please compress the PDF and try again.');

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new Problem(400, 'Couldn’t read the form. Please try again.');
    }

    // Bots fill in every field, including this hidden one; real visitors never see it.
    if (clean(form.get('website'), 100)) return json(200, { ok: true });
    if (form.get('consent') !== 'yes') throw new Problem(400, 'Please confirm the paper can be shared.');

    const folder = clean(form.get('subject'), 80);
    const short = clean(form.get('short'), 8).toUpperCase();
    const year = Number(clean(form.get('year'), 4));
    const term = clean(form.get('term'), 6);
    const name = clean(form.get('name'), 60);
    const college = clean(form.get('college'), 60);
    const thisYear = new Date().getFullYear();
    if (!folder || /[/\\]|^\.|^College Assessments$/i.test(folder)) throw new Problem(400, 'Please choose the subject.');
    if (!/^[A-Z0-9]{1,8}$/.test(short)) throw new Problem(400, 'Please choose the subject.');
    if (!Number.isInteger(year) || year < 2000 || year > thisYear) throw new Problem(400, 'Please choose the year the exam was held.');
    if (term !== 'Spring' && term !== 'Fall') throw new Problem(400, 'Please choose Spring or Fall.');

    // The files: one PDF, or up to 8 photos (the page already turns photos into JPEGs).
    const files: { bytes: Uint8Array; kind: Kind }[] = [];
    let total = 0;
    for (const entry of form.getAll('file')) {
      if (typeof entry === 'string') continue;
      const bytes = new Uint8Array(await entry.arrayBuffer());
      const kind = kindOf(bytes);
      if (!kind) throw new Problem(400, 'Only PDF, JPG and PNG files can be sent.');
      total += bytes.length;
      files.push({ bytes, kind });
    }
    if (!files.length) throw new Problem(400, 'Please add the paper.');
    if (total > MAX_BYTES) throw new Problem(413, 'That’s too big: the files can be 4 MB in total. Please compress the PDF and try again.');
    if (files.some((f) => f.kind === 'pdf') && files.length > 1) throw new Problem(400, 'Send one PDF, or photos of the pages, but not both.');
    if (files.length > MAX_IMAGES) throw new Problem(400, `Up to ${MAX_IMAGES} photos per paper. Combine them into one PDF if there are more pages.`);

    // The subject's folder must exist, and its papers must use the same short form.
    const base = `${year}_${term}_${short}`;
    const listing = await github<{ name: string; type: string }[]>(token, `/contents/${encode(`${ROOT}/${folder}`)}?ref=main`);
    if (listing.status !== 200 || !Array.isArray(listing.data)) throw new Problem(400, 'Please choose the subject.');
    const existing = listing.data.filter((f) => f.type === 'file').map((f) => f.name);
    const shorts = new Set(existing.map((n) => /^\d{4}_(?:Spring|Fall)_([A-Za-z0-9]+)/.exec(n)?.[1]?.toUpperCase()).filter(Boolean));
    if (shorts.size && !shorts.has(short)) throw new Problem(400, 'Please choose the subject again (its short form didn’t match).');
    if (existing.some((n) => n.toLowerCase().startsWith(base.toLowerCase()))) {
      throw new Problem(409, `We already have the ${term} ${year} paper for this subject. Thank you anyway!`);
    }

    // Someone else may have sent the same paper already: it waits on its own branch.
    const branch = `${BRANCH_PREFIX}${short.toLowerCase()}-${year}-${term.toLowerCase()}`;
    const pending = await must<{ ref: string }[]>(token, `/git/matching-refs/heads/${BRANCH_PREFIX}`);
    if (pending.some((r) => r.ref === `refs/heads/${branch}`)) throw new Problem(409, `Someone already sent the ${term} ${year} paper for this subject. It’s waiting for review.`);
    if (pending.length >= MAX_PENDING) throw new Problem(429, 'A lot of papers are waiting for review right now. Please try again in a day or two.');

    const names = files.length === 1 ? [`${base}.${files[0].kind}`] : files.map((f, i) => `${base}_${i + 1}.${f.kind}`);

    // Commit the files on a new branch from main, then open the pull request.
    const head = await must<{ object: { sha: string } }>(token, '/git/ref/heads/main');
    const parent = await must<{ tree: { sha: string } }>(token, `/git/commits/${head.object.sha}`);
    const blobs = [];
    for (const f of files) {
      blobs.push(await must<{ sha: string }>(token, '/git/blobs', { method: 'POST', body: JSON.stringify({ content: toBase64(f.bytes), encoding: 'base64' }) }));
    }
    const tree = await must<{ sha: string }>(token, '/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: parent.tree.sha, tree: blobs.map((b, i) => ({ path: `${ROOT}/${folder}/${names[i]}`, mode: '100644', type: 'blob', sha: b.sha })) }),
    });
    const sender = name || 'Anonymous';
    const credit = `Contributed-by: ${sender}${college ? `, ${college}` : ''}`;
    const title = `Questions: ${folder} ${year} ${term}`;
    const commit = await must<{ sha: string }>(token, '/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: `${title}\n\nSent from the website (/send-paper).\n\n${credit}`,
        tree: tree.sha,
        parents: [head.object.sha],
        author: { name: sender, email: 'website-upload@notes.arpanadhikari7.com.np', date: new Date().toISOString() },
      }),
    });
    await must(token, '/git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }) });

    const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
    const pr = await must<{ number: number; html_url: string }>(token, '/pulls', {
      method: 'POST',
      body: JSON.stringify({
        title,
        head: branch,
        base: 'main',
        body: [
          'A past paper sent from the website ([/send-paper](https://notes.arpanadhikari7.com.np/send-paper)).',
          '',
          '| | |',
          '|---|---|',
          `| Subject | ${folder} (\`${short}\`) |`,
          `| Exam | ${term} ${year} |`,
          `| File${names.length > 1 ? 's' : ''} | ${names.map((n, i) => `\`${n}\` (${kb(files[i].bytes.length)})`).join('<br>')} |`,
          `| Sent by | ${sender}${college ? `, ${college}` : ''} |`,
          '',
          '**Before merging:** open the file and check it is this subject’s Pokhara University paper for this exam, and that it’s readable.',
          'Use **Squash and merge** and keep the line below in the commit message: it credits the sender on the Contributors page.',
          '',
          credit,
        ].join('\n'),
      }),
    });
    // A label makes these easy to find; not needed for anything else.
    await github(token, `/issues/${pr.number}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['website upload'] }) });

    return json(200, { ok: true, files: names, pullRequest: pr.html_url });
  } catch (err) {
    if (err instanceof Problem) return json(err.status, { error: err.message });
    console.error(err);
    return json(500, { error: 'Something went wrong. Please try again.' });
  }
}
