import React from "react";
import { AnTreegridCol, ClassNames, CompOpts, Media, regex, svgImgSrc } from "@anclient/anreact";
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
import { toggle } from "./toggle";
import { audio } from "./audio";
import { userCheck } from "./user-check";

const knownBlobs = {
    image: img, video: video, audio,
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

        this.buf.toggle = new Blob([toggle], {type: 'image/svg+xml'});
        this.buf.userCheck = new Blob([userCheck], {type: 'image/svg+xml'});
    }

    typeParser(col: AnTreegridCol, n: AnTreeNode, opts?: CompOpts) {
        let mime = n.node['mime'] || unknown;
		let src = regex.mime2type(mime as string) as PreviewType;
        let t;
		if (src) t = knownBlobs[src];
		else t = unknown;

        if (!this.buf.hasOwnProperty(src))
            this.buf[src] = svgImgSrc(t);

        return (<img key={n.id+mime} className={opts?.classes?.icon} src={this.buf[src]}></img>);
    }

    /**
     * @deprecated
     * @param opts
     * @returns 
     */
    toggleButton(opts: {classes?: ClassNames, media?: Media} = {}) {
        if (!this.buf.toggle)
            this.buf.toggle = new Blob([toggle], {type: 'image/svg+xml'});
        return (<img className={opts.classes?.toggle} src={URL.createObjectURL(this.buf.toggle)}></img>);
    }

    /**
     * @deprecated
     * @param name 
     * @param opts 
     * @returns 
     */
    svgIcon(name: 'toggle' | 'userCheck', opts: {classes?: ClassNames, media?: Media} = {}) {
        return (<img className={opts.classes ? opts.classes[name] : undefined}
                     src={URL.createObjectURL(this.buf[name])}>
                </img>);
    }
}
