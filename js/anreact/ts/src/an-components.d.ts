/// <reference types="react" />
export * from './utils/consts';
export * from './utils/langstr';
export * from './utils/helpers';
export * from './patch/react-portal-overlay';
export * from './react/reactext';
export * from './react/anreact';
export * from './react/error';
export * from './react/login';
export * from './react/sys';
export * from './react/crud';
export * from './react/widgets/messagebox';
export * from './react/widgets/dataset-combo';
export * from './react/widgets/image-upload';
export * from './react/widgets/file-upload';
export * from './react/widgets/my-icon';
export * from './react/widgets/my-info';
export * from './react/widgets/query-form';
export * from './react/widgets/query-form-st';
export * from './react/widgets/table-list';
export * from './react/widgets/tabs';
export * from './react/widgets/tree';
export * from './react/widgets/treegrid';
export * from './react/widgets/ag-gridsheet';
export * from './react/widgets/tree-editor';
export * from './react/widgets/simple-form';
export * from './react/widgets/t-record-form';
export * from './react/widgets/relation-tree';
import { DomainComp } from './jsample/views/domain';
import { OrgsComp } from './jsample/views/orgs';
import { RolesComp } from './jsample/views/roles';
import { RoleDetailsComp } from './jsample/views/role-details';
import { UserstComp, UsersTier, UserstReq } from './jsample/views/users';
import { UserDetailstComp } from './jsample/views/user-details';
import { MyInfCardComp } from './jsample/views/my-infcard';
import { MyPswdComp } from './jsample/views/my-pswdcard';
export declare const jsample: {
    JsampleIcons: {
        Add: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Check: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Clear: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Delete: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Close: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        DetailPanel: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Edit: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Export: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Filter: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        FirstPage: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        LastPage: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        NextPage: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        PreviousPage: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        ResetSearch: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Search: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        SortArrow: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        ThirdStateCheck: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        ItemCollapse: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Worksheet: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        ViewColumn: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        ListAdd: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Star: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Up: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
        Down: import("react").ForwardRefExoticComponent<import("react").RefAttributes<SVGSVGElement>>;
    };
    JsampleTheme: import("@material-ui/core").Theme;
    jstyles: (theme: any) => {
        field1: {
            width: number;
        };
        field2: {
            width: number;
        };
    };
    Domain: import("react").ComponentType<(Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"root">, string | number | symbol> | Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"root"> & {
        children?: import("react").ReactNode;
    }, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
    DomainComp: typeof DomainComp;
    Orgs: import("react").ComponentType<(Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"root">, string | number | symbol> | Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"root"> & {
        children?: import("react").ReactNode;
    }, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
    OrgsComp: typeof OrgsComp;
    Roles: import("react").ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
    }>, never> & import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">, keyof import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
    }> & {
        children?: import("react").ReactNode;
    }, "children"> & import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">, "children" | keyof import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
    }>, never> & import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
        children?: import("react").ReactNode;
    }, "children" | keyof import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"button" | "buttons" | "root" | "container">;
    }> & {
        children?: import("react").ReactNode;
    }, "children"> & import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container"> & {
        children?: import("react").ReactNode;
    }, "children" | keyof import("@material-ui/styles").StyledComponentProps<"button" | "buttons" | "root" | "container">>) & import("@material-ui/core").WithWidthProps>;
    RolesComp: typeof RolesComp;
    RoleDetails: import("react").ComponentType<(Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
    }>, never> & import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, keyof import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
    }> & {
        children?: import("react").ReactNode;
    }, "children"> & import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">, "children" | keyof import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
    }>, never> & import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
        children?: import("react").ReactNode;
    }, "children" | keyof import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">> | Pick<Pick<import("@material-ui/types").ConsistentWith<{}, {
        classes: import("@material-ui/styles").ClassNameMap<"buttons" | "content" | "title" | "root" | "dialogPaper">;
    }> & {
        children?: import("react").ReactNode;
    }, "children"> & import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper"> & {
        children?: import("react").ReactNode;
    }, "children" | keyof import("@material-ui/styles").StyledComponentProps<"buttons" | "content" | "title" | "root" | "dialogPaper">>) & import("@material-ui/core").WithWidthProps>;
    RoleDetailsComp: typeof RoleDetailsComp;
    MyInfCard: import("react").ComponentType<(Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"actionButton">, string | number | symbol> | Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"actionButton"> & {
        children?: import("react").ReactNode;
    }, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
    MyInfCardComp: typeof MyInfCardComp;
    MyPswd: import("react").ComponentType<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"ok" | "notNull" | "maxLen" | "anyErr" | "minLen">>;
    MyPswdComp: typeof MyPswdComp;
    Userst: import("react").ComponentType<(Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"button" | "root">, string | number | symbol> | Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"button" | "root"> & {
        children?: import("react").ReactNode;
    }, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
    UserstComp: typeof UserstComp;
    UserDetailst: import("react").ComponentType<(Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"hide" | "row" | "root" | "labelText" | "labelText_dense" | "rowHead" | "folder">, string | number | symbol> | Pick<Pick<import("./react/crud").Comprops, keyof import("./react/crud").Comprops> & import("@material-ui/styles").StyledComponentProps<"hide" | "row" | "root" | "labelText" | "labelText_dense" | "rowHead" | "folder"> & {
        children?: import("react").ReactNode;
    }, string | number | symbol>) & import("@material-ui/core").WithWidthProps>;
    UserDetailstComp: typeof UserDetailstComp;
    UsersTier: typeof UsersTier;
    UserstReq: typeof UserstReq;
};
import { uarr2Base64, dataOfurl, mimeOf, urlOfdata } from './utils/file-utils';
export declare const utils: {
    uarr2Base64: typeof uarr2Base64;
    dataOfurl: typeof dataOfurl;
    mimeOf: typeof mimeOf;
    urlOfdata: typeof urlOfdata;
    regex: {
        sharp_: (str: string, defltStr: string) => string;
        desharp_: (str: string) => string;
        _regImage: RegExp;
        mime2type: (mime: string) => string;
        type2mime: (doctype: string) => string;
    };
};
