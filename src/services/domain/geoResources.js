import { getDefaultAttribution } from '../provider/attribution.provider';


/**
 * Attribution data of a GeoResource.
 * It contains at least a copyright label.
 * @typedef Attribution
 * @property {Copyright} copyright
 * @property {string} [description] description
 */

/**
 * Copyright data of an attribution.
 * @typedef Copyright
 * @property {string} label copyright label
 * @property {string} [url] copyright href
 */


/**
 * @enum
 */
export const GeoResourceTypes = Object.freeze({
	WMS: Symbol.for('wms'),
	WMTS: Symbol.for('wmts'),
	VECTOR: Symbol.for('vector'),
	VECTOR_TILES: Symbol.for('vector_tiles'),
	AGGREGATE: Symbol.for('aggregate'),
	FUTURE: Symbol.for('future')
});

/**
* Parent class of all GeoResource types.
* Obligatory fields are set in the constructor.
* Optional fields have a setter method which returns the GeoResource instance for chaining.
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
		this._opacity = 1.0;
		this._hidden = false;
		this._minZoom = null;
		this._maxZoom = null;
		this._attribution = null;
		this._attributionProvider = getDefaultAttribution;
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

	get opacity() {
		return this._opacity;
	}

	get minZoom() {
		return this._minZoom;
	}

	get maxZoom() {
		return this._maxZoom;
	}

	get hidden() {
		return this._hidden;
	}

	get attribution() {
		return this._attribution;
	}

	setLabel(label) {
		this._label = label;
		return this;
	}

	setOpacity(opacity) {
		this._opacity = opacity;
		return this;
	}

	setMinZoom(minZoom) {
		this._minZoom = minZoom;
		return this;
	}

	setMaxZoom(maxZoom) {
		this._maxZoom = maxZoom;
		return this;
	}

	setHidden(hidden) {
		this._hidden = hidden;
		return this;
	}

	setAttribution(attribution) {
		this._attribution = attribution;
		return this;
	}

	/**
	 * Sets the attribution provider for this GeoResource.
	 * @param {attributionProvider} provider
	 * @returns `this` for chaining
	 */
	setAttributionProvider(provider) {
		this._attributionProvider = provider;
		return this;
	}

	/**
	 * Returns an array of attibutions determined by the attributionProvider (optionally for a specific zoom level)
	 * for this GeoResouce.
	 * It returns `null` when no attributions are available.
	 * @param {number} [value=0] level (index-like value, can be a zoom level of a map)
	 * @returns {Array<Attribution>|null} attributions
	 * @throws Error when no attribution provider is found
	 */
	getAttribution(value = 0) {
		if (this._attributionProvider) {
			const attributions = this._attributionProvider(this, value);
			return Array.isArray(attributions)
				? attributions.length > 0 ? attributions : null
				: attributions ? [attributions] : null;
		}
		throw new Error('No attribution provider found');
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
 * An async function that loads a  {@link GeoResource}.
 *
 * @param {string} id Id of the requested GeoResource
 * @typedef {function(id) : (Promise<GeoResource>)} asyncGeoResourceLoader
 */

/**
 * Wrapper for a GeoResource that can be loaded from an external source by calling `get()`.
 */
export class GeoResourceFuture extends GeoResource {

	/**
	 *
	 * @param {string} id
	 * @param {asyncGeoResourceLoader} loader
	 */
	constructor(id, loader, label = '') {
		super(id, label);
		this._loader = loader;
		this._onResolve = [];
		this._onReject = [];
	}

	/**
	 * Registers a function called when the loader resolves.
	 * The callback function will be called with two arguments: the loaded `GeoResource` and the current `GeoResourceFuture`.
	 * @param {function (GeoResouce, GeoResourceFuture): GeoResource|undefined} callback
	 */
	onResolve(callback) {
		this._onResolve.push(callback);
	}

	/**
	 * Registers a function called when the loader function rejected.
	 * @param {function (GeoResourceFuture)} callback
	 */
	onReject(callback) {
		this._onReject.push(callback);
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.FUTURE;
	}

	/**
	 * Calls the loader function and returns the real GeoResource.
	 * Will be typically called by map implementations.
	 * @returns GeoResource
	 */
	async get() {
		try {
			const resolvedGeoResource = await this._loader(this.id);
			this._onResolve.forEach(f => f(resolvedGeoResource, this));
			return resolvedGeoResource;
		}
		catch (error) {
			this._onReject.forEach(f => f(this));
			throw error;
		}
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
		this._extraParams = {};
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

	get extraParams() {
		return { ...this._extraParams };
	}

	setExtraParams(extraParams) {
		this._extraParams = { ...extraParams };
		return this;
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
	GEOJSON: Symbol.for('geojson')
});



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

	get data() {
		return this._data;
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
	 * @param {number} srid of the data
	 * @returns `this` for chaining
	 */
	setSource(data, srid) {
		this._url = null;
		this._data = data;
		this._srid = srid;
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


/**
 * Returns an observable GeoResource.
 * All of its fields can be observed for changes.
 * @param {GeoResource} geoResource
 * @param {function (property, value)} onChange callback function
 * @returns proxified GeoResource
 */
export const observable = (geoResource, onChange) => {

	return new Proxy(geoResource, {
		set: function (target, prop, value) {
			if (Object.keys(target).includes(prop) && target[prop] !== value) {
				onChange(prop, value);
			}
			return Reflect.set(...arguments);
		}
	});
};
