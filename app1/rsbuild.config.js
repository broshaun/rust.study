// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: { template: './public/index.html' },
  output: {
    assetPrefix: './',
  },
  source: {
    tsconfigPath: './jsconfig.json',
  },
  server: {
    proxy: {
      '/rpc': {
        target: 'http://103.186.108.161:5015',
      },
      '/imgs': {
        target: 'http://103.186.108.161:5015',
      },
      '/files': {
        target: 'http://103.186.108.161:5015',

      },
    },
  },
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
});
