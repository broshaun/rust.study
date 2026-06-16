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
    host: '0.0.0.0',
    port: 3000,
  },
});
