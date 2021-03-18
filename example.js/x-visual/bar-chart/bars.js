import * as xv from 'x-visual'
import * as an from 'anclient'

/**
 * Subclass for rendering data objects
 * @class
 */
export default class Bars extends xv.XSys {
    constructor(ecs, options) {
        super(ecs);
        this.ecs = ecs;

        this.logcnt = 0;

        // create a cube with options
        if (ecs) {
            var cube = ecs.createEntity({
                id: 'cube0',
                Obj3: { geom: xv.XComponent.Obj3Type.BOX,
                        box: [200, 120, 80] },    // geometry parameters, for BOX, it's bounding box
                Visual: {vtype: xv.AssetType.mesh,
                         asset: '../../assets/rgb2x2.png' }
            });
        }
    }

    update(tick, entities) {
        if (this.logcnt < 2) {
            this.logcnt += 1;
            console.log('cube.update(): ', tick, entities)
        }

        for (const e of entities) {
             if (e.flag > 0) {
                // handling command like start an animation here
                this.cmd = x.xview.cmds[0].cmd;
            }
            else this.cmd = undefined;
        }
    }
}

Bars.query = {
    iffall: ['Visual']
};
