
import React from "react";
import { AnContext, Comprops, Media, SysComp } from "@anclient/anreact";
import { QueryConditions } from "@anclient/semantier-st/semantier";

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

export interface WelcomeProp extends Comprops {
    readonly sys: typeof SysComp
};

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

    public media: Media;
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
