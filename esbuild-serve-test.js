import { serve } from "esbuild";
import { glsl } from "esbuild-plugin-glsl";

serve({
    servedir: 'test-www',
    port: 8002
  }, {
    entryPoints: ['test/index.ts'],
    outdir: 'test-www',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: ['esnext'],
    tsconfig: './tsconfig.test.json',
    plugins: [
        glsl({
            minify: true
        })
    ]
  })
  .catch(() => process.exit(1));