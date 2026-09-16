import { Style } from 'ol/style';

export class NamedStyle extends Style {
	#name;
	constructor(name, options) {
		super(options);
		this.#name = name;
	}

	get name() {
		return this.#name;
	}
}
