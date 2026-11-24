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
// Same look as the "received" email (mailLayout in Website/api/send-paper.ts).
const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f3f1e8">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">Your paper is now on BECE Vault.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1e8;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;border-radius:18px;overflow:hidden;background:#ffffff;border:1px solid #e6e0c8;font-family:Arial,Helvetica,sans-serif;color:#0b1f1a">
<tr><td align="center" style="background:#0f2a22;padding:26px 24px 20px">
<a href="${SITE}" style="text-decoration:none"><img src="${SITE}/images/logo.png" width="110" alt="BECE Vault" style="display:block;width:110px;height:auto;border:0;margin:0 auto 10px"></a>
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:.5px;color:#f0c34a">BECE Vault</div>
<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9fbfb2;margin-top:4px">Pokhara University BE Computer Engineering</div>
</td></tr>
<tr><td style="padding:28px 30px 8px">
<span style="display:inline-block;padding:4px 12px;border-radius:99px;background:#dcf3e8;color:#1e6b4c;font-size:12px;font-weight:700">Live now</span>
<h1 style="margin:14px 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:#0b1f1a">Your paper is live! 🎉</h1>
<div style="font-size:15px;line-height:1.65;color:#2b3d36">
<p style="margin:0 0 14px">${esc(hi)}</p>
<p style="margin:0 0 14px">Good news: the <strong>${esc(notice.subject)}</strong> paper (${esc(notice.exam)}) you sent is now on BECE Vault, where every student can read and download it.</p>
<p style="margin:0">Thank you for helping the next batch prepare. Have another paper? <a href="${SITE}/send-paper" style="color:#b8860b">Send it here</a>.</p>
</div>
</td></tr>
<tr><td style="padding:22px 30px 6px"><a href="${esc(link)}" style="display:inline-block;padding:13px 26px;border-radius:99px;background:#f0c34a;color:#0b1f1a;font-size:15px;font-weight:700;text-decoration:none">See your paper</a></td></tr>
<tr><td style="padding:26px 30px 28px"><div style="border-top:1px solid #eee8d3;padding-top:16px;font-size:12px;line-height:1.6;color:#7d8b84">
You’re getting this because you sent a paper on <a href="${SITE}/send-paper" style="color:#b8860b">BECE Vault</a>. Only two emails are sent about each paper.<br>
<a href="${SITE}" style="color:#b8860b;text-decoration:none">notes.arpanadhikari7.com.np</a>
</div></td></tr>
</table>
</td></tr></table>
</body></html>`;

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
