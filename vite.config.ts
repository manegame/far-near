import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
  ],
  build: {
    sourcemap: true,
    // assetsDir: '/wp-content/themes/far-near-v2/'
  },
  resolve:{
    alias:{
      '$lib' : path.resolve(__dirname, './src/lib'),
      '$assets' : path.resolve(__dirname, './src/assets'),
    },
  },
}))

  

