// // let context = require.context('../../frames/react', true, /\.jsx$/);
// let context = require.context('../../', true, /(\.jsx)|(anclient.js)|(protocol.js)|(aes.js)$/);
//
// context.keys().forEach(context);
// module.exports = context;
// // export {context};

// function requireAll(r) { r.keys().forEach(r); }
//
// requireAll(require.context('../../', true, /(\.jsx)|(anclient.js)|(protocol.js)|(aes.js)$/));

export * from './anclient.js';

export * from './patch/react-portal-overlay.tsx';

export * from './react/reactext.jsx';
export * from './react/anreact.jsx';
export * from './react/error.jsx';
export * from './react/login.jsx';
export * from './react/sys.jsx';
export * from './react/crud.jsx';

export * from './utils/consts.js';
export * from './utils/helpers.js';
export * from './utils/langstr.js';

export * from './react/widgets/messagebox';
export * from './react/widgets/dataset-combo';
export * from './react/widgets/my-icon';
export * from './react/widgets/my-info';
export * from './react/widgets/query-form';
export * from './react/widgets/query-form-st';
export * from './react/widgets/table-list';
export * from './react/widgets/table-list-lu';
export * from './react/widgets/tabs';
export * from './react/widgets/tree';
export * from './react/widgets/treegrid';
export * from './react/widgets/ag-gridsheet';
export * from './react/widgets/tree-editor';

export * from './react/widgets/record-form';
export * from './react/widgets/simple-form';
export * from './react/widgets/t-record-form';
export * from './react/widgets/t-relation-tree';

import { JsampleIcons, JsampleTheme } from './jsample/styles';
import { Domain, DomainComp } from './jsample/views/domain';
import { Orgs, OrgsComp } from './jsample/views/orgs';
import { Roles, RolesComp } from './jsample/views/roles';
import { RoleDetails, RoleDetailsComp } from './jsample/views/role-details';

// import { Users, UsersComp } from './jsample/views/users';
// import { UserDetails, UserDetailsComp, MyInfCard, MyInfCardComp } from './jsample/views/user-details';
import { Userst, UserstComp, UsersTier, UserstReq } from './jsample/views/users';
import { UserDetailst, UserDetailstComp } from './jsample/views/user-details';
import { MyInfCard, MyInfCardComp } from './jsample/views/my-infcard';

export const jsample = {
	JsampleIcons, JsampleTheme,
	Domain, DomainComp, Orgs, OrgsComp,
	Roles, RolesComp, RoleDetails, RoleDetailsComp,
	// Users, UsersComp, UserDetails, UserDetailsComp,
	MyInfCard, MyInfCardComp,
	Userst, UserstComp, UserDetailst, UserDetailstComp, UsersTier, UserstReq
};
