export class AnboxException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AnboxException';
	}

	getMessage(): string {
		return this.message || this.name;
	} 
};

