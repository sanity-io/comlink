import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), babel({presets: [reactCompilerPreset()]}), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        frame: resolve(__dirname, 'frame/index.html'),
      },
    },
  },
})
