export const FileUpload: React.ComponentType<(Pick<Pick<PropTypes.InferProps<{
    tier: PropTypes.Validator<object>;
}>, "tier"> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox">, "tier" | keyof import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox">> | Pick<Pick<PropTypes.InferProps<{
    tier: PropTypes.Validator<object>;
}>, "tier"> & import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox"> & {
    children?: React.ReactNode;
}, "children" | "tier" | keyof import("@material-ui/core/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen" | "imgUploadBox">>) & import("@material-ui/core/withWidth").WithWidthProps>;
export class FileUploadComp extends React.Component<any, any, any> {
    constructor(props: any);
    fileInput: any;
    imgPreview: any;
    toShowImage(e: any): void;
    field: any;
}
export namespace FileUploadComp {
    namespace propTypes {
        const tier: PropTypes.Validator<object>;
    }
}
import PropTypes from "prop-types";
import React from "react";
