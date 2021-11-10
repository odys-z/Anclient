import React from 'react';
import { DetailFormW, Comprops } from '../crud';
/**
 */
interface ImgFormProps extends Comprops {
    blankIcon: object;
}
declare class ImageUploadComp extends DetailFormW<ImgFormProps> {
    state: {
        src: any;
    };
    fileInput: any;
    imgPreview: any;
    field: any;
    constructor(props: ImgFormProps);
    componentDidMount(): void;
    toShowImage(e: any): void;
    render(): JSX.Element;
}
declare const ImageUpload: React.ComponentType<(Pick<Pick<ImgFormProps, keyof ImgFormProps> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox">, string | number | symbol> | Pick<Pick<ImgFormProps, keyof ImgFormProps> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox"> & {
    children?: React.ReactNode;
}, string | number | symbol>) & import("@material-ui/core/withWidth").WithWidthProps>;
export { ImageUpload, ImageUploadComp };
