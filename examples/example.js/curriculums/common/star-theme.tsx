import { Theme } from "@material-ui/core/styles";
import { ClassNames } from "@anclient/anreact";
import { regex } from "@anclient/anreact/src/utils/regex";

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

/**
* @param mime
* @param iconpath 
* @return &lt;img/&gt;
*/
export function getMimeIcon(mime: string, iconpath = '/res-vol/icons') {
   const known = { image: 'image.svg', '.txt': 'text.svg',
		   '.doc': 'docx.svg', '.docx': 'docx.svg', '.zip': '7zip.svg',
		   '.pdf': 'pdf.svg', '.rtf': 'txt.svg'};
   const unknown = 'unknown.svg';

   let src = regex.mime2type(mime);
   if (src) src = known[src];
   else src = unknown

   return (`<img style='height: 90%' src='${iconpath}/${src}'}></img>`);
}

/**
 * Set color class: c-l1, c-l2, c-l3
 */
export function addAgStyle() {
	let dstyle = document.getElementById('ag-row-rule-styles');
	if (!dstyle) {
		let newStyle = document.createElement("style");
		newStyle.id = 'ag-row-rule-styles';
		newStyle.innerHTML = `
			.c-l1 { color: red !important;}
			.c-l2 { color: rgb(164,164,0) !important;}
			.c-l3 { color: green !important;}`;
		document.getElementsByTagName("head")[0].appendChild(newStyle);
	}
}