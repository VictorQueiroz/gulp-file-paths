import glob from 'glob';
import * as stream from 'stream';
import File from 'vinyl';

export interface IFilePathsPluginOptions {
    pattern: string;
    /**
     * @param file Absolute file path
     * @param index Index to the resolved files list
     */
    getContent: (file: string, index: number) => string | Buffer | undefined;
    /**
     * Whether the content of getContent function will be
     * appended or preppended to the file contents
     */
    mode: 'prepend' | 'append';
}

export class FilePathsPlugin extends stream.Transform {
    constructor(private readonly options: IFilePathsPluginOptions) {
        super({objectMode: true});
    }
    public async _transform(chunk: File, _: string, cb: (error?: Error, file?: File) => void) {
        try {
            const files = await new Promise<string[]>((resolve, reject) => {
                if(!glob.hasMagic(this.options.pattern)) {
                    resolve(new Array<string>(this.options.pattern));
                    return;
                }
                glob(this.options.pattern, (err, matches) => {
                    if(err) {
                        reject(err);
                    } else if(Array.isArray(matches)) {
                        resolve(matches);
                    } else {
                        reject(new Error('Invalid glob result'));
                    }
                });
            });

            let newContents = chunk.contents;
            if(!newContents || !Buffer.isBuffer(newContents)) {
                throw new Error('Invalid chunk contents');
            }

            let i: number;
            for(i = 0; i < files.length; i++) {
                let contents = await this.options.getContent(files[i], i);
                if(!contents) {
                    throw new Error('The `getContent` function returned empty or undefined');
                }
                if(typeof contents === 'string') {
                    contents = Buffer.from(contents, 'utf8');
                }
                switch(this.options.mode) {
                    case 'append':
                        newContents = Buffer.concat([
                            newContents,
                            contents
                        ]);
                        break;
                    default:
                        newContents = Buffer.concat([
                            contents,
                            newContents
                        ]);
                }
            }

            chunk.contents = newContents;
            cb(undefined, chunk);
        } catch(reason) {
            this.emit('error', reason);
            cb(reason);
        }
    }
}

const defaults: Omit<IFilePathsPluginOptions, 'pattern' | 'getContent'> = {
    mode: 'append'
};

/**
 * Resolve `pattern` and then add whatever getContent returns to the end of files on the stream. A get
 * content call will be made for each of the files that `pattern` resolves to. Note that if `getContent`
 * function returns a string, it'll be interpreted as utf8.
 * @param pattern Pattern to resolve
 * @param getContent The result of this function will be the appended content on the files being processed.
 */
export default function(
    pattern: string,
    getContent: IFilePathsPluginOptions["getContent"],
    options?: Partial<IFilePathsPluginOptions>
) {
    return new FilePathsPlugin({
        getContent,
        pattern,
        ...defaults,
        ...options
    });
}