export class AnprismException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AnprismException';
	}

	getMessage(): string {
		return this.message || this.name;
	} 
};

