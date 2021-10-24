/**var L = require('language');
 * or import L from Langstr;
 * Usage:
 * Langstrs.using('en'); // optional, default en
 * var the_string = L('Welcome {name}', {name: 'Joe'});
 * see https://stackoverflow.com/a/30191493/7362888
 * and https://stackoverflow.com/a/57882370/7362888
 */
export function L(t: any, o: any): any;
/** return a promise
 *
 *  memo: navigator clipboard api needs a secure context (https)
 * @param {string} textToCopy text to be copied
 * https://stackoverflow.com/a/65996386/7362888
 */
export function copyToClipboard(textToCopy: string): Promise<any>;
export namespace Langstrs {
    namespace s {
        const en: Set<any>;
        const zh: {};
        const ja: {};
    }
    const lang: string;
    function load(url: any): void;
    function using(lang?: string): void;
    function report(lang?: string): Set<any>;
}
