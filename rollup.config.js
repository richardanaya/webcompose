import resolve from 'rollup-plugin-node-resolve';
import babili from 'rollup-plugin-babili';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: 'webcompose.js',
  output: {
    file: 'dist/webcompose.min.js',
    format: 'umd',
    name: 'webcompose'
  },
  plugins: [
    resolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    cleanup({}),
    babili({})
  ]
};
