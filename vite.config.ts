import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages project site: /<repo>/
export default defineConfig({
  base: '/statfinder/',
  plugins: [react(), tailwindcss()],
})
