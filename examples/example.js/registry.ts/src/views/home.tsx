import React from 'react';
import { AnContextType, Comprops, CrudCompW, L } from '@anclient/anreact';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

/**
 * Landing page of Registry Client, linked to menu url '/home' by App's SysComp.extendLinks().
 * Replace with the project's own pages, e.g. a semantier + AnQueryst + AnTablist list.
 */
export class Home extends CrudCompW<Comprops> {
	render() {
		let ctx = this.context as unknown as AnContextType;
		let ssInf = ctx?.anClient?.ssInf;
		let jserv = ctx?.servs ? (ctx.servs as any)[ctx.servId] : undefined;

		return (
			<Card style={{margin: 16}}>
				<CardContent>
					<Typography variant='h6'>{L('Welcome')}, {ssInf?.usrName || ssInf?.uid}</Typography>
					<Typography variant='body2' color='textSecondary'>
						{L('jserv')}: {jserv}
					</Typography>
					<Typography variant='body2' color='textSecondary'>
						{L('uri')}: {this.uri}
					</Typography>
				</CardContent>
			</Card>);
	}
}
