const gulp = require('gulp');
const rollup = require('rollup-stream');
const uglify = require('gulp-uglify-es').default;
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const js = ({ dev = true } = {}) => function () {
  let stream = rollup({
    input: './src/index.js',
    sourcemap: dev,
    format: 'cjs',
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs()
    ]
  })
  .pipe(source('index.js'))
  .pipe(buffer());

  if (dev) {
    stream = stream.pipe(sourcemaps.init({ loadMaps: true }));
  }

  if (!dev) {
    stream = stream.pipe(uglify());
  }

  if (dev) {
    stream = stream.pipe(sourcemaps.write());
  }

  return stream.pipe(gulp.dest('dist'));
};

gulp.task('build', js({ dev: false }));
gulp.task('dev', function () {
  gulp.watch('src/**/*.js', { ignoreInitial: false }, gulp.task('dev:build'));
});
gulp.task('dev:build', js());
