
export class Semantier {

	constructor(port) {
		this.port = port;
	}

	validate(rec, fields, invalidStyle) {
		if (this.disableValidate)
			return true;

		let that = this;

		const invalid = Object.assign(invalidStyle || {}, { border: "2px solid red" });

		let valid = true;
		fields.forEach( (f, x) => {
			f.valid = validField(rec, f, { validator: (v) => !!v });
			f.style = f.valid ? undefined : invalid;
			valid &= f.valid;
		} );
		return valid;

		function validField (record, f, valider) {
			let v = record[f.field];

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return false;

			if (typeof valider === 'function')
				return valider(v);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v === null || v.length === 0))
					return false;
				if (vd.len && v && v.length > vd.len)
					return false;
				return true;
			}
			else // no validator
				return true;
		}
	}
}
