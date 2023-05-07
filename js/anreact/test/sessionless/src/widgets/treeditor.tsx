import React from 'react';
import { Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf, Semantier } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, AnContextType, Spreadsheetier,
} from '../../../../src/an-components';
import { JsampleIcons } from '../../../../src/jsample/styles';

const styles = (_theme: Theme) => ({
	root: {
		height: "calc(100vh - 18ch)"
	},
	actionButton: {
	},
	usersButton: {
		marginLeft: 20,
		marginRight: 20,
		marginTop: 6,
		width: 150,
	}
});

class TestreeditorComp extends CrudComp<Comprops & {conn_state: string, tier: TestreeditorTier}>{
	tier: TestreeditorTier;
}
TestreeditorComp.contextType = AnContext;

const Testreeditor = withStyles(styles)(TestreeditorComp);
export { Testreeditor, TestreeditorComp };

class TestreeditorTier extends Semantier {

}