
import React from "react";
import { AnContext, Comprops, Media, SysComp } from "@anclient/anreact";
import { QueryConditions } from "@anclient/semantier-st/semantier";

/**TODO move to @anclient/anreact */
// export interface FieldMeta {
// 	field: string;
// 	label?: string;
// 	disabled?: boolean;
// }

// export interface Media { isLg?: boolean; isMd?: boolean; isSm?: boolean; isXs: boolean; isXl?: boolean; }

// export interface AnMUIClasses {
// 	[c: string]: string;
// }

/** App North's props */
export interface Northprops {
    iportal?: string;
    servId: string;
    servs?: {host?: string, [h: string]: string};

    iwindow?: typeof window;
    iparent?: typeof parent;
    ilocation?: string;
	ihome?: string;
}

// export interface Comprops {
//     /**Component uri usually comes from function configuration (set by SysComp.extendLinks) */
// 	uri: string;
//     /**The matching url in React.Route */
// 	match?: {path: string};

// 	u?: boolean;
// 	c?: boolean;
//     readonly tier: any;
//     readonly crud?: CRUD;
//     readonly width?: Breakpoint;
// };

export interface WelcomeProp extends Comprops {
    // readonly classes: { board: any }
    readonly sys: typeof SysComp
};

/**PropType of Poll's Form. */
// export interface FormProp extends Comprops {
// 	readonly tier: Semantier;
// 	/**Fields met for expanding by form, e.g. TRecordForm or CardForm. */
// 	readonly fields?: Array<{}>;

// 	columns?: Array<AnlistColAttrs>;
// 	rows?: Array<Tierec>;

// 	readonly dense?: boolean;
//     readonly classes: {
// 		root?: string;
// 		dialogPaper?: string;
// 		smalltip?: string;
//         content?: string;
// 		buttons?: string;
// 		button?: string,
// 		card?: string;
// 		[x: string]: any
// 	};
//     onClose?: (event: React.UIEvent) => void;
// };

/**Query condition item, used by AnQueryForm.  */
export interface PollQueryCondt extends QueryConditions {
	pollIds?: Array<string>;
	states?: string;
}

// export class Anform<T extends FormProp> extends React.Component<T, any, any> {
// }

/**
 * Replacing @anclient/semantier/curd/CrudCompW
 */
export class CrudCompW<T extends Comprops> extends React.Component<T, any, any> {
	state: any;

    public media: {
        isLg?: boolean;
        isMd?: boolean;
		isSm?: boolean;
		isXl?: boolean;
		isXs?: boolean;
    };
    public uri: string;

	constructor(props: Readonly<T>) {
		super(props);

		this.uri = props.match && props.match.path || props.uri;
		if (!this.uri)
			throw Error("Anreact CRUD component must set a URI path. (Component not created with SysComp & React Router 5.2 ?)");


		let {width} = props;
		CrudCompW.prototype.media = CrudCompW.getMedia(width);
	}

	static getMedia(width: string) {
		let media: Media;

		if (width === 'lg') {
            media = {
			    isLg: true,
			    isMd: true,
			    isSm: true,
			    isXs: true
            }
		}
		else if (width === 'xl') {
			media = {
                isXl: true,
			    isLg: true,
			    isMd: true,
			    isSm: true,
			    isXs: true
            }
		}
		else if (width === 'sm') {
			media = {
                isSm: true,
			    isXs: true
            }
		}
		else if (width === 'xs')
			media = {isXs: true }
		else {
			media = {
                isMd: true,
			    isSm: true,
		    	isXs: true,
            }
		}

		return media;
	}

	/**A simple helper: Array.from(ids)[x]; */
	getByIx(ids: Set<string>, x = 0): string {
		return Array.from(ids)[x];
	}
}
CrudCompW.contextType = AnContext;
