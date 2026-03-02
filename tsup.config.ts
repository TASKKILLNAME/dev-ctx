import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  target: 'node18',
  outDir: 'dist',
  sourcemap: true,
});
