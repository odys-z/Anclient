export interface StrResource {
    [x: string]: string;
}
/**
 * A dynamic extending {string-key: parameterized-instance} translation mapper.
 * function:
 * use string template as resource key;
 * accept object as arguments
 * extending &amp; resolve un-mapped string template.
*/
export declare const Langstrs: {
    s: {
        en: Set<string>;
        zh: StrResource;
        ja: StrResource;
    };
    lang: string;
    load: (url: any) => void;
    using: (lang?: string) => void;
    report: (lang?: string) => Set<unknown>;
};
/**var L = require('language');
 * or import L from Langstr;
 * Usage:
 * Langstrs.using('en'); // optional, default en
 * var the_string = L('Welcome {name}', {name: 'Joe'});
 * see https://stackoverflow.com/a/30191493/7362888
 * and https://stackoverflow.com/a/57882370/7362888
 *
 * @param t template
 * @param o arg object
 * @returns
 */
export declare function L(t: string, o?: object): string;
/** return a promise
 *
 *  memo: navigator clipboard api needs a secure context (https)
 * @param {string} textToCopy text to be copied
 * https://stackoverflow.com/a/65996386/7362888
 */
export declare function copyToClipboard(textToCopy: any): Promise<void>;
