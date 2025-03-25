
// TODO add a test case for this
export class CSSTransform {

    /** X, y translate */
    txy: number[];

    /** Client xy0 */
    cxy: number[];

    /** X, y delta */
    dxy: number[];

    /** Pinch Distances, [0]: starting, [1]: updating */
    pds: number[];

    scale : number;
    scale0: number;

    handling: boolean;
    pinching: boolean;

    constructor() {
        this.reset();

        this.transform.bind(this);
    }

    reset() {
        this.txy = [0, 0];
        this.cxy = [0, 0];
        this.dxy = [0, 0];
        this.pds = undefined;
        this.scale = 1.0;
        this.scale0 = 1.0;
        this.handling = false;
    }

    moveTo(e: {clientX: number, clientY: number}) {
        if (this.handling) {
            this.dxy[0] = e.clientX - this.cxy[0];
            this.dxy[1] = e.clientY - this.cxy[1];
            return Math.hypot(this.dxy[0], this.dxy[1]);
        }
        return 0;
    }

    start(e: {clientX: number, clientY: number}) {
        this.handling = true;
        this.handling = true;
        this.cxy[0] = e.clientX;
        this.cxy[1] = e.clientY;
        this.dxy = [0, 0];
        this.pds = undefined;
    }

    end() {
        this.handling = false;
        this.txy[0] += this.dxy[0];
        this.txy[1] += this.dxy[1];
        this.dxy = [0, 0];
    }

    scaleTo(e: {touches: TouchList}) {
        if (this.handling)
        if (e.touches && e.touches.length >= 2) {
            let d = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            if (this.pds === undefined)
                this.pds = [d, d];
            else this.pds[1] = d;
        }
    }

    scaleBy(e: {deltaY: number}) {
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out/in
        let scale = Math.max(0.1, Math.min(5, this.scale * zoomFactor)); // Clamp between 0.1 and 5
        this.scale = scale;
        return Math.abs(scale - this.scale0); 
    }

    stepScale() {
        this.scale0 = this.scale;
        return this;
    }

    transform() {
        let s = this.scale / this.scale0;
        let tx = (this.dxy[0] + this.txy[0]);
        let ty = (this.dxy[1] + this.txy[1]);
        return `scale(${s}) translate(${tx}px, ${ty}px)`;
    }
}
