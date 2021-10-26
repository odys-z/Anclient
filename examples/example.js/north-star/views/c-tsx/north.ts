export interface Northprops {
    iportal?: string;
    servId: string;
    servs?: object;

    iwindow?: typeof window;
    iparent?: typeof parent;
    ilocation?: string;
}