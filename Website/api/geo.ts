/**
 * GET /api/geo → { "country": "NP" }
 *
 * The visitor's country, as Vercel already works it out for every request (the x-vercel-ip-country
 * header). Used once per counted visit for the anonymous country counters on /analytics. Only the
 * two-letter code is returned; the IP address isn't read or kept.
 */
export function GET(request: Request): Response {
  const code = (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  return Response.json(
    { country: /^[A-Z]{2}$/.test(code) ? code : null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
