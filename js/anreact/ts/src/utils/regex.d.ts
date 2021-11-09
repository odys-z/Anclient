export declare const regex: {
    /**Add # at start if none
     * @param str
     * @param defltStr default if  str is undefined or null
     * @return "#str" */
    sharp_: (str: string, defltStr: string) => string;
    /**Add # at start if none
     * @param str string with or without a starting '#'
     * @return "str" without starting '#' */
    desharp_: (str: string) => string;
    _regImage: RegExp;
    /**Find preview type (not doc type) of mime
     * https://docs.w3cub.com/http/basics_of_http/mime_types/complete_list_of_mime_types
     * @param mime
     * @return .doc or undefined
     */
    mime2type: (mime: string) => string;
    /**Find most likly mime of preview type
     *
     * @param doctype
     * @return mime, likely
     */
    type2mime: (doctype: string) => string;
};
