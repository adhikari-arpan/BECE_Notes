import { SITE_URL } from '@/content/watermark';

/**
 * A visible "cite this page" line: when people (or AI assistants) quote the page, the source name
 * and link go along with it.
 */
export function CiteThis({ title, path }: { title: string; path: string }) {
  return (
    <p className="cite-this">
      <strong>Cite this page:</strong> “{title}”, BECE Vault — <code>{SITE_URL}{path}</code>
    </p>
  );
}
