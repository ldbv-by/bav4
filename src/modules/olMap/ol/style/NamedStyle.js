/**
 * @module modules/olMap/ol/style/NamedStyle
 */
import { Style } from 'ol/style';

/**
 * Extends an openlayers style with a name.
 *
 * For usecases where a feature with an array of styles must be
 * changed and specific styles must be filtered.
 *
 * @class
 * @author thiloSchlemmer
 */
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
