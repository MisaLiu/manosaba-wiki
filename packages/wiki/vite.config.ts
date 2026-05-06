import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite';
import preact from '@preact/preset-vite'

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    preact(),
  ],
  define: {
    _GIT_COMMIT_HASH_: JSON.stringify(commitHash),
  }
})
