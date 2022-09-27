// vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
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