/**
 * POST /api/send-paper  (multipart form, from the /send-paper page)
 *
 * A past exam paper sent from the website, without GitHub: the file is checked, named
 * (`2024_Fall_DBMS.pdf`) and put in a new pull request on the public repository, exactly as if the
 * student had opened one. The usual checks and the watermark run on it, and nothing goes live until
 * the pull request is merged. The sender's name (if given) is kept in a `Contributed-by:` line, which
 * the Contributors page counts.
 *
 * Emails (optional, if the sender gives an address): "we got your paper" is sent from here, and "it's
 * live" by .github/workflows/paper-merged.yml when the pull request is merged. The pull request is
 * public, so the address is stored in it encrypted (a hidden `<!-- notify:… -->` comment) that only
 * NOTIFY_KEY can open; it isn't kept anywhere else.
 *
 * Vercel environment variables:
 *   GITHUB_CONTRIB_TOKEN  fine-grained token for adhikari-arpan/BECE_Notes: "Contents" and "Pull requests" read and write
 *   RESEND_API_KEY        Resend API key (emails); without it no emails are sent
 *   NOTIFY_KEY            32 random bytes, base64: the same value as the GitHub secret of that name
 *   MAIL_FROM             optional, default "BECE Vault <papers@notes.arpanadhikari7.com.np>"
 *
 * Self-contained on purpose (no imports from the site): the subject folder and its short form are
 * checked against the repository itself.
 */
import { createCipheriv, randomBytes } from 'node:crypto';

const REPO = 'adhikari-arpan/BECE_Notes';
const SITE = 'https://notes.arpanadhikari7.com.np';
const MAIL_FROM = process.env.MAIL_FROM || 'BECE Vault <papers@notes.arpanadhikari7.com.np>';
const ROOT = 'Past Question Collection';
/** Vercel accepts request bodies up to 4.5 MB; the PDF itself may use 4 MB of it. */
const MAX_BYTES = 4 * 1024 * 1024;
/** At most this many website papers waiting for review at once (stops a flood). */
const MAX_PENDING = 30;
const BRANCH_PREFIX = 'paper/';

class Problem extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** True if the file really is a PDF, from its first bytes ("%PDF"), not its name. */
const isPdf = (bytes: Uint8Array) => bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

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

/** What the "it's live" email needs, sealed with AES-256-GCM so it can sit in the public pull request. */
interface Notice {
  email: string;
  name: string;
  subject: string;
  exam: string;
  link: string;
}

function seal(notice: Notice): string | null {
  const key = Buffer.from(process.env.NOTIFY_KEY ?? '', 'base64');
  if (key.length !== 32) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(notice), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Sends one email through Resend. A failed email never fails the submission. */
async function sendMail(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text, html }),
    });
    if (!res.ok) console.error('Resend', res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error('Resend', err);
  }
}

/** "We got your paper": plain and simple, in the site's colours. */
function receivedMail(n: Notice) {
  const hi = n.name ? `Hi ${n.name},` : 'Hi,';
  const text = [
    hi,
    '',
    `Thank you for sending the ${n.subject} paper (${n.exam}) to BECE Vault.`,
    'It’s now waiting for a quick check. We’ll email you again as soon as it’s live on the site, usually within a few days.',
    '',
    'Every paper helps the next batch prepare.',
    '',
    `BECE Vault · ${SITE}`,
  ].join('\n');
  const html = mailLayout({
    preheader: 'Your paper is waiting for a quick check.',
    badge: 'Received',
    heading: 'We got your paper!',
    body: `<p style="margin:0 0 14px">${escapeHtml(hi)}</p>
<p style="margin:0 0 14px">Thank you for sending the <strong>${escapeHtml(n.subject)}</strong> paper (${escapeHtml(n.exam)}) to BECE Vault.</p>
<p style="margin:0 0 14px">It’s now waiting for a quick check. We’ll email you again as soon as it’s live on the site, usually within a few days.</p>
<p style="margin:0">Every paper helps the next batch prepare. 🙌</p>`,
    button: { label: 'Browse past questions', href: `${SITE}/past-questions` },
  });
  return { subject: `We got your paper: ${n.subject}, ${n.exam}`, text, html };
}

/**
 * The emails' look (the same in .github/scripts/paper-merged.mjs): the logo on a dark green band, a white
 * card, a gold button. Tables and inline styles, because that's what every email app shows reliably.
 */
