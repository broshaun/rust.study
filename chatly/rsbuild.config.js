
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';


export default defineConfig({
  plugins: [pluginReact()],
  html: { template: './public/index.html' },
  output: {
    assetPrefix: './',
  },
  source: {
    tsconfigPath: './jsconfig.json',
  },
  server: {
    proxy: {
      // '/rpc': {
      //   target: 'http://103.186.108.161:5015',
      // },
      // '/imgs': {
      //   target: 'http://103.186.108.161:5015',
      // },
      // '/files': {
      //   target: 'http://103.186.108.161:5015',
      // },
    },
  }
});
