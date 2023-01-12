import seqPreprocessor from 'svelte-sequential-preprocessor'
import preprocess from 'svelte-preprocess'
import { preprocessThrelte } from '@threlte/preprocess'
import path from 'path'

console.log('svelte config')

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
	preprocess: seqPreprocessor([
		preprocess({
			postcss: true
		}),
		preprocessThrelte({
			extensions: {
				'three/examples/jsm/controls/OrbitControls': ['OrbitControls'],
				'three/examples/jsm/controls/TransformControls': ['TransformControls']
			}
		})
	]),
  vite: {
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib"),
        $assets: path.resolve("./src/assets"),
      }
    }
  }
}
