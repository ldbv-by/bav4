/**
 * @module domain/geoResources
 */
import { $injector } from '../injection';
import { getDefaultAttribution } from '../services/provider/attribution.provider';
import { getDefaultVectorGeoResourceLoaderForUrl } from '../services/provider/geoResource.provider';
import { isExternalGeoResourceId } from '../utils/checks';

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
 * A function that returns an {@link Attribution} (or an array of them).
 * @typedef {Function} attributionProvider
 * @param {GeoResource} geoResource the GeoResource
 * @param {number} [level] level (index-like value, can be a zoom level of a map)
 * @returns {Attribution|Array<Attribution>}
 */

/**
 * @readonly
 * @enum {Symbol}
 */
export const GeoResourceTypes = Object.freeze({
	WMS: Symbol.for('wms'),
	XYZ: Symbol.for('xyz'),
	VECTOR: Symbol.for('vector'),
	RT_VECTOR: Symbol.for('rtvector'),
	VT: Symbol.for('vt'),
	AGGREGATE: Symbol.for('aggregate'),
	FUTURE: Symbol.for('future')
});

/**
 * Enum of all supported authentication types.
 * @readonly
 * @enum {String}
 */
export const GeoResourceAuthenticationType = Object.freeze({
	/**
	 * Basic access authentication
	 */
	BAA: 'baa',
	/**
	 * Internal application based authentication
	 */
	APPLICATION: 'application'
});

/**
 * Parent class of all GeoResource types.
 * Obligatory fields are set in the constructor.
 * Optional fields have a setter method which returns the GeoResource instance for chaining.
 * @abstract
 * @class
 */
