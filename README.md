# gulp-file-paths

Append/prepend transformed file paths to your file contents. See below some usage instructions.

## Installation

```
yarn add -D gulp-file-paths
```

## Usage

```ts
import filePaths from 'gulp-file-paths';
import gulp from 'gulp';

gulp.task('stylesheets', () => {
    return gulp.src('./stylesheets/app.scss')
            .pipe(filePaths('./src/**/*.{css,scss}', (file) => `@import "${file}";`))
            .pipe(gulp.dest('public'))
});
```

```ts
import {FilePathsPlugin} from 'gulp-file-paths';
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
