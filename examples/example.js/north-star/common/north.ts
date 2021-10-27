
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

};

// export type WelcomeProp = Readonly<{ classes: {board: any}; sys: typeof SysComp } extends Comprops>;
export interface WelcomeProp extends Comprops {
    readonly classes: { board: any }
    readonly sys: typeof SysComp
};

export interface PollsProp {
    readonly classes: { crudButton: string, list: string }
};
