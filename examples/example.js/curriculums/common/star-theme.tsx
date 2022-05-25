import { Theme } from "@material-ui/core/styles";

export function starTheme(theme: Theme) {
  return {
	root: { },
	button: {
		height: 40,
		width: 100,
		padding: theme.spacing(1),
		margin: theme.spacing(1),
	},
	smalltip: {
		fontSize: "0.8em",
		padding: 0,
		marging: 0,
		color: "#006",
	},
  };
};

export interface StarTheme extends Theme {

};