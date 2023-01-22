import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/Components.ts'),
      // @ts-ignore
      formats: ['es', 'cjs', 'umd', 'amd'],
      name: 'unreal-components',
      fileName: (format) => `unreal-components.${format}.js`
    },
    rollupOptions: {
      output: {
        globals: {
        }
      }
    },
    target: 'es2015',
    sourceMap: false
  }
})
