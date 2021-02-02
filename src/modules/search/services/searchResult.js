/**
 * @enum
 */
export const SearchResultTypes = Object.freeze({
	LOCATION: Symbol.for('location'),
	GEORESOURCE: Symbol.for('georesource'),
});

/**
 * Represents a single search result.
 * @class
 * @author aul
 */
export class SearchResult {

	constructor(id, label, labelFormated, type, center, extent = []) {
		this._id = id;
		this._label = label;
		this._labelFormated = labelFormated;
		this._type = type;
		this._center = center;
		this._extent = extent;
	}

	get id() {
		return this._id;
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
