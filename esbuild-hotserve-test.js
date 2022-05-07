import { glsl } from "esbuild-plugin-glsl";
import esbuildHotserve from "esbuild-hotserve"

esbuildHotserve([glsl({
  minify: true
})])