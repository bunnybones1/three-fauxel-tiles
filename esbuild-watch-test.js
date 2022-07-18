import { build } from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import { nodeExternalsPlugin }  from 'esbuild-node-externals'

build({
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
            minify: false
        }),
        nodeExternalsPlugin()
    ],
    watch: true
})
.catch(() => process.exit(1));

