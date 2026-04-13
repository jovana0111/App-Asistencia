import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "react-native": "react-native-web",
    },
  },

  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/odoo-api': {
        target: 'https://srv.seishin.com.mx/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/odoo-api/, ''),
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

