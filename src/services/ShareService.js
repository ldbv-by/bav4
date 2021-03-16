import { $injector } from '../injection';
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

	/**
	 * Encodes the current apps state to an url.
	 * @public
	 * @returns {string} url of the app 
	 */
	encodeState() {
		const extractedState = {
			...this._extractPosition(),
			...this._extractLayers()
		};
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
			MapService: mapService,
		} = $injector.inject('StoreService', 'CoordinateService', 'MapService');

		const state = storeService.getStore().getState();
		const extractedState = {};

		//position
		const { position: { center } } = state;
		const { position: { zoom } } = state;

		const digits = mapService
			.getSridDefinitionsForView()
			.find(df => df.code === mapService.getDefaultSridForView())
			.digits;

		const transformedCenter = coordinateService
			.transform(center, mapService.getSrid(), mapService.getDefaultSridForView())
			.map(n => n.toFixed(digits));

		extractedState[QueryParameters.CENTER] = transformedCenter;
		extractedState[QueryParameters.ZOOM] = zoom;
		return extractedState;
	}

	/**
	* @private
	* @returns {object} extractedState
	*/
	_extractLayers() {
		const {
			StoreService: storeService,
		} = $injector.inject('StoreService');

		const state = storeService.getStore().getState();

		const extractedState = {};

		const { layers: { active: activeLayers } } = state;
		const layer = [];
		let layer_visibility = [];
		let layer_opacity = [];
		activeLayers.forEach(l => {
			layer.push(l.id);
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
		extractedState[QueryParameters.LAYER] = layer;
		if (layer_visibility) {
			extractedState[QueryParameters.LAYER_VISIBILITY] = layer_visibility;
		}
		if (layer_opacity) {
			extractedState[QueryParameters.LAYER_OPACITY] = layer_opacity;
		}
		return extractedState;

	}
}