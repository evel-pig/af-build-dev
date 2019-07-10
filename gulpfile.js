const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const chalk = require('chalk');

const tsProject = ts.createProject('tsconfig.json');


function copy(cb) {
  gulp.src('src/**/!(*.ts)')
    .pipe(gulp.dest('lib'));
  cb();
};

function tsc(cb) {
  const tsResult = tsProject.src()
    .pipe(tsProject());

  merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ]);
  cb();
};

function dev() {
  const watcher = [];
  watcher.push(gulp.watch('src/**/*.ts', tsc));
  watcher.push(gulp.watch('src/**/!(*.ts)', copy));

  watcher.forEach((ele) => {
    ele.on('change', (fileName, eventType) => {
      console.log(chalk.cyan(`${fileName} changed...`))
    });
  })
}

exports.dev = dev;

exports.default = gulp.parallel(copy, tsc);