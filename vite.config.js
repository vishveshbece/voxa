import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    // Tell Rollup these are external globals — don't try to bundle them
    rollupOptions: {
      external: ['@tensorflow/tfjs', '@tensorflow-models/speech-commands'],
      output: {
        globals: {
          '@tensorflow/tfjs': 'tf',
          '@tensorflow-models/speech-commands': 'speechCommands',
        },
      },
    },
  },
})
