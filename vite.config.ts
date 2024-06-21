import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  root: __dirname,
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
  ],
  build: {
    outDir: './dist',
  
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'vue-lazy-virtual-list',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that should not be bundled
      // into your library
      input: {
        main: path.resolve(__dirname, "src/index.ts")
      },
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
