import { isPromise } from '../../utils/checks';

/**
 * @enum
 */
export const GeoResourceTypes = Object.freeze({
	WMS: Symbol.for('wms'),
	WMTS: Symbol.for('wmts'),
	VECTOR: Symbol.for('vector'),
	VECTOR_TILES: Symbol.for('vector_tiles'),
	AGGREGATE: Symbol.for('aggregate')
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

	set label(label) {
		this._label = label;
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

/**
 * @class
 */
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

/**
 * @class
 */
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

/**
 * @enum
 */
export const VectorSourceType = Object.freeze({
	KML: Symbol.for('kml'),
	GPX: Symbol.for('gpx'),
	GEOJSON: Symbol.for('geojson'),
});


/**
 * Loads the data for VectorGeoResources.
 * @function
 * @name VectorGeoResourceLoader
 * @returns {Promise<VectorGeoResourceLoadResult>} laod result
 */

/**
 * @typedef {Object} VectorGeoResourceLoadResult
 * @property {string} data The raw data of a VectorGeoResource
 * @property {VectorSourceType} sourceType The source type of the data
 * @property {number} srid The srid of the data
 */

/**
 * GeoResource for vector data.
 * Data could be either loaded externally by Url or internally from a string.
 * @class
 */
export class VectorGeoResource extends GeoResource {
	constructor(id, label, sourceType) {
		super(id, label);
		this._url = null;
		this._sourceType = sourceType;
		this._data = null;
		this._srid = null;
	}

	get url() {
		return this._url;
	}

	get sourceType() {
		return this._sourceType;
	}

	/**
	 * Loads and caches the data and updates the source type for this Georesource.
	 * @returns {Promise<string>}
	 * @private
	 */
	async _load() {
		if (!this._data) {
			const { sourceType, data, srid } = await this._loader();
			this._sourceType = sourceType;
			this._data = data;
			this._srid = srid;
		}
		return this._data;
	}

	/**
	 * Gets the data of this 'internal' GeoResource.
	 * If the GeoResource has a loader, it will be used to laod the data and determine the source type. 
	 * If the data object is wrapped by a Promise, it will be resolved 
	 * and the resolved data will be cached internally.
	 * @returns {Promise<string>} data
	 */
	async getData() {
		if (this._loader) {
			return await this._load();
		}

		if (!isPromise(this._data)) {
			return this._data;
		}
		//cache the data
		return this._data = await Promise.resolve(this._data);
	}

	get srid() {
		return this._srid;
	}

	/**
	 * Sets the Url for this 'external' GeoResource.
	 * @param {string} url
	 * @returns `this` for chaining 
	 */
	setUrl(url) {
		this._url = url;
		this._data = null;
		this._srid = null;
		return this;
	}
	
	/**
	 * Sets the source of this 'internal' GeoResource.
	 * @param {Promise<string>|string} data 
	 * @param {number} srid 
	 * @returns `this` for chaining 
	 */
	setSource(data, srid) {
		this._url = null;
		this._data = data;
		this._srid = srid;
		return this;
	}

	
	/**
	 * Sets the loader of this 'internal' GeoResource.
	 * @param {VectorGeoResourceLoader} loader 
	 * @returns `this` for chaining 
	 */
	setLoader(loader) {
		this._sourceType = null;
		this._url = null;
		this._data = null;
		this._srid = null;
		this._loader = loader;
		return this;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.VECTOR;
	}
}

/**
 * @class
 */
export class AggregateGeoResource extends GeoResource {
	constructor(id, label, geoResourceIds) {
		super(id, label);
		this._geoResourceIds = [...geoResourceIds];
	}

	get geoResourceIds() {
		return [...this._geoResourceIds];
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.AGGREGATE;
	}
}
