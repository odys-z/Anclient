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

export * from './react/reactext.jsx';
export * from './react/anreact.jsx';
export * from './react/error.jsx';
export * from './react/login.jsx';
export * from './react/sys.jsx';
export * from './react/crud.jsx';

export * from './utils/consts.js';
export * from './utils/helpers.js';
export * from './utils/langstr.js';

export * from './react/widgets/messagebox.jsx';
export * from './react/widgets/dataset-combo.jsx';
export * from './react/widgets/my-icon.jsx';
export * from './react/widgets/my-info.jsx';
export * from './react/widgets/query-form.jsx';
export * from './react/widgets/table-list.jsx';
export * from './react/widgets/table-list-selection-level-up.jsx';
export * from './react/widgets/tabs.jsx';
export * from './react/widgets/tree.jsx';
export * from './react/widgets/treegrid.jsx';
export * from './react/widgets/record-form.jsx';

export * from './react/widgets/simple-form';
export * from './react/widgets/tree-editor';

import { JsampleIcons, JsampleTheme } from './jsample/styles'
import { Domain, DomainComp } from './jsample/views/domain'
import { Orgs, OrgsComp } from './jsample/views/orgs'
import { Roles, RolesComp } from './jsample/views/roles'
import { RoleDetails, RoleDetailsComp } from './jsample/views/role-details'
import { Users, UsersComp } from './jsample/views/users'
import { UserDetails, UserDetailsComp } from './jsample/views/user-details'

export const jsample = {
	JsampleIcons, JsampleTheme,
	Domain, DomainComp, Orgs, OrgsComp,
	Roles, RolesComp, RoleDetails, RoleDetailsComp,
	Users, UsersComp, UserDetails, UserDetailsComp
};
