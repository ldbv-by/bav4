import { $injector } from '../injection';
import { round } from '../utils/numberUtils';
import { QueryParameters } from './domain/queryParameters';

export class ShareService {

	constructor(_window = window) {
		this._window = _window;
	}

	/**
	 * @public
	 * @param {string} textToCopy
	 * @returns {Promise<undefined> | Promise.reject}
	 */
	async copyToClipboard(textToCopy) {
		if (this._window.isSecureContext) {
			return this._window.navigator.clipboard.writeText(textToCopy);
		}
		throw new Error('Clipboard API is not available');
	}

	_mergeExtraParams(extractedState, extraParams) {
		for (const [key, value] of Object.entries(extraParams)) {

			//when a parameter is already present and denotes an array, value(s) will be appendend
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
	 * Encodes the current state to an url.
	 * @param {object} extraParams Additional parameters. Non-existing entries will be added. Existing values will be ignored except for values that are an array.
	 * In this case, existing values will be concatenated with the additional values.
	 * @returns {string} url
	 */
	encodeState(extraParams = {}) {
		const extractedState = this._mergeExtraParams(
			{
				...this._extractPosition(),
				...this._extractLayers(),
				...this._extractTopic()
			},
			extraParams
		);

		const searchParams = new URLSearchParams(extractedState);
		return window.location.href + '?' + decodeURIComponent(searchParams.toString());
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractPosition() {
		const {
			StoreService: storeService,
			CoordinateService: coordinateService,
			MapService: mapService
		} = $injector.inject('StoreService', 'CoordinateService', 'MapService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		//position
		const { position: { center } } = state;
		const { position: { zoom } } = state;
		//rotation
		const { position: { rotation } } = state;

		const digits = mapService
			.getSridDefinitionsForView()
			.find(df => df.code === mapService.getDefaultSridForView())
			.digits;

		const transformedCenter = coordinateService
			.transform(center, mapService.getSrid(), mapService.getDefaultSridForView())
			.map(n => n.toFixed(digits));

		const roundedZoom = round(zoom, ShareService.ZOOM_LEVEL_PRECISION);
		const roundedRotation = round(rotation, ShareService.ROTATION_VALUE_PRECISION);

		extractedState[QueryParameters.CENTER] = transformedCenter;
		extractedState[QueryParameters.ZOOM] = roundedZoom;
		if (rotation !== 0) {
			extractedState[QueryParameters.ROTATION] = roundedRotation;
		}
		return extractedState;
	}

	/**
	* @private
	* @returns {object} extractedState
	*/
	_extractLayers() {
		const {
			StoreService: storeService,
			GeoResourceService: geoResourceService
		} = $injector.inject('StoreService', 'GeoResourceService');

		const state = storeService.getStore().getState();

		const extractedState = {};

		const { layers: { active: activeLayers } } = state;
		const geoResourceIds = [];
		let layer_visibility = [];
		let layer_opacity = [];
		activeLayers
			.filter(l => !l.constraints.hidden)
			.filter(l => !geoResourceService.byId(l.geoResourceId).hidden)
			.forEach(l => {
				geoResourceIds.push(l.geoResourceId);
				layer_visibility.push(l.visible);
				layer_opacity.push(l.opacity);
			});
		//remove if it contains only default values
		if (layer_visibility.filter(lv => lv === false).length === 0) {
			layer_visibility = null;
		}
		//remove if it contains only default values
		if (layer_opacity.filter(lo => lo !== 1).length === 0) {
			layer_opacity = null;
		}
		extractedState[QueryParameters.LAYER] = geoResourceIds;
		if (layer_visibility) {
			extractedState[QueryParameters.LAYER_VISIBILITY] = layer_visibility;
		}
		if (layer_opacity) {
			extractedState[QueryParameters.LAYER_OPACITY] = layer_opacity;
		}
		return extractedState;
	}

	/**
	 * @private
	 * @returns {object} extractedState
	 */
	_extractTopic() {
		const {
			StoreService: storeService
		} = $injector.inject('StoreService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		//current topic
		const { topics: { current } } = state;

		extractedState[QueryParameters.TOPIC] = current;
		return extractedState;
	}


	static get ZOOM_LEVEL_PRECISION() {
		return 3;
	}

	static get ROTATION_VALUE_PRECISION() {
		return 4;
	}
}
