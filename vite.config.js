import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Forzar el uso de Rollup en lugar de Rolldown
    rollupOptions: {
      // Configuración normal de Rollup
    }
  },
  // Deshabilitar explícitamente Rolldown (si existe esta opción)
  // experimental: {
  //   rolldown: false
  // }
})
