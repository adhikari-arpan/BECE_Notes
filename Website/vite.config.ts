import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { notesPlugin } from './plugins/notes';
import { pdfjsAssetsPlugin } from './plugins/pdfjsAssets';
import { prerenderPlugin } from './plugins/prerender';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Optional overrides via Website/.env: NOTES_REPO, NOTES_BRANCH, NOTES_FILE_BASE_URL, BASE_PATH
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return {
    // Set BASE_PATH=/BECE_Notes/ when deploying to https://<user>.github.io/BECE_Notes/
    base: env.BASE_PATH || '/',
    plugins: [
      react(),
      pdfjsAssetsPlugin(),
      // A real HTML page per route + sitemap.xml + llms.txt, for search engines and AI crawlers.
      prerenderPlugin({
        repoRoot: fileURLToPath(new URL('..', import.meta.url)),
        siteUrl: env.SITE_URL || 'https://notes.arpanadhikari7.com.np',
        siteName: 'BECE Vault',
      }),
      notesPlugin({
        // The notes live next to this Website folder, in the repository root.
        repoRoot: fileURLToPath(new URL('..', import.meta.url)),
        repo: env.NOTES_REPO || 'adhikari-arpan/BECE_Notes',
        branch: env.NOTES_BRANCH || 'main',
        fileBaseUrl: env.NOTES_FILE_BASE_URL || undefined,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      // pdfjs-dist ships modern syntax (top-level await).
      target: 'es2022',
    },
  };
});
