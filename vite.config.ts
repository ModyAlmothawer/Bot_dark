import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

/**
 * Copies dist/index.html to dist/404.html after build so GitHub Pages
 * can handle direct deep links (e.g. /admin, /admin/login) without 404 errors.
 */
function githubPagesSpaPlugin() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const indexPath = path.resolve(distDir, 'index.html');
        const notFoundPath = path.resolve(distDir, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
        }
      } catch (err) {
        console.warn('Could not copy index.html to 404.html for GitHub Pages:', err);
      }
    },
  };
}

export default defineConfig(() => {
  // Use relative base path ('./') for universal portability across any GitHub Pages repository or subfolder
  const base = process.env.VITE_BASE_PATH || './';

  return {
    base,
    plugins: [react(), tailwindcss(), githubPagesSpaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
