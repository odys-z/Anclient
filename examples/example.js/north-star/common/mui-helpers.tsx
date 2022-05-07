
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';

import { L } from '@anclient/anreact';
import { Tierec } from '@anclient/semantier-st';

/**
 * Formatting json string (can be parsed by JSON) into &gt;Typography/&lg;.
 * @param extra extra string (no-sql), e.g. {msg: 'my message'} - deprecated way of arg's for using Typescript.
 * @param muikey Material UI card's key
 * @param record the db record instance incase message comes with parameters.
 */
export function myMsgFromIssuer( extra: string, muikey: string, rec: Tierec ) {
	let json = JSON.parse(extra);
	return ( <>
		<Typography variant={'body2'} >
				{L('Msg from North:')}
		</Typography>
		<Card key={muikey}>
			{json.msg}
		</Card>
	</>);
}
