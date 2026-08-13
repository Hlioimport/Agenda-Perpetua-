import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Agenda-Perpeteua-/', // <--- Esta linha diz ao Vite exatamente onde o site está hospedado
})
