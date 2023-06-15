export * from './utils/consts';
export * from './utils/langstr';
export * from './utils/lang-ext';

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
export * from './react/widgets/table-list';
export * from './react/widgets/tabs';
export * from './react/widgets/tree';
export * from './react/widgets/treegrid';
export * from './react/widgets/ag-gridsheet';
export * from './react/widgets/spreadsheet';
export * from './react/widgets/tree-editor2';
export * from './react/widgets/gallery-view';

export * from './react/widgets/simple-form';
export * from './react/widgets/record-form';
export * from './react/widgets/relation-tree';

export * from './photo-gallery/src/Photo';

import { JsampleIcons, JsampleTheme, jstyles } from './jsample/styles';
import { Domain, DomainComp } from './jsample/views/domain';
import { Orgs, OrgsComp } from './jsample/views/orgs';
import { Roles, RolesComp } from './jsample/views/roles';
import { RoleDetails, RoleDetailsComp } from './jsample/views/role-details';

import { Userst, UserstComp, UsersTier, UserstReq } from './jsample/views/users';
import { UserDetailst, UserDetailstComp } from './jsample/views/user-details';
import { MyInfCard, MyInfCardComp } from './jsample/views/my-infcard';
import { MyPswd, MyPswdComp } from './jsample/views/my-pswdcard';

export const jsample = {
	JsampleIcons, JsampleTheme, jstyles,
	Domain, DomainComp, Orgs, OrgsComp,
	Roles, RolesComp, RoleDetails, RoleDetailsComp,
	MyInfCard, MyInfCardComp,
	MyPswd, MyPswdComp,
	Userst, UserstComp, UserDetailst, UserDetailstComp, UsersTier, UserstReq
};

import { uarr2Base64, dataOfurl, mimeOf, urlOfdata } from './utils/file-utils';
import { regex } from './utils/regex';

export const utils = {
	uarr2Base64, dataOfurl, mimeOf, urlOfdata, regex
}
