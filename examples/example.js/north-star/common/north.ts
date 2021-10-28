
import { SysComp } from "@anclient/anreact";

/** App North's props */
export interface Northprops {
    iportal?: string;
    servId: string;
    servs?: object;

    iwindow?: typeof window;
    iparent?: typeof parent;
    ilocation?: string;
}

export interface Comprops {
    /**Component uri usually comes from function configuration (set by SysComp.extendLinks) */
	uri: string;
    /**The matching url in React.Route */
	match: {path: string};
};

// export type WelcomeProp = Readonly<{ classes: {board: any}; sys: typeof SysComp } extends Comprops>;
export interface WelcomeProp extends Comprops {
    readonly classes: { board: any }
    readonly sys: typeof SysComp
};

export interface PollsProp extends Comprops{
    readonly classes: { crudButton: string, list: string }
};
