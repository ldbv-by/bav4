/**
 * @module services/ShareService
 */
import { $injector } from '../injection';
import { round } from '../utils/numberUtils';
import { QueryParameters } from '../domain/queryParameters';
import { GlobalCoordinateRepresentations } from '../domain/coordinateRepresentation';
import { getOrigin, getPathParams } from '../utils/urlUtils';
import { CROSSHAIR_HIGHLIGHT_FEATURE_ID } from '../plugins/HighlightPlugin';
import { Tools } from '../domain/tools';

/**
 * Options for retrieving parameters.
 * @typedef ParameterOptions
 * @property {boolean} includeHiddenGeoResources `true` if hidden GeoResources should be included. Default is `false`.
 */

/**
 * A service providing methods to restore the current application e.g. through a URL.
 * @class
 */
export class ShareService {
	#environmentService;
	#configService;
	constructor() {
		const { EnvironmentService: environmentService, ConfigService: configService } = $injector.inject('EnvironmentService', 'ConfigService');
		this.#environmentService = environmentService;
		this.#configService = configService;
	}

	/**
	 * @public
	 * @param {string} textToCopy
	 * @returns {Promise<undefined>}
	 */
	async copyToClipboard(textToCopy) {
		if (this.#environmentService.getWindow().isSecureContext) {
			return this.#environmentService.getWindow().navigator.clipboard.writeText(textToCopy);
		}
		throw new Error('Clipboard API is not available');
	}

	_mergeExtraParams(extractedState, extraParams) {
		for (const [key, value] of Object.entries(extraParams)) {
			//when a parameter is already present and denotes an array, value(s) will be appended
			if (Object.keys(extractedState).includes(key)) {
				if (Array.isArray(extractedState[key])) {
					const values = Array.isArray(value) ? [...value] : [value];
					extractedState[key] = [...extractedState[key], ...values];
				}
			}
			//we add non-existing extra params
			else {
				extractedState[key] = value;
			}
		}
		return extractedState;
	}

	/**
	 * Returns all parameters of the current application that are required to restore it.
	 * For the keys of the returned object see {@link QueryParameters}.
	 *
	 * Note: Basically contains the same parameters as {@link ShareService#encodeState} and {@link ShareService#encodeStateForPosition}.
	 * @param {module:services/ShareService~ParameterOptions} [options]
	 * @returns {Map<QueryParameters,?>} a map containing the parameters
	 */
	getParameters(options = { includeHiddenGeoResources: false }) {
		const params = {
			...this._extractPosition(),
			...this._extractLayers(options),
			...this._extractTopic(),
			...this._extractRoute(),
			...this._extractTool(),
			...this._extractCrosshair(),
			...this._extractSwipeRatio()
		};

		return new Map(Object.entries(params));
	}

	/**
	 * Encodes the current state to a URL.
	 * The generated URL is based on the `FRONTEND_URL` config parameter.
	 * @param {object} [extraParams] Additional parameters. Non-existing entries will be added. Existing values will be ignored except for values that are an array.
	 * In this case, existing values will be concatenated with the additional values.
	 * @param {array} [pathParameters] Optional path parameters. Will be appended to the current pathname without further checks
	 * @returns {string} url
	 */
	encodeState(extraParams = {}, pathParameters = []) {
		return this.encodeStateForPosition({}, extraParams, pathParameters);
	}

	/**
	 * A combination of zoom and center and rotation. All properties are optional. Missing properties are replaced with the current state.
	 * @typedef {Object} Position
	 * @property {module:domain/coordinateTypeDef~Coordinate} [center] coordinate in map projection
	 * @property {number} [zoom] zoom level
	 * @property {number} [rotation] rotation in radians
	 */

