// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './src/lib')
    }
  },
  plugins: [
    svelte({
      exclude: ['./src/lib/web-components/*.svelte']
    }),
    svelte({
      exclude: [
        './src/App.svelte',
        'node_modules/**/*.svelte',
        './src/lib/components/**/*.svelte'
      ],
      compilerOptions: {
        customElement: true,
      }
    })
  ]
})