export class GeoResource {
	/**
	 *
	 * @param {string} id the id of this GeoResource
	 * @param {string | null} [label] the label of this GeoResource
	 */
	constructor(id, label = null) {
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
		this._authRoles = [];
		this._timestamps = [];
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
	 * @type {string|null}
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
	 * The minimum zoom level of this GeoResource
	 *  @type {number}
	 */
	get minZoom() {
		return this._minZoom;
	}

	/**
	 * The maximum zoom level of this GeoResource
	 *  @type {number}
	 */
	get maxZoom() {
		return this._maxZoom;
	}

	/**
	 * `true` if this GeoResource should not or cannot be exposed externally and is therefore not available for some use cases (e.g. sharing)
	 *  @type {boolean}
	 */
	get hidden() {
		return this._hidden;
	}

	/**
	 *  @type {Attribution|Array<Attribution>|string|null}
	 */
	get attribution() {
		return this._attribution;
	}

	/**
	 * The authentication type of this GeoResource (may be `null`)
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
	 * `true` if this GeoResource is allowed to be exported.
	 *  @type {boolean}
	 */
	get exportable() {
		return this._exportable;
	}

	/**
	 * Returns a list of timestamps for this GeoResource.
	 *  @type {Array<String>}
	 */
	get timestamps() {
		return [...this._timestamps];
	}

	/**
	 * Returns a list of roles which are allowed to access this GeoResource.
	 * An empty array means any user can access this GeoResource.
	 *  @type {Array<String>}
	 */
	get authRoles() {
		return [...this._authRoles];
	}

	get attributionProvider() {
		return this._attributionProvider;
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
	 * Set the timestamps of this GeoResource
	 * @param {Array<string>} timestamps Timestamps of this GeoResource
	 * @returns `this` for chaining
	 */
	setTimestamps(timestamps) {
		if (timestamps) {
			this._timestamps = [...timestamps];
		}
		return this;
	}

	/**
	 * Set the roles for authentication/authorization of this GeoResource
	 * and updates its authentication type.
	 * @param {Array<string>} roles Roles of this GeoResource
	 * @returns `this` for chaining
	 */
	setAuthRoles(roles) {
		if (roles) {
			this._authRoles = [...roles];
			if (roles.length > 0) {
				this.setAuthenticationType(GeoResourceAuthenticationType.APPLICATION);
			}
		}
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
	 * Checks if this GeoResource contains one or more timestamps
	 * @returns `true` if it contains one or more timestamps
	 */
	hasTimestamps() {
		return this._timestamps.length > 0;
	}

	/**
	 * Checks if this GeoResource has an HTTP based id
	 * which means it denotes an (imported) external resource.
	 */
	isExternal() {
		return isExternalGeoResourceId(this.id);
	}

	/**
	 * Returns an array of attributions determined by the attributionProvider (optionally for a specific zoom level)
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
	 * Returns the type of this GeoResource
	 * @abstract
	 * @returns {GeoResourceTypes}
	 */
	getType() {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #getType or do not call super.getType from child.');
	}

	/**
	 * Copies all properties from the given GeoResource except for the `id`.
	 * @param {GeoResource} geoResource the GeoResource the properties should be copied from
	 * @returns {GeoResource} this for chaining
	 */
	copyPropertiesFrom(geoResource) {
		return this.setLabel(geoResource.label)
			.setOpacity(geoResource.opacity)
			.setMinZoom(geoResource.minZoom)
			.setMaxZoom(geoResource.maxZoom)
			.setHidden(geoResource.hidden)
			.setAttribution(geoResource.attribution)
			.setAttributionProvider(geoResource.attributionProvider)
			.setQueryable(geoResource.queryable)
			.setExportable(geoResource.exportable)
			.setTimestamps(geoResource.timestamps)
			.setAuthRoles(geoResource.authRoles)
			.setAuthenticationType(geoResource.authenticationType);
	}
}

/**
 * An async function that loads a {@link GeoResource}.
 * @async
 * @typedef {Function} asyncGeoResourceLoader
 * @param {string} id Id of the requested GeoResource
 * @returns {GeoResource} the loaded GeoResource
 * @throws {UnavailableGeoResourceError}
 */

/**
 * Wrapper for a GeoResource that can be loaded from an external source by calling `get()`.
 */
export class GeoResourceFuture extends GeoResource {
	/**
	 *
	 * @param {string} id The id of this GeoResource
	 * @param {module:domain/geoResources~asyncGeoResourceLoader} loader  The loader function of this GeoResourceFuture
	 * @param {string} [label] The label of this GeoResource
	 */
	constructor(id, loader, label = null) {
		super(id, label);
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
		return this;
	}

	/**
	 * Registers a function called when the loader function rejected.
	 * @param {function (GeoResourceFuture)} callback
	 */
	onReject(callback) {
		this._onReject.push(callback);
		return this;
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
	 *
	 * Note: It's up to the loader implementation which properties of the GeoResourceFuture instance are copied to the resolved GeoResource.
	 * @returns GeoResource
	 * @throws {UnavailableGeoResourceError} Error of the underlying loader
	 */
	async get() {
		try {
			const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
			const resolvedGeoResource = await this._loader(this.id);
			// replace the GeoResourceFuture by the resolved GeoResource in the cache
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
		this._maxSize = null;
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

	get maxSize() {
		return this._maxSize ? [...this._maxSize] : null;
	}

	setExtraParams(extraParams) {
		if (extraParams) {
			this._extraParams = { ...extraParams };
		}
		return this;
	}

	setMaxSize(maxSize) {
		if (maxSize) {
			this._maxSize = [...maxSize];
		}
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
		this._urls = url;
		this._tileGridId = null;
	}

	/**
	 * The urls of this `XyzGeoResource`.
	 *  @type {string|string[]}
	 */
	get urls() {
		return this._urls;
	}

	/**
	 * Returns an identifier for a TileGrid other than the widely-used Google grid.
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
 * @readonly
 * @enum {Symbol}
 */
export const VectorSourceType = Object.freeze({
	KML: Symbol.for('kml'),
	GPX: Symbol.for('gpx'),
	GEOJSON: Symbol.for('geojson'),
	EWKT: Symbol.for('ewkt')
});

/**
 * GeoResource for vector data.
 * @class
 */
export class VectorGeoResource extends GeoResource {
	constructor(id, label, sourceType) {
		super(id, label);
		this._sourceType = sourceType;
		this._data = null;
		this._srid = null;
		this._showPointNames = true;
		this._clusterParams = {};
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
	 * Sets the source of this  GeoResource.
	 * @param {string} data
	 * @param {number} srid of the data
	 * @returns `this` for chaining
	 */
	setSource(data, srid) {
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
	 * @returns `true` if this VectorGeoResource should be displayed clustered
	 */
	isClustered() {
		return !!Object.keys(this._clusterParams).length;
	}

	get clusterParams() {
		return { ...this._clusterParams };
	}

	setClusterParams(clusterParams) {
		if (clusterParams) {
			this._clusterParams = { ...clusterParams };
		}
		return this;
	}

	get showPointNames() {
		return this._showPointNames;
	}

	/**
	 * Currently effective only for KML:
	 * Show names as labels for placemarks which contain points.
	 * @param {boolean} showPointNames
	 * @returns
	 */
	setShowPointNames(showPointNames) {
		this._showPointNames = showPointNames;
		return this;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.VECTOR;
	}

	/**
	 * Returns a {@link GeoResourceFuture} which will be resolved to a {@link VectorGeoResource}
	 * by the the default loader. All properties set on the GeoResourceFuture will be copied to the resolved VectorGeoResource.
	 *
	 * @param {string} id
	 * @param {string} url
	 * @param {VectorSourceType} sourceType
	 * @param {string | null} [label]
	 * @returns {GeoResourceFuture}
	 */
	static forUrl(id, url, sourceType, label = null) {
		return new GeoResourceFuture(id, getDefaultVectorGeoResourceLoaderForUrl(url, sourceType, id, label))
			.setLabel(label)
			.onResolve((resolved, future) => {
				resolved.copyPropertiesFrom(future);
			});
	}
}

/**
 * GeoResource for real-time vector data.
 * @class
 */
export class RtVectorGeoResource extends GeoResource {
	/**
	 * @param {string} id
	 * @param {String} label
	 * @param {String} url
	 * @param {VectorSourceType} sourceType
	 */
	constructor(id, label, url, sourceType) {
		super(id, label);
		this._url = url;
		this._sourceType = sourceType;
		this._clusterParams = {};
	}

	get url() {
		return this._url;
	}

	get sourceType() {
		return this._sourceType;
	}

	get clusterParams() {
		return { ...this._clusterParams };
	}

	setClusterParams(clusterParams) {
		if (clusterParams) {
			this._clusterParams = { ...clusterParams };
		}
		return this;
	}

	/**
	 * @returns `true` if this RtVectorGeoResource should be displayed clustered
	 */
	isClustered() {
		return !!Object.keys(this._clusterParams).length;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.RT_VECTOR;
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
