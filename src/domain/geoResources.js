/**
 * @module domain/geoResources
 */
import { $injector } from '../injection';
import { getDefaultAttribution } from '../services/provider/attribution.provider';
import { getDefaultVectorGeoResourceLoaderForUrl } from '../services/provider/geoResource.provider';
import { isExternalGeoResourceId, isNumber, isString } from '../utils/checks';
import { StyleHint } from './styles';

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
	OAF: Symbol.for('oaf'),
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
		this._updateInterval = null;
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
	 * The attribution of this GeoResource
	 * @type {Attribution|Array<Attribution>|string|null}
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
	 * `true` if this GeoResource is allowed to be listed as a result for a query (e.g. FeatureInfo)
	 *  @type {boolean}
	 */
	get queryable() {
		return this._queryable;
	}

	/**
	 * `true` if this GeoResource is allowed to be exported (e.g. to PDF)
	 *  @type {boolean}
	 */
	get exportable() {
		return this._exportable;
	}

	/**
	 * Returns a list of timestamps for this GeoResource
	 *  @type {Array<String>}
	 */
	get timestamps() {
		return [...this._timestamps];
	}

	/**
	 * The update interval in seconds for this GeoResource
	 * @type {number}
	 */
	get updateInterval() {
		return this._updateInterval;
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

	/**
	 *
	 * @param {string} label
	 * @returns {GeoResource} `this` for chaining
	 */
	setLabel(label) {
		this._label = label;
		return this;
	}

	/**
	 *
	 * @param {number} opacity
	 * @returns {GeoResource} `this` for chaining
	 */
	setOpacity(opacity) {
		this._opacity = opacity;
		return this;
	}

	/**
	 *
	 * @param {number} minZoom
	 * @returns {GeoResource} `this` for chaining
	 */
	setMinZoom(minZoom) {
		this._minZoom = minZoom;
		return this;
	}

	/**
	 *
	 * @param {number} maxZoom
	 * @returns {GeoResource} `this` for chaining
	 */
	setMaxZoom(maxZoom) {
		this._maxZoom = maxZoom;
		return this;
	}

	/**
	 * Set to `true` if this GeoResource should not or cannot be exposed externally and is therefore not available for some use cases (e.g. sharing)
	 * @param {boolean} hidden
	 * @returns {GeoResource} `this` for chaining
	 */
	setHidden(hidden) {
		this._hidden = hidden;
		return this;
	}

	/**
	 * Sets the attribution for this GeoResource.
	 * @param {Attribution|Array<Attribution>|string|null} attribution
	 * @returns {GeoResource} `this` for chaining
	 */
	setAttribution(attribution) {
		this._attribution = attribution;
		return this;
	}

	/**
	 * Sets the attribution provider for this GeoResource.
	 * @param {attributionProvider} provider
	 * @returns {GeoResource} `this` for chaining
	 */
	setAttributionProvider(provider) {
		this._attributionProvider = provider;
		return this;
	}

	/**
	 *
	 * @param {string} type
	 * @returns {GeoResource} `this` for chaining
	 */
	setAuthenticationType(type) {
		this._authenticationType = type;
		return this;
	}

	/**
	 * Set to `true` if this GeoResource is allowed to be listed as a result for a query
	 * @param {boolean} queryable
	 * @returns {GeoResource} `this` for chaining
	 */
	setQueryable(queryable) {
		this._queryable = queryable;
		return this;
	}

	/**
	 * Set to `true` if this GeoResource is allowed to be exported
	 * @param {boolean} exportable
	 * @returns {GeoResource} `this` for chaining
	 */
	setExportable(exportable) {
		this._exportable = exportable;
		return this;
	}

	/**
	 * Set the timestamps of this GeoResource
	 * @param {Array<string>} timestamps Timestamps of this GeoResource
	 * @returns {GeoResource} `this` for chaining
	 */
	setTimestamps(timestamps) {
		if (timestamps) {
			this._timestamps = [...timestamps];
		}
		return this;
	}

	/**
	 * Sets the update interval in seconds for this GeoResource but only if the GeoResource can be updated by an interval.
	 * @see {GeoResource#isUpdatableByInterval}
	 * @param {number|null} updateInterval
	 * @returns {GeoResource} `this` for chaining
	 */
	setUpdateInterval(updateInterval) {
		if (this.isUpdatableByInterval()) {
			this._updateInterval = updateInterval;
		}
		return this;
	}

	/**
	 * Set the roles for authentication/authorization of this GeoResource
	 * and updates its authentication type.
	 * @param {Array<string>} roles Roles of this GeoResource
	 * @returns {GeoResource} `this` for chaining
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
	 * @returns {boolean} `true` if the label is a non-default value
	 */
	hasLabel() {
		return !!this._label;
	}

	/**
	 * Checks if this GeoResource contains one or more timestamps
	 * @returns {boolean}`true` if it contains one or more timestamps
	 */
	hasTimestamps() {
		return this._timestamps.length > 0;
	}

	/**
	 * Checks if this GeoResource has an update interval.
	 * @returns {boolean}`true` if it has an update interval
	 */
	hasUpdateInterval() {
		return !!this._updateInterval;
	}

	/**
	 * Checks if this GeoResource is updatable by an interval. Default is `false`.
	 * Child classes that should be updatable must override this method.
	 * @returns {boolean} `true` if it is updatable by an interval
	 */
	isUpdatableByInterval() {
		return false;
	}

	/**
	 * Checks if this GeoResource has an HTTP based id
	 * which means it denotes an (imported) external resource.
	 * @returns {boolean}`true` if it an external GeoResource
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
			.setUpdateInterval(geoResource.updateInterval)
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
	 * @param {function (GeoResource, GeoResourceFuture): void} callback
	 */
	onResolve(callback) {
		this._onResolve.push(callback);
		return this;
	}

	/**
	 * Registers a function called when the loader function rejected.
	 * @param {function (GeoResourceFuture): void} callback
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
	/**
	 *
	 * @param {string} id
	 * @param {string} label
	 * @param {string} url
	 * @param {string} layers
	 * @param {string} format
	 */
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

	/**
	 *
	 * @param {object} extraParams
	 * @returns {WmsGeoResource} `this` for chaining
	 */
	setExtraParams(extraParams) {
		if (extraParams) {
			this._extraParams = { ...extraParams };
		}
		return this;
	}

	/**
	 *
	 * @param {number[]} maxSize
	 * @returns  {WmsGeoResource} `this` for chaining
	 */
	setMaxSize(maxSize) {
		if (maxSize) {
			this._maxSize = [...maxSize];
		}
		return this;
	}

	/**
	 * @override
	 */
	isUpdatableByInterval() {
		return true;
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
	/**
	 *
	 * @param {string} id
	 * @param {string} label
	 * @param {string} url
	 */
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

	/**
	 *
	 * @param {string} tileGridId
	 * @returns {XyzGeoResource} `this` for chaining
	 */
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
 * Base class for vector data.
 * @class
 */
export class AbstractVectorGeoResource extends GeoResource {
	constructor(id, label) {
		super(id, label);
		if (this.constructor === AbstractVectorGeoResource) {
			// Abstract class can not be constructed.
			throw new Error('Can not construct abstract class.');
		}
		this._showPointNames = true;
		this._clusterParams = {};
		this._styleHint = null;
		this._style = null;
	}

	/**
	 * @returns {boolean} `true` if this `AbstractVectorGeoResource` should be displayed clustered
	 */
	isClustered() {
		return !!Object.keys(this._clusterParams).length;
	}

	get clusterParams() {
		return { ...this._clusterParams };
	}

	/**
	 *
	 * @param {object} clusterParams
	 * @returns {AbstractVectorGeoResource} `this` for chaining
	 */
	setClusterParams(clusterParams) {
		if (clusterParams) {
			this._clusterParams = { ...clusterParams };
		}
		return this;
	}

	/**
	 * @returns {boolean}`true` if this AbstractVectorGeoResource has specific `StyleHint`
	 */
	hasStyleHint() {
		return this.isClustered() ? true : !!this._styleHint;
	}

	get styleHint() {
		if (this.isClustered() && !this._styleHint) {
			return StyleHint.CLUSTER;
		}
		return this._styleHint;
	}

	/**
	 * Set the style hint for this `AbstractVectorGeoResource`
	 * @param {StyleHint|null} styleHint
	 * @returns {AbstractVectorGeoResource} `this` for chaining
	 */
	setStyleHint(styleHint) {
		if (styleHint || styleHint === null) {
			this._styleHint = styleHint;
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
	 * @returns {AbstractVectorGeoResource} `this` for chaining
	 */
	setShowPointNames(showPointNames) {
		this._showPointNames = showPointNames;
		return this;
	}

	/**
	 * Sets the `Style` for this `AbstractVectorGeoResource`.
	 * @param {module:domain/styles~Style|null} style the style
	 * @returns {AbstractVectorGeoResource} `this` for chaining
	 */
	setStyle(style) {
		if (style || style === null) {
			this._style = style;
		}
		return this;
	}

	/**
	 * The style of this `AbstractVectorGeoResource`.
	 *  @type {module:domain/styles~Style|null}
	 */
	get style() {
		return this._style;
	}

	/**
	 * @returns {boolean}`true` if this AbstractVectorGeoResource has specific `Style`
	 */
	hasStyle() {
		return !!this._style;
	}
}

/**
 * GeoResource for vector data.
 * The data are hold either as string (together with a SRID) or by one or more `BaFeatures`.
 * @class
 */
export class VectorGeoResource extends AbstractVectorGeoResource {
	/**
	 *
	 * @param {string} id
	 * @param {String} label
	 * @param {VectorSourceType} [vectorSourceType] The type of the internal vector data. Only required if the data are hold as `string`.
	 */
	constructor(id, label, vectorSourceType = null) {
		super(id, label);
		this._sourceType = vectorSourceType;
		this._data = null;
		this._srid = null;
		this._localData = false;
		this._features = [];
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

	get features() {
		return [...this._features];
	}

	/**
	 * Sets the source of this `VectorGeoResource`.
	 * @param {string} data
	 * @param {number} srid of the data
	 * @returns {VectorGeoResource} `this` for chaining
	 */
	setSource(data, srid) {
		this._data = data;
		this._srid = srid;
		return this;
	}

	/**
	 * Sets the features of this `VectorGeoResource`.
	 * Existing features will be replaced.
	 * @param {BaFeature[]} features
	 * @returns {VectorGeoResource} `this` for chaining
	 */
	setFeatures(features) {
		this._features = [...features];
		return this;
	}

	/**
	 * Adds a features to the existing features.
	 * @param {BaFeature} feature
	 * @returns {VectorGeoResource} `this` for chaining
	 */
	addFeature(feature) {
		this._features.push(feature);
		return this;
	}

	/**
	 *
	 * @returns {boolean} `true` if this `VectorGeoResource` contains features
	 */
	hasFeatures() {
		return this._features.length > 0;
	}

	/**
	 * @override
	 * @returns {boolean} `true` if this `VectorGeoResource` contains an non empty string and no fallback as label
	 */
	hasLabel() {
		return !!this._label || this.label !== this._getFallbackLabel();
	}

	/**
	 *
	 * @returns {boolean} `true` when the data are local data (e.g. imported locally by the user)
	 */
	get localData() {
		return this._localData;
	}

	/**
	 * Mark this `VectorGeoResource` as containing local data
	 * @param {boolean} localData
	 * @returns {VectorGeoResource} `this` for chaining
	 */
	markAsLocalData(localData) {
		this._localData = localData;
		return this;
	}

	/**
	 * @override
	 */
	isUpdatableByInterval() {
		return !this.localData;
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
export class RtVectorGeoResource extends AbstractVectorGeoResource {
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
	}

	get url() {
		return this._url;
	}

	get sourceType() {
		return this._sourceType;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.RT_VECTOR;
	}
}

/**
 * Represents an OGC Api Feature collection
 */
export class OafGeoResource extends AbstractVectorGeoResource {
	/**
	 *
	 * @param {string} id
	 * @param {string} label
	 * @param {string} url
	 * @param {string} collectionId
	 * @param {number} srid
	 */
	constructor(id, label, url, collectionId, srid) {
		super(id, label);
		this._url = url;
		this._collectionId = collectionId;
		this._limit = null;
		this._srid = srid;
		this._filter = null;
	}

	/**
	 * The id of the referenced collections
	 */
	get collectionId() {
		return this._collectionId;
	}

	/**
	 * The base url of the OGC Api Feature service
	 */
	get url() {
		return this._url;
	}

	/**
	 * The supported SRID of the OGC Api Feature collection
	 */
	get srid() {
		return this._srid;
	}

	/**
	 * The max. number of features that should be requested
	 */
	get limit() {
		return this._limit;
	}

	/**
	 * The default filter expression for this `OafGeoResource`
	 */
	get filter() {
		return this._filter;
	}

	/**
	 * Sets the max. number of features that should be requested
	 * @param {number} limit
	 * @returns {OafGeoResource} `this` for chaining
	 */
	setLimit(limit) {
		if (isNumber(limit)) {
			this._limit = limit;
		}
		return this;
	}
	/**
	 * Sets the default filter expression for this `OafGeoResource`
	 * @param {string} filter
	 * @returns {OafGeoResource} `this` for chaining
	 */
	setFilter(filter) {
		if (isString(filter)) {
			this._filter = filter;
		}
		return this;
	}

	/**
	 *
	 * @returns {boolean} true if a default filter expression is set for this `OafGeoResource`
	 */
	hasFilter() {
		return !!this._filter;
	}

	/**
	 *
	 * @returns {boolean} true if a max. number of features is set
	 */
	hasLimit() {
		return !!this._limit;
	}

	/**
	 * @override
	 */
	isUpdatableByInterval() {
		return true;
	}

	/**
	 * @override
	 */
	getType() {
		return GeoResourceTypes.OAF;
	}
}

/**
 * @class
 */
export class AggregateGeoResource extends GeoResource {
	/**
	 *
	 * @param {string} id
	 * @param {string} label
	 * @param {string[]} geoResourceIds
	 */
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
	/**
	 *
	 * @param {string} id
	 * @param {string} label
	 * @param {string} styleUrl
	 */
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
