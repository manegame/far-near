import sveltePreprocess from 'svelte-preprocess'
import path from 'path'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess(),
  vite: {
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib")
      }
    }
  }
}
