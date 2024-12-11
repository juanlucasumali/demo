import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: {
      'process.env.VITE_B2_APPLICATION_KEY_ID': JSON.stringify(process.env.VITE_B2_APPLICATION_KEY_ID),
      'process.env.VITE_B2_APPLICATION_KEY': JSON.stringify(process.env.VITE_B2_APPLICATION_KEY),
      'process.env.VITE_B2_BUCKET_ID': JSON.stringify(process.env.VITE_B2_BUCKET_ID),
      'process.env.VITE_B2_BUCKET_NAME': JSON.stringify(process.env.VITE_B2_BUCKET_NAME)
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    define: {
      'process.env.VITE_B2_APPLICATION_KEY_ID': JSON.stringify(process.env.VITE_B2_APPLICATION_KEY_ID),
      'process.env.VITE_B2_APPLICATION_KEY': JSON.stringify(process.env.VITE_B2_APPLICATION_KEY),
      'process.env.VITE_B2_BUCKET_ID': JSON.stringify(process.env.VITE_B2_BUCKET_ID),
      'process.env.VITE_B2_BUCKET_NAME': JSON.stringify(process.env.VITE_B2_BUCKET_NAME)
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
