import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react({babel: {plugins: [['babel-plugin-react-compiler', {target: '19'}]]}}),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        frame: resolve(__dirname, 'frame/index.html'),
      },
    },
  },
})
