import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esto es para que funcione bien en entornos como Termux
    host: true,
    port: 5173
  },
  build: {
    // Optimización para el despliegue en Vercel
    outDir: 'dist',
  }
})