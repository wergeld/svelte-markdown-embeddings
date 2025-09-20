import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only'; // <-- add this

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: { dev: !production }
    }),
    css({ output: 'bundle.css' }),  // <-- add this line
    resolve({ browser: true, dedupe: ['svelte'] }),
    commonjs(),
    !production && livereload('public'),
    production && terser()
  ],
  watch: { clearScreen: false }
};
