import typescript from '@rollup/plugin-typescript'
import skypackResolver from '@vinicius73/rollup-plugin-skypack-resolver'
import eslint from '@rbnlffl/rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'

const { NODE_ENV } = process.env
const input = 'src/index.ts'
const name = 'ThreebirdControls'
const sourcemap = true

const commonPlugins = () => {
  const plugins = [eslint(), typescript()]
  if (NODE_ENV === 'production') {
    plugins.push(terser())
  }
  return plugins
}

const umdConfig = {
  input,
  output: {
    file: 'dist/threebird-controls.min.js',
    format: 'umd',
    name,
    sourcemap,
    globals: {
      three: 'THREE',
      gsap: 'gsap',
    },
  },
  external: ['three', 'gsap'],
  plugins: [...commonPlugins()],
}

const webEsmConfig = {
  input,
  output: {
    file:
      NODE_ENV === 'production' ? 'dist/threebird-controls.web.esm.js' : 'examples/demos/threebird-controls.web.esm.js',
    format: 'es',
    name,
    sourcemap,
  },
  plugins: [
    ...commonPlugins(),
    skypackResolver({
      modules: ['three', 'gsap'],
    }),
  ],
}

const npmEsmConfig = {
  input,
  output: {
    file: 'dist/threebird-controls.npm.esm.js',
    format: 'es',
    name,
    sourcemap,
  },
  external: ['three', 'gsap'],
  plugins: [...commonPlugins()],
}

const config = [webEsmConfig]

if (NODE_ENV === 'production') {
  config.push(umdConfig, npmEsmConfig)
}

export default config
