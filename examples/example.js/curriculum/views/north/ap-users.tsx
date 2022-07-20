import React from 'react';

import { Comprops, CrudCompW, jsample, L } from '@anclient/anreact';

export class ApUsers extends CrudCompW<Comprops> {
	
	render() {
		return (<jsample.Userst uri={this.uri} title={L('System Users')} />);
	}
}
