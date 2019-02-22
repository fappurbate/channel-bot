const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');

const js = ({ dev = true } = {}) => function () {
  let stream = gulp.src('src/**/*.js');

  dev && (stream = stream.pipe(sourcemaps.init()));
  stream = stream.pipe(uglify());
  dev && (stream = stream.pipe(sourcemaps.write()));
  stream = stream.pipe(gulp.dest('dist'));

  return stream;
};

gulp.task('build', js({ dev: false }));
gulp.task('dev', function () {
  gulp.watch('src/**/*.js', { ignoreInitial: false }, gulp.task('dev:build'));
});
gulp.task('dev:build', js());
