import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-layers',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-data',
      '@tensorflow-models/speech-commands',
    ],
  },
  resolve: {
    mainFields: ['module', 'main'],
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/tensorflow/, /speech-commands/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
