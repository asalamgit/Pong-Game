import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [react(), svgr()],
    server: {
      port: 8080,
      host: true,
      proxy: {
        '/api/auth': {
          target: `http://${env.VITE_BASE_API_URL}/api/auth`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/auth/, ''),
        },
        '/api': {
          target: `http://${env.VITE_BASE_API_URL}/api`,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
    build: {
      outDir: 'build',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
    },
  });
};
