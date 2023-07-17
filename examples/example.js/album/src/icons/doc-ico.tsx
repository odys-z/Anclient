import React from "react";
import { AnTreegridCol, ClassNames, regex } from "@anclient/anreact";
import { AnTreeNode } from '@anclient/semantier';
import { z7 } from "./7zip";
import { img } from "./image";
import { video } from "./video";
import { docx } from "./docx";
import { xls } from "./excel";
import { ppt } from "./ppt";
import { pdf } from "./pdf";
import { txt } from "./txt";
import { unknown } from "./unknown";

const knownBlobs = {
    image: img, video: video,
    '.txt': txt, '.csv': txt,
    '.doc': docx, '.docx': docx, '.ppt': ppt, '.pptx': ppt, '.xlsx': xls, '.xls': xls,
    '.zip': z7,
    '.pdf': pdf, '.rtf': txt,
    'unknown': unknown};
type PreviewType = keyof typeof knownBlobs;

export class DocIcon {
    buf = {} as any;

    constructor() {
        this.typeParser = this.typeParser.bind(this);
    }

    typeParser(col: AnTreegridCol, n: AnTreeNode, opts: {classes: ClassNames}) {
        let mime = n.node['mime'] || unknown;
		let src = regex.mime2type(mime as string) as PreviewType;
        let t;
		if (src) t = knownBlobs[src];
		else t = unknown;

        if (!this.buf.hasOwnProperty(src))
            this.buf[src] = new Blob([t], {type: 'image/svg+xml'});

        return (<img className={opts.classes.icon} src={URL.createObjectURL(this.buf[src])}></img>);
    }
}
