
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';

import { L } from '@anclient/anreact';

/**
 * Formatting json string (can be parsed by JSON) into &gt;Typography/&lg;.
 * @param{string} extra e.g. {msg: 'my message'}
 * @param{string} rkey
 * @param{object} record the db record instance incase message comes with parameters.
 */
export function myMsgFromIssuer( extra, rkey, rec ) {
	let json = JSON.parse(extra);
	return (
		<>  <Typography variant={'body2'} >
				{L('Msg from North:')}
			</Typography>
			<Card key={rkey}>
				{json.msg}
			</Card>
		</>);
}
