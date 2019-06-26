# gulp-paths-to-file

Append/prepend transformed file paths to your file contents. See below some usage instructions.

## Installation

```
yarn add -D gulp-paths-to-file
```

## Usage

```ts
import filePaths from 'gulp-paths-to-file';
import gulp from 'gulp';

gulp.task('stylesheets', () => {
    return gulp.src('./stylesheets/app.scss')
            .pipe(filePaths('./src/**/*.{css,scss}', (file) => `@import "${file}";`))
            .pipe(gulp.dest('public'))
});
```

```ts
import {FilePathsPlugin} from 'gulp-paths-to-file';
import gulp from 'gulp';

gulp.task('stylesheets', () => {
    return gulp.src('./stylesheets/app.scss')
            .pipe(new FilePathsPlugin({
                pattern: './node_modules/bootstrap/scss/**/*.{scss}',
                mode: 'prepend',
                getContent: (file) => `@import "${file}";`
            }))
            .pipe(new FilePathsPlugin({
                pattern: './src/**/*.{css,scss}',
                getContent: (file) => `@import "${file}";`
            }))
            .pipe(gulp.dest('public'))
});
```
