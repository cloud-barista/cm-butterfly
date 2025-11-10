import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import path from 'path';

// https://vitejs.dev/config/
export default ({ mode }: any) => {
  const env = loadEnv(mode, process.cwd(), '');
  return defineConfig({
    plugins: [vue(), viteCommonjs()],
    resolve: {
      alias: [
        { find: 'vue', replacement: 'vue/dist/vue.esm.js' },
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    server: {
      // host: '0.0.0.0', // Listen on all network interfaces (allow external access)
      // port: 5173,
      proxy: {
        '/api': {
          target: env['VITE_BACKEND_URL'],
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api'),
        },
      },
    },
  });
};
