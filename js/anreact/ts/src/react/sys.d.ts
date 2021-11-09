import React from 'react';
import { AnContext } from './reactext';
import { Comprops, ClassNames, CrudComp, CrudCompW } from './crud';
import { ClassNameMap } from '@material-ui/styles';
import { AnReactExt } from './anreact';
export interface SysProps extends Comprops {
    /**Welcome page formatter */
    welcome?: (classes: ClassNameMap, context: typeof AnContext, comp: SysComp) => JSX.Element;
    hrefDoc: string;
    onLogout: () => void;
    myInfo: JSX.Element | ((context: typeof AnContext) => JSX.Element);
}
export declare function uri(comp: CrudComp<Comprops>, uri: string): CrudComp<Comprops>;
/**
 * <pre>a_functions
 funcId       |funcName           |url                               |css |flags |fullpath         |parentId |sibling |
 -------------|-------------------|----------------------------------|----|------|-----------------|---------|--------|
 sys          |System             |                                  |    |1     |1 sys            |         |1       |
 sys-domain   |Domain Settings    |views/sys/domain/domain.html      |    |1     |1 sys.1 domain   |sys      |1       |
 sys-role     |Role Manage        |views/sys/role/roles.html         |    |1     |1 sys.2 role     |sys      |2       |
 sys-org      |Orgnization Manage |views/sys/org/orgs.html           |    |1     |1 sys.3 org      |sys      |3       |
 sys-uesr     |Uesr Manage        |views/sys/user/users.html         |    |1     |1 sys.4 user     |sys      |4       |
 sys-wf       |Workflow Settings  |views/sys/workflow/workflows.html |    |1     |1 sys.5 wf       |sys      |5       |
 sys-1.1      |System v1.1        |                                  |    |1     |2 sys-1.1        |         |2       |
 sys-uesr-1.1 |Uesr Manage        |views/sys/user/users-1.1.html     |    |1     |2 sys-1.1.4 user |sys-1.1  |4       |</pre>
 * @class SysComp
 */
declare class SysComp extends CrudCompW<SysProps> {
    state: {
        window: any;
        welcome: boolean;
        sysName: string;
        skMenu: any;
        sysMenu: {};
        cruds: {
            path: string;
            params: any;
            comp: React.ComponentType<Pick<Comprops, keyof Comprops> & import("@material-ui/styles").StyledComponentProps<"root">>;
        }[];
        paths: any[];
        menuTitle: string;
        showMenu: boolean;
        expandings: Set<unknown>;
        showMine: boolean;
    };
    anreact: AnReactExt;
    confirmLogout: any;
    static extendLinks(links: any): void;
    constructor(props: any);
    welcomePaper(classes: any): JSX.Element;
    componentDidMount(): void;
    showMenu(e: React.MouseEvent<HTMLElement>): void;
    hideMenu(): void;
    toLogout(): void;
    toExpandItem(e: React.MouseEvent<HTMLElement>): void;
    /**
     * @param {object} classes
     */
    menuItems(classes: ClassNames): any;
    route(): JSX.Element[];
    render(): JSX.Element;
}
declare const Sys: React.ComponentType<Pick<SysProps, keyof SysProps> & import("@material-ui/styles").StyledComponentProps<"hide" | "content" | "direction" | "root" | "sysName" | "welcome" | "appBar" | "loginfo" | "appBarShift" | "menuButton" | "drawer" | "drawerPaper" | "drawerHeader" | "contentShift" | "welcomeHead" | "cardText">>;
export { Sys, SysComp };
