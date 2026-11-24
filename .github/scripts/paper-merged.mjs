#!/usr/bin/env node
/**
 * After a /send-paper pull request is merged (see .github/workflows/paper-merged.yml): opens the
 * encrypted notice the website left in the pull request (`<!-- notify:… -->`, sealed with NOTIFY_KEY
 * by Website/api/send-paper.ts) and emails the sender that their paper is live, through Resend.
 *
 * Env: PR_BODY (the pull request's description), NOTIFY_KEY, RESEND_API_KEY, MAIL_FROM (optional).
 * Nothing to do (no notice, or no keys) is not an error: the job just says so.
 */
import { createDecipheriv } from 'node:crypto';

const SITE = 'https://notes.arpanadhikari7.com.np';
const MAIL_FROM = process.env.MAIL_FROM || 'BECE Vault <papers@notes.arpanadhikari7.com.np>';

const sealed = /<!-- notify:([A-Za-z0-9_-]+) -->/.exec(process.env.PR_BODY ?? '')?.[1];
if (!sealed) {
  console.log('The sender left no email address: nothing to send.');
  process.exit(0);
}
const key = Buffer.from(process.env.NOTIFY_KEY ?? '', 'base64');
if (key.length !== 32 || !process.env.RESEND_API_KEY) {
  console.log('::warning::NOTIFY_KEY or RESEND_API_KEY isn’t set as a repository secret: no email sent.');
  process.exit(0);
}

let notice;
try {
  const raw = Buffer.from(sealed, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  notice = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8'));
} catch {
  console.log('::warning::Couldn’t open the notice (was NOTIFY_KEY changed?): no email sent.');
  process.exit(0);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = String(notice.link).startsWith(`${SITE}/`) ? notice.link : `${SITE}/past-questions`;
const hi = notice.name ? `Hi ${notice.name},` : 'Hi,';

const text = [
  hi,
  '',
  `Good news: the ${notice.subject} paper (${notice.exam}) you sent is now live on BECE Vault.`,
  `See it here: ${link}`,
  '',
  'Thank you for helping the next batch prepare. Have another paper? Send it at ' + `${SITE}/send-paper`,
  '',
  `BECE Vault · ${SITE}`,
].join('\n');
const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0b1f1a;line-height:1.6">
<p style="font-size:18px;font-weight:700;color:#b8860b;margin:0 0 16px">BECE Vault</p>
<p>${esc(hi)}</p>
<p>Good news: the <strong>${esc(notice.subject)}</strong> paper (${esc(notice.exam)}) you sent is now live on BECE Vault.</p>
<p><a href="${esc(link)}" style="display:inline-block;padding:10px 18px;border-radius:99px;background:#f0c34a;color:#0b1f1a;font-weight:700;text-decoration:none">See your paper</a></p>
<p>Thank you for helping the next batch prepare. Have another paper? <a href="${SITE}/send-paper" style="color:#b8860b">Send it here</a>.</p>
<p style="margin-top:24px;font-size:12px;color:#5c6b64"><a href="${SITE}" style="color:#b8860b">notes.arpanadhikari7.com.np</a> · You got this email because you sent a paper on /send-paper.</p>
</div>`;

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: MAIL_FROM, to: [notice.email], subject: `Your paper is live: ${notice.subject}, ${notice.exam}`, text, html }),
});
if (!res.ok) {
  console.log(`::warning::Resend refused the email (${res.status}): ${(await res.text()).slice(0, 300)}`);
  process.exit(0);
}
console.log('Emailed the sender: their paper is live.');
