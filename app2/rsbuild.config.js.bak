// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  output: {
    assetPrefix: './',
  },
  source: {
    tsconfigPath: './jsconfig.json',
  },
  server: {
    proxy: {
      '/api': { target: 'http://103.186.108.161:5015', },
      '/imgs': { target: 'http://103.186.108.161:5015', },
      '/files': { target: 'http://103.186.108.161:5015/', },
    },
  }
});

