import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // GitHub Actions sets GITHUB_REPOSITORY as "owner/repo". When deploying to GitHub Pages
    // as a *project site* (https://owner.github.io/repo/), Vite must use "/repo/" as base
    // so asset URLs resolve correctly even if the URL is visited without a trailing slash.
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
    return {
      // Local dev can use relative base too, but for GitHub Pages project sites
      // we prefer an absolute base to avoid "/repo" vs "/repo/" path edge cases.
      base: mode === 'production' && repoName ? `/${repoName}/` : './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
