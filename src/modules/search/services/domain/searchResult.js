
/**
 * @enum
 */
export const SearchResultTypes = Object.freeze({
	LOCATION: Symbol.for('location'),
	GEORESOURCE: Symbol.for('georesource'),
	CADASTRAL_PARCEL: Symbol.for('cadastral_parcel')
});

/**
 * Represents a single search result.
 * @class
 * @abstract
 * @author taulinger
 */
export class SearchResult {

	/**
	 *
	 * @param {string} label the label (plan text)
	 * @param {string} labelFormated  the label (html formatted)
	 */
	constructor(label, labelFormated = label) {
		if (this.constructor === SearchResult) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		this.checkDefined(label, 'label');

		this._label = label;
		this._labelFormated = labelFormated;
	}

	/**
	 * protected
	 * @param {*} value
	 * @param {*} name
	 */
	checkDefined(value, name) {
		if (!value) {
			throw new TypeError(name + ' must not be undefined');
		}
	}

	get label() {
		return this._label;
	}

	get labelFormated() {
		return this._labelFormated;
	}

	/**
	 * @abstract
	 */
	getType() {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #getType or do not call super.getType from child.');
	}
}

export class LocationSearchResult extends SearchResult {

	constructor(label, labelFormated, center = null, extent = null) {
		super(label, labelFormated);
		this._center = center;
		this._extent = extent;
	}

	get center() {
		return this._center;
	}

	get extent() {
		return this._extent;
	}

	getType() {
		return SearchResultTypes.LOCATION;
	}
}

export class CadastralParcelSearchResult extends SearchResult {

	constructor(label, labelFormated, center = null, extent = null) {
		super(label, labelFormated);
		this._center = center;
		this._extent = extent;
	}

	get center() {
		return this._center;
	}

	get extent() {
		return this._extent;
	}

	getType() {
		return SearchResultTypes.CADASTRAL_PARCEL;
	}
}

export class GeoResourceSearchResult extends SearchResult {

	constructor(geoResourceId, label, labelFormated) {
		super(label, labelFormated);
		this._geoResourceId = geoResourceId;
	}

	get geoResourceId() {
		return this._geoResourceId;
	}

	getType() {
		return SearchResultTypes.GEORESOURCE;
	}
}
