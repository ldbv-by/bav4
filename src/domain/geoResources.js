import { $injector } from '../injection';
import { getDefaultAttribution } from '../services/provider/attribution.provider';
import { isHttpUrl } from '../utils/checks';

/**
 * Attribution data of a GeoResource.
 * Usually it contains at least a copyright label.
 * @typedef Attribution
 * @property {Copyright|Array<Copyright>|null} copyright
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
	XYZ: Symbol.for('xyz'),
	VECTOR: Symbol.for('vector'),
	VT: Symbol.for('vt'),
	AGGREGATE: Symbol.for('aggregate'),
	FUTURE: Symbol.for('future')
});

/**
 * Enum of all supported authentication types.
 * @enum
 */
export const GeoResourceAuthenticationType = Object.freeze({
	BAA: 'baa',
	PLUS: 'plus'
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
		this._authenticationType = null;
		this._queryable = true;
		this._exportable = true;
	}

	checkDefined(value, name) {
		if (!value) {
			throw new TypeError(name + ' must not be undefined');
		}
	}

	/**
	 * The ID of this GeoResource
	 * @type {string}
	 */
	get id() {
		return this._id;
	}

	/**
	 * The label of this GeoResource
	 * @type {string}
	 */
	get label() {
		return this._label;
	}

	/**
	 * The opacity (0-1) of this GeoResource
	 * @type {number}
	 */
	get opacity() {
		return this._opacity;
	}

	/**
	 * The minimal zoom level of this GeoResource
	 *  @type {number}
	 */
	get minZoom() {
		return this._minZoom;
	}
	/**
	 * The maximal zoom level of this GeoResource
	 *  @type {number}
	 */
	get maxZoom() {
		return this._maxZoom;
	}
	/**
	 * `true` if this GeoResource should not be exposed externally and is not allowed for some use cases (e.g. sharing)
	 *  @type {boolean}
	 */
	get hidden() {
		return this._hidden;
	}

	/**
	 *  @type {Attribution}
	 */
	get attribution() {
		return this._attribution;
	}

	/**
	 * The authentication type of  this GeoResource (may be `null`)
	 *  @type {GeoResourceAuthenticationType}
	 */
	get authenticationType() {
		return this._authenticationType;
	}

	/**
	 * `true` if this GeoResource is allowed to be listed as a result for a query.
	 *  @type {boolean}
	 */
	get queryable() {
		return this._queryable;
	}

	/**
	 * `true` if this GeoResource is allowed to be listed as a result for a query.
	 *  @type {boolean}
	 */
	get exportable() {
		return this._exportable;
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

	/**
	 * Sets the attribution for this GeoResource.
	 * @param {Attribution|Array<Attribution>|string|null} attribution
	 * @returns `this` for chaining
	 */
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

	setAuthenticationType(type) {
		this._authenticationType = type;
		return this;
	}

	setQueryable(queryable) {
		this._queryable = queryable;
		return this;
	}

	setExportable(exportable) {
		this._exportable = exportable;
		return this;
	}

	/**
	 * Checks if this GeoResource contains a non-default value as label
	 * @returns `true` if the label is a non-default value
	 */
	hasLabel() {
		return !!this._label;
	}

	/**
	 * Checks if this GeoResource has an HTTP based id
	 * which means it denotes an (imported) external resource.
	 */
	isExternal() {
		return isHttpUrl(this.id.split('||')[0]);
	}

	/**
	 * Returns an array of attibutions determined by the attributionProvider (optionally for a specific zoom level)
	 * for this GeoResource.
	 * It returns `null` when no attributions are available.
	 * @param {number} [value=0] level (index-like value, can be a zoom level of a map)
	 * @returns {Array<Attribution>|null} attributions
	 * @throws Error when no attribution provider is found
	 */
	getAttribution(value = 0) {
		if (this._attributionProvider) {
			const attributions = this._attributionProvider(this, value);
			return Array.isArray(attributions) ? (attributions.length > 0 ? attributions : null) : attributions ? [attributions] : null;
		}
		throw new Error('No attribution provider found');
	}

	/**
	 * Returns the type of this GeoResouce
	 * @abstract
	 * @type {GeoResourceTypes}
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
	constructor(id, loader) {
		super(id);
		this._loader = loader;
		this._onResolve = [];
		this._onReject = [];
	}

	/**
	 * Registers a function called when the loader resolves.
	 * The callback function will be called with two arguments: the loaded `GeoResource` and the current `GeoResourceFuture`.
	 * @param {function (GeoResource, GeoResourceFuture): GeoResource|undefined} callback
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
			const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
			const resolvedGeoResource = await this._loader(this.id);
			// replace the GeoResourceFuture by the resolved GeoResource in the chache
			const observedGr = geoResourceService.addOrReplace(resolvedGeoResource);
			this._onResolve.forEach((f) => f(observedGr, this));
			return observedGr;
		} catch (error) {
			this._onReject.forEach((f) => f(this));
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
export class XyzGeoResource extends GeoResource {
	constructor(id, label, url) {
		super(id, label);
		this._url = url;
		this._tileGridId = null;
	}

	get url() {
		return this._url;
	}

	/**
	 * Returns an identifier for a TielGrid other than the widely-used Google grid.
	 * Default is `null`.
	 */
	get tileGridId() {
		return this._tileGridId;
	}

	setTileGridId(tileGridId) {
		this._tileGridId = tileGridId;
		return this;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.XYZ;
	}
}

/**
 * @enum
 */
export const VectorSourceType = Object.freeze({
	KML: Symbol.for('kml'),
	GPX: Symbol.for('gpx'),
	GEOJSON: Symbol.for('geojson'),
	EWKT: Symbol.for('ewkt')
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

	/**
	 *
	 * @returns `true` if this GeoResource contains an non empty string as label
	 */
	_getFallbackLabel() {
		switch (this.sourceType) {
			case VectorSourceType.KML:
				return 'KML';
			case VectorSourceType.GPX:
				return 'GPX';
			case VectorSourceType.GEOJSON:
				return 'GeoJSON';
			case VectorSourceType.EWKT:
				return 'EWKT';
			default:
				return '';
		}
	}

	get label() {
		return this._label ? this._label : this._getFallbackLabel();
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
	 * @returns `true` if this GeoResource contains an non empty string and no fallback as label
	 */
	hasLabel() {
		return !!this._label || this.label !== this._getFallbackLabel();
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

export class VTGeoResource extends GeoResource {
	constructor(id, label, styleUrl) {
		super(id, label);
		this._styleUrl = styleUrl;
	}

	get styleUrl() {
		return this._styleUrl;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.VT;
	}
}

/**
 * Returns an observable GeoResource.
 * All of its fields can be observed for changes.
 * @param {GeoResource} geoResource
 * @param {function (property, value)} onChanged callback function, called AFTER the value was changed
 * @param {String} [identifier] optional identifier which can be used to track if a specific callback function is already registered
 * @returns proxified GeoResource
 */
export const observable = (geoResource, onChanged, identifier = null) => {
	return new Proxy(geoResource, {
		set: function (target, prop, value) {
			if (Object.keys(target).includes(prop) && target[prop] !== value) {
				target[prop] = value;
				onChanged(prop, value);
				return true;
			}
			return Reflect.set(...arguments);
		},
		get: (target, key) => {
			if (identifier && key === identifier) {
				return true;
			}
			return target[key];
		}
	});
};
