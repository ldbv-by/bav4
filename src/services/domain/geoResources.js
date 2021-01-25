/**
 * @enum
 */
export const GeoResourceTypes = Object.freeze({
	WMS: Symbol('wms'),
	WMTS: Symbol('wmts'),
	VECTOR: Symbol('vector'),
	VECTOR_TILES: Symbol('vector_tiles'),
	AGGREGATE: Symbol('aggregate')
});

/**
* @abstract
* @class
*/
export class GeoResource {

	constructor(id, label = '') {
		if (this.constructor === GeoResource) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		this.checkDefined(id, 'id');

		this._id = id;
		this._label = label;
		this._background = false;
		this._opacity = 1.0;
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

	get id() {
		return this._id;
	}

	get label() {
		return this._label;
	}

	get background() {
		return this._background;
	}

	get opacity() {
		return this._opacity;
	}

	set background(background) {
		this._background = background;
	}

	set opacity(opacity) {
		this._opacity = opacity;
	}

	/**
	 * @abstract
	 */
	getType() {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #getType or do not call super.getType from child.');
	}

}

export class WmsGeoResource extends GeoResource {

	constructor(id, label, url, layers, format) {
		super(id, label);
		this._url = url;
		this._layers = layers;
		this._format = format;
	}

	get url() {
		return this._url;
	}

	get layers() {
		return this._layers;
	}

	get format() {
		return this._format;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.WMS;
	}

}
export class WMTSGeoResource extends GeoResource {
	constructor(id, label, url) {
		super(id, label);
		this._url = url;
	}

	get url() {
		return this._url;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.WMTS;
	}
}