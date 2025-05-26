import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.js 수정
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/finances': {
        target: 'http://openapi.academyinfo.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/finances/, '/openapi/service/rest/FinancesService'),
      },
      '/api/student': {
        target: 'http://openapi.academyinfo.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/student/, '/openapi/service/rest/StudentService'),
      }
    }
  }
});
