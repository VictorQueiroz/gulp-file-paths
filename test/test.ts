import {expect} from 'chai';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import {test} from 'sarg';
import sinon from 'sinon';
import vfs from 'vinyl-fs';
import filePaths from '../src';

test('it should resolve files based on pattern', async () => {
    const getContents = sinon.spy((file) => `require("${file}");\n`);
    const destFile = '/tmp/' + randomBytes(16).toString('hex');
    await new Promise((resolve, reject) => {
        vfs.src([__dirname + '/input.txt'])
        .pipe(filePaths(__dirname + '/folder/*.txt', getContents))
        .on('error', reject)
        .pipe(vfs.dest(destFile))
        .on('end', resolve);
    });
    const result = fs.readFileSync(destFile + '/input.txt', 'utf8');
    expect(result).to.be.deep.equal(
        '// Imports are below:\n' +
        'require("/storage3/Personal/gulp-file-paths/test/folder/a.txt");\n' +
        'require("/storage3/Personal/gulp-file-paths/test/folder/b.txt");\n' +
        'require("/storage3/Personal/gulp-file-paths/test/folder/c.txt");\n' +
        'require("/storage3/Personal/gulp-file-paths/test/folder/d.txt");\n'
    );
});
