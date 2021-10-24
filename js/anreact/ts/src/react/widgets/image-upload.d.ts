export const ImageUpload: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    tier: PropTypes.Validator<object>;
    nv: PropTypes.Requireable<object>;
}>, "nv" | "tier"> & import("@material-ui/core/styles").StyledComponentProps<never>, "nv" | keyof import("@material-ui/core/styles").StyledComponentProps<never> | "tier"> | Pick<Pick<PropTypes.InferProps<{
    tier: PropTypes.Validator<object>;
    nv: PropTypes.Requireable<object>;
}>, "nv" | "tier"> & import("@material-ui/core/styles").StyledComponentProps<never> & {
    children?: React.ReactNode;
}, "children" | "nv" | keyof import("@material-ui/core/styles").StyledComponentProps<never> | "tier">) & import("@material-ui/core/withWidth").WithWidthProps>;
export class ImageUploadComp extends React.Component<any, any, any> {
    constructor(props: any);
    fileInput: any;
    imgPreview: any;
    toShowImage(e: any): void;
    field: any;
}
export namespace ImageUploadComp {
    namespace propTypes {
        const tier: PropTypes.Validator<object>;
        const nv: PropTypes.Requireable<object>;
    }
}
import PropTypes from "prop-types";
import React from "react";
