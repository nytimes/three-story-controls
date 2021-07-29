import typescript from '@rollup/plugin-typescript'
import eslint from '@rbnlffl/rollup-plugin-eslint'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import nested from 'postcss-nested'

const { NODE_ENV } = process.env
const input = 'src/index.ts'
const name = 'ThreebirdControls'
const sourcemap = true

const commonPlugins = () => {
  const plugins = [
    eslint(),
    typescript(),
    postcss({
      extensions: ['.css'],
      plugins: [nested()],
    }),
  ]
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

const esmConfig = {
  input,
  output: {
    file: `dist/threebird-controls.esm${NODE_ENV == 'production' ? '.min' : ''}.js`,
    format: 'es',
    name,
    sourcemap,
  },
  external: ['three', 'gsap'],
  plugins: [...commonPlugins()],
}

const config = [esmConfig]

if (NODE_ENV === 'production') {
  config.push(umdConfig)
}

export default config
