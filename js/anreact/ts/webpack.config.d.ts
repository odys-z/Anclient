declare var v: string;
export { v as mode };
export declare const devtool: string;
export declare namespace entry {
    const anreact: string;
}
export declare namespace output {
    const filename: string;
    const path: string;
    const publicPath: string;
    const library: string;
    const libraryTarget: string;
}
export declare const externals: any;
export declare const plugins: any[];
export declare namespace resolve {
    const extensions: string[];
}
export declare namespace module {
    const rules: ({
        test: RegExp;
        loader: string;
        options: {
            presets: string[];
        };
        exclude?: undefined;
        use?: undefined;
    } | {
        test: RegExp;
        exclude: RegExp;
        loader: string;
        options?: undefined;
        use?: undefined;
    } | {
        test: RegExp;
        use: string[];
        loader?: undefined;
        options?: undefined;
        exclude?: undefined;
    })[];
}
