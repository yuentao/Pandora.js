const gulp = require("gulp");
const uglify = require("gulp-uglify"); //js压缩

/**
 * 压缩js(css压缩原理类同)
 * 解压文件路径： ['./js/index.js'] js多个文件进行压缩
 * 解出文件路径： ./js
 */
gulp.task("minifyjs", function () {
  return gulp
    .src("Pandora.min.js") //压缩多个文件
    .pipe(uglify()) //压缩
    .pipe(gulp.dest("./")); //输出
});
