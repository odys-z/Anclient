
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
    zoomsensity = 0.1;

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
        if (this.handling) {
            this.handling = false;
            this.txy[0] += this.dxy[0];
            this.txy[1] += this.dxy[1];
            this.dxy = [0, 0];
        }
    }

    pinchBegin(touches: TouchList) {
        if (!this.pinching && touches.length >= 2) {
            this.pinching = true;
            let d = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
            this.pds = [d, 0]; 
        }
    }

    pinchEnd(touches: TouchList) {
        if (this.pinching)
            this.pinching = false;
    }

    pinchTo(touches: TouchList) {
        if (this.pinching)
        if (touches && touches.length >= 2) {
            let d = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
            if (this.pds === undefined)
                this.pds = [d, d];
            else this.pds[1] = d;

            let d0 = this.pds[0] === 0.0 ? 0.01 : this.pds[0]; // d0 > 0

            let zoomFactor = 1 + (d - d0) / d0 * this.zoomsensity
            let scale = Math.max(0.1, Math.min(5, this.scale * zoomFactor)); // Clamp between 0.1 and 5
            this.scale = scale;

            console.log(zoomFactor, this.pds);
            return Math.abs(scale - this.scale0); 
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
