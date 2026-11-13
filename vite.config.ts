import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [tailwindcss()],
  // The Windows esbuild minifier stalls in this environment. Keep this local
  // demonstration build reproducible; production bundle optimization is deferred.
  build: { minify: false },
});