function mailLayout(m: { preheader: string; badge: string; heading: string; body: string; button?: { label: string; href: string } }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f3f1e8">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(m.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1e8;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;border-radius:18px;overflow:hidden;background:#ffffff;border:1px solid #e6e0c8;font-family:Arial,Helvetica,sans-serif;color:#0b1f1a">
<tr><td align="center" style="background:#0f2a22;padding:26px 24px 20px">
<a href="${SITE}" style="text-decoration:none"><img src="${SITE}/images/logo.png" width="110" alt="BECE Vault" style="display:block;width:110px;height:auto;border:0;margin:0 auto 10px"></a>
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:.5px;color:#f0c34a">BECE Vault</div>
</td></tr>
<tr><td style="padding:28px 30px 8px">
<span style="display:inline-block;padding:4px 12px;border-radius:99px;background:#fff4cf;color:#7a5a0c;font-size:12px;font-weight:700">${escapeHtml(m.badge)}</span>
<h1 style="margin:14px 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#0b1f1a">${escapeHtml(m.heading)}</h1>
<div style="font-size:15px;line-height:1.65;color:#2b3d36">${m.body}</div>
</td></tr>
${m.button ? `<tr><td style="padding:22px 30px 6px"><a href="${m.button.href}" style="display:inline-block;padding:13px 26px;border-radius:99px;background:#f0c34a;color:#0b1f1a;font-size:15px;font-weight:700;text-decoration:none">${escapeHtml(m.button.label)}</a></td></tr>` : ''}
<tr><td style="padding:26px 30px 28px"><div style="border-top:1px solid #eee8d3;padding-top:16px;font-size:12px;line-height:1.6;color:#7d8b84">
You’re getting this because you sent a paper on <a href="${SITE}/send-paper" style="color:#b8860b">BECE Vault</a>. <br>
<a href="${SITE}" style="color:#b8860b;text-decoration:none">notes.arpanadhikari7.com.np</a>
</div></td></tr>
</table>
</td></tr></table>
</body></html>`;
}

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
    const email = clean(form.get('email'), 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) throw new Problem(400, 'That email address doesn’t look right.');
    // The subject's past questions page, for the "it's live" email.
    const page = clean(form.get('page'), 160);
    const link = /^\/past-questions\/[a-z0-9/-]+$/.test(page) ? `${SITE}${page}` : `${SITE}/past-questions`;
    const thisYear = new Date().getFullYear();
    if (!folder || /[/\\]|^\.|^College Assessments$/i.test(folder)) throw new Problem(400, 'Please choose the subject.');
    if (!/^[A-Z0-9]{1,8}$/.test(short)) throw new Problem(400, 'Please choose the subject.');
    if (!Number.isInteger(year) || year < 2000 || year > thisYear) throw new Problem(400, 'Please choose the year the exam was held.');
    if (term !== 'Spring' && term !== 'Fall') throw new Problem(400, 'Please choose Spring or Fall.');

    // The paper: exactly one PDF.
    const uploads = form.getAll('file').filter((entry): entry is File => typeof entry !== 'string');
    if (!uploads.length) throw new Problem(400, 'Please add the paper.');
    if (uploads.length > 1) throw new Problem(400, 'One PDF per paper, please.');
    const pdf = new Uint8Array(await uploads[0].arrayBuffer());
    if (!isPdf(pdf)) throw new Problem(400, 'Only PDF files can be sent. Scan the paper into one PDF first.');
    if (pdf.length > MAX_BYTES) throw new Problem(413, 'That’s too big: the PDF can be 4 MB at most. Please compress it and try again.');
    const files = [{ bytes: pdf }];

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

    const names = [`${base}.pdf`];

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

    const notice: Notice | null = email ? { email, name, subject: folder, exam: `${term} ${year}`, link } : null;
    const sealed = notice ? seal(notice) : null;

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
          `| Email when live | ${sealed ? 'yes (address encrypted below)' : 'no'} |`,
          '',
          '**Before merging:** open the file and check it is this subject’s Pokhara University paper for this exam, and that it’s readable.',
          'Use **Squash and merge** and keep the line below in the commit message: it credits the sender on the Contributors page.',
          '',
          credit,
          // Read by .github/workflows/paper-merged.yml after the merge; only NOTIFY_KEY can open it.
          ...(sealed ? ['', `<!-- notify:${sealed} -->`] : []),
        ].join('\n'),
      }),
    });
    // A label makes these easy to find; not needed for anything else.
    await github(token, `/issues/${pr.number}/labels`, { method: 'POST', body: JSON.stringify({ labels: ['website upload'] }) });

    if (notice) {
      const mail = receivedMail(notice);
      await sendMail(notice.email, mail.subject, mail.text, mail.html);
    }

    return json(200, { ok: true, files: names, pullRequest: pr.html_url, emailed: !!notice });
  } catch (err) {
    if (err instanceof Problem) return json(err.status, { error: err.message });
    console.error(err);
    return json(500, { error: 'Something went wrong. Please try again.' });
  }
}