	/**
	 * Same as {@link ShareService#encodeState} but for a designated position.
	 * @param {module:services/ShareService~Position} position The position
	 * @param {object} [extraParams] Additional parameters. Non-existing entries will be added. Existing values will be ignored except for values that are an array.
	 * In this case, existing values will be concatenated with the additional values.
	 * @param {array} [pathParameters] Optional path parameters. Will be appended to the current pathname without further checks
	 * @returns {string} url
	 */
	encodeStateForPosition(position, extraParams = {}, pathParameters = []) {
		const { center, zoom, rotation } = position;
		const extractedState = this._mergeExtraParams(
			{
				...this._extractPosition(center, zoom, rotation),
				...this._extractLayers({ includeHiddenGeoResources: false }),
				...this._extractTopic(),
				...this._extractRoute(),
				...this._extractTool(),
				...this._extractCrosshair(),
				...this._extractSwipeRatio()
			},
			extraParams
		);

		const baseUrl = `${getOrigin(this.#configService.getValueAsPath('FRONTEND_URL'))}/${getPathParams(
			this.#configService.getValueAsPath('FRONTEND_URL')
		)
			.filter((p) => !p.endsWith('.html'))
			.join('/')}`;
		const searchParams = new URLSearchParams(extractedState);
		const mergedPathParameters = pathParameters.length ? [...pathParameters] : [];
		return `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${mergedPathParameters.join('/')}?${decodeURIComponent(searchParams.toString())}`;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractPosition(_center, _zoom, _rotation) {
		const {
			StoreService: storeService,
			CoordinateService: coordinateService,
			MapService: mapService
		} = $injector.inject('StoreService', 'CoordinateService', 'MapService');

		const extractedState = {};

		const state = storeService.getStore().getState();
		const center = _center ?? state.position.center;
		const zoom = _zoom ?? state.position.zoom;
		const rotation = _rotation ?? state.position.rotation;

		// we use the defined SRID for local projected tasks (if available) otherwise WGS84
		const { digits, code } =
			mapService
				.getCoordinateRepresentations(center)
				.filter((cr) => cr.code)
				.filter((cr) => cr.code === mapService.getLocalProjectedSrid())[0] ?? GlobalCoordinateRepresentations.WGS84;

		const transformedCenter = coordinateService.transform(center, mapService.getSrid(), code).map((n) => n.toFixed(digits));

		const roundedZoom = round(zoom, ShareService.ZOOM_LEVEL_PRECISION);
		const roundedRotation = round(rotation, ShareService.ROTATION_VALUE_PRECISION);

		extractedState[QueryParameters.CENTER] = transformedCenter;
		extractedState[QueryParameters.ZOOM] = roundedZoom;
		extractedState[QueryParameters.ROTATION] = roundedRotation;
		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractLayers(options = { includeHiddenGeoResources: false }) {
		const { StoreService: storeService, GeoResourceService: geoResourceService } = $injector.inject('StoreService', 'GeoResourceService');

		const state = storeService.getStore().getState();

		const extractedState = {};

		const {
			layers: { active: activeLayers },
			tools: { current: currentTool }
		} = state;
		const geoResourceIds = [];
		let layer_visibility = [];
		let layer_opacity = [];
		let layer_timestamp = [];
		let layer_swipeAlignment = [];
		activeLayers
			.filter((l) => !l.constraints.hidden)
			.filter((l) => (options.includeHiddenGeoResources ? true : !geoResourceService.byId(l.geoResourceId).hidden))
			.forEach((l) => {
				geoResourceIds.push(l.geoResourceId);
				layer_visibility.push(l.visible);
				layer_opacity.push(l.opacity);
				layer_timestamp.push(l.timestamp);
				layer_swipeAlignment.push(l.constraints.swipeAlignment);
			});
		//remove if it contains only default values
		if (!layer_visibility.some((lv) => lv === false)) {
			layer_visibility = null;
		}
		if (!layer_opacity.some((lo) => lo !== 1)) {
			layer_opacity = null;
		}
		if (!layer_timestamp.some((t) => t)) {
			layer_timestamp = null;
		}
		if (currentTool !== Tools.COMPARE) {
			layer_swipeAlignment = null;
		}
		extractedState[QueryParameters.LAYER] = geoResourceIds.map((grId) => encodeURIComponent(grId)); //an GeoResource id may contain also an URL, so we encode it
		if (layer_visibility) {
			extractedState[QueryParameters.LAYER_VISIBILITY] = layer_visibility;
		}
		if (layer_opacity) {
			extractedState[QueryParameters.LAYER_OPACITY] = layer_opacity;
		}
		if (layer_timestamp) {
			extractedState[QueryParameters.LAYER_TIMESTAMP] = layer_timestamp.map((t) => (t === null ? '' : t));
		}
		if (layer_swipeAlignment) {
			extractedState[QueryParameters.LAYER_SWIPE_ALIGNMENT] = layer_swipeAlignment;
		}
		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractTopic() {
		const { StoreService: storeService } = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		//current topic
		const {
			topics: { current }
		} = state;

		extractedState[QueryParameters.TOPIC] = current;
		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractRoute() {
		const { StoreService: storeService } = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		const {
			routing: { waypoints, categoryId }
		} = state;

		if (waypoints.length > 0) {
			const { MapService: mapService } = $injector.inject('MapService');
			// waypoints should be rounded according to the internal projection of the map
			const { digits } = Object.values(GlobalCoordinateRepresentations).filter((cr) => cr.code === mapService.getSrid())[0];
			extractedState[QueryParameters.ROUTE_WAYPOINTS] = waypoints.map((wp) => wp.map((n) => n.toFixed(digits)));
			extractedState[QueryParameters.ROUTE_CATEGORY] = categoryId;
		}
		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractTool() {
		const { StoreService: storeService } = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		const {
			tools: { current }
		} = state;

		if (current) {
			extractedState[QueryParameters.TOOL_ID] = current;
		}

		return extractedState;
	}
	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractCrosshair() {
		const { StoreService: storeService } = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		const {
			highlight: { features }
		} = state;

		/**
		 * When we have exactly one highlight feature containing the CROSSHAIR_HIGHLIGHT_FEATURE_ID we add the CROSSHAIR query parameter.
		 */
		if (features.filter((hf) => hf.id === CROSSHAIR_HIGHLIGHT_FEATURE_ID).length === 1) {
			const { MapService: mapService } = $injector.inject('MapService');
			// crosshair coordinate should be rounded according to the internal projection of the map
			const { digits } = Object.values(GlobalCoordinateRepresentations).filter((cr) => cr.code === mapService.getSrid())[0];
			const feature = features.find((hf) => hf.id === CROSSHAIR_HIGHLIGHT_FEATURE_ID);
			const crosshairCoords = feature.data.coordinate.map((n) => n.toFixed(digits));
			extractedState[QueryParameters.CROSSHAIR] = [true, ...crosshairCoords];
		}

		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractSwipeRatio() {
		const { StoreService: storeService } = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		const {
			layerSwipe: { active, ratio }
		} = state;

		if (active) {
			extractedState[QueryParameters.SWIPE_RATIO] = ratio / 100;
		}

		return extractedState;
	}

	static get ZOOM_LEVEL_PRECISION() {
		return 3;
	}

	static get ROTATION_VALUE_PRECISION() {
		return 4;
	}
}
