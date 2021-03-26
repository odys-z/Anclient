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
	}

	create(vectors) {
		for (let i = 0; i < vectors.length; i++) {
			let v = vectors[i];
			let y = (v.amount - 95) * 2;
			let h = y / 2;
			this.ecs.createEntity({
				id: v.vid,
				Obj3: { geom: xv.XComponent.Obj3Type.BOX,
						box: [20, y, 20],
						transform: [ {translate: [i * 30 - 90, h, 0]} ]
					},
				Visual: {vtype: xv.AssetType.mesh,
						 asset: v.tex === '3' ? undefined : '../../assets/tex/rgb2x2.png'
					 }
			});
		}
		return this;
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
