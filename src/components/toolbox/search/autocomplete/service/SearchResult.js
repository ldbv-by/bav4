/**
 * Represents a single search result.
 * @class
 * @author aul
 */
export class SearchResult {

	constructor(label, labelFormated, type, center, extent = []) {
		this._label = label;
		this._labelFormated = labelFormated;
		this._type = type;
		this._center = center;
		this._extent = extent;
	}

	get label() {
		return this._label;
	}

	get labelFormated() {
		return this._labelFormated;
	}

	get type() {
		return this._type;
	}

	get center() {
		return this._center;
	}

	get extent() {
		return this._extent;
	}

}
