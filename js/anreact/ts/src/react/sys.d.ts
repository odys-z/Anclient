export function uri(comp: any, uri: any): any;
export const Sys: React.ComponentType<Pick<any, string | number | symbol> & import("@material-ui/core/styles").StyledComponentProps<"hide" | "content" | "direction" | "root" | "welcome" | "appBar" | "loginfo" | "appBarShift" | "menuButton" | "drawer" | "drawerPaper" | "drawerHeader" | "contentShift" | "welcomeHead" | "cardText">>;
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
export class SysComp extends React.Component<any, any, any> {
    static extendLinks(links: any): void;
    constructor(props: any);
    showMenu(e: any): void;
    hideMenu(): void;
    toExpandItem(e: any): void;
    /**
     * @param {object} classes
     */
    menuItems(classes: object): any;
    toLogout(): void;
    welcomePaper(classes: any): any;
    confirmLogout: JSX.Element;
    route(): JSX.Element[];
}
export namespace SysComp {
    export { AnContext as contextType };
}
import React from "react";
import { AnContext } from "./reactext";
