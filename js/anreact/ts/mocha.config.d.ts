export const mode: string;
export const entry: string;
export namespace output {
    const filename: string;
}
export const target: string;
export const externals: any[];
export const plugins: any[];
export namespace resolve {
    const extensions: string[];
}
export namespace module {
    const rules: ({
        test: RegExp;
        loader: string;
        options: {
            presets: string[];
        };
        use?: undefined;
    } | {
        test: RegExp;
        use: string[];
        loader?: undefined;
        options?: undefined;
    })[];
}
