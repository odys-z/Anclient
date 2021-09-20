
/**
 * Base class of semantic tier
 * @class
 */
export class Semantier {
	static invalidStyles = {
		ok: {},
		anyErr : { border: "1px solid red" },
		notNull: { backgroundColor: '#ff9800b0' },
		maxLen : { border: "1px solid red" },
		minLen : { border: "1px solid red" },
	}

	constructor(port) {
		this.port = port;
	}

	setContext(context) {
		if (!context || !context.anClient)
			console.error(this, "Setup semantic tier without React context?");

		this.client = context.anClient;
		this.errCtx = context.error;
	}

	validate(rec, fields) {
		if (!rec) rec = this.rec;
		if (!fields) fields = this.columns ? this.columns() : this.recFields;

		if (this.disableValidate)
			return true;

		let that = this;

		let valid = true;
		fields.forEach( (f, x) => {
			f.style = validField(rec, f);
			valid &= f.style === 'ok';
		} );
		return valid;

		function validField (record, f) {
			let v = record[f.field];

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return false;

			if (typeof f.validator === 'function')
				return f.validator(v, record, f);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v === null || v.length === 0))
					return 'notNull';
				if (vd.len && v && v.length > vd.len)
					return 'maxLen';
				return 'ok';
			}
			else // no validator
				return 'ok';
		}
	}
}
