import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'graphql-client-utilities',
      fileName: 'src/graphql-client-utilities',
      formats: ['es', 'cjs', 'umd']
    }
  },
  plugins: [dts()]
});
