
const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const csso = require('gulp-csso');
const autoprefixer  = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack-stream');
const imagemin = require('gulp-imagemin');
const del = require('del');


gulp.task("sass", function () {
  return gulp
    .src("./src/assets/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on("error", sass.logError))
    .pipe(autoprefixer({
      cascade: false
  }))
    .pipe(gcmq())
    .pipe(csso())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("./src/assets/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("browser-sync", function () {
  browserSync.init({
    server: {
      baseDir: "src",
    },
  });
});


gulp.task("js", function () {
  
	return gulp
  .src(['./src/assets/js/*.js', '!./src/assets/js/*.min.js'])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('index.min.js'))
		.pipe(gulp.dest('./src/assets/js'))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task("checkupdate", function () {
  gulp.watch("./src/assets/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./src/*.html").on('change', browserSync.reload);
  gulp.watch("./src/assets/js/**/index.js", gulp.parallel("js"));
  gulp.watch("./src/assets/img/**/*.*").on('change', browserSync.reload);
});

gulp.task('clean', async function () {
  return del.sync('./dist');
});


gulp.task('prebuild', async function () {
  let transferCss = gulp.src('./src/assets/css/*.css').pipe(gulp.dest('./dist/assets/css'));

  let transferFonts = gulp.src('./src/assets/fonts/**/*').pipe(gulp.dest('./dist/assets/fonts'));

  let transferImages = gulp.src('./src/assets/img/**/*').pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 50, progressive: true}),
    imagemin.optipng({optimizationLevel: 7}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
])).pipe(gulp.dest('./dist/assets/img'));

  let transferJs = gulp.src('./src/assets/js/*.min.js').pipe(gulp.dest('./dist/assets/js'));

  let transferStructure = gulp.src(['./src/*', '!./src/assets/**/*']).pipe(gulp.dest('./dist'));
});

gulp.task("watch", gulp.parallel("sass", "checkupdate", "browser-sync",));

gulp.task('build', gulp.series('clean', gulp.parallel( 'sass', 'js' ), 'prebuild'));

