/**
 * @module services/PredefinedConfigurationService
 */
import { $injector } from '../injection/index';
import { addLayerIfNotPresent, modifyLayer } from '../store/layers/layers.action';
import { openSlider } from '../store/timeTravel/timeTravel.action';

/**
 * Service that can be called to put the application in a specific and customized configuration e.g. display certain GeoResources, open a specific component.
 *
 * Note: It's important not to misuse this service as a replacement for a {@link BaPlugin}.
 * @author taulinger
 * @interface PredefinedConfigurationService
 */

/**
 * Executes a specific task to achieve a certain configuration.
 * @function
 * @name PredefinedConfigurationService#apply
 * @param {PredefinedConfiguration} action
 * @param {Object} data
 */

/**
 * Enum of all available predefined configurations.
 * @readonly
 * @enum {String}
 */
export const PredefinedConfiguration = Object.freeze({
	DISPLAY_TIME_TRAVEL: 'display_time_travel',
	HIGHLIGHT_LAYER: 'highlight_layer'
});

/**
 * BVV implementation of{@link PredefinedConfigurationService}
 * @class
 * @implements {module:services/PredefinedConfigurationService~PredefinedConfigurationService}
 */
export class BvvPredefinedConfigurationService {
	#environmentService;
	#storeService;
	#lastHighlight;
	#lastEventListener;
	constructor() {
		const { StoreService: storeService, EnvironmentService: environmentService } = $injector.inject('StoreService', 'EnvironmentService');
		this.#storeService = storeService;
		this.#environmentService = environmentService;
		this.#lastHighlight = [];
		this.#lastEventListener = null;
	}
	apply(task, data) {
		switch (task) {
			case PredefinedConfiguration.DISPLAY_TIME_TRAVEL:
				this._displayTimeTravel();
				break;
			case PredefinedConfiguration.HIGHLIGHT_LAYER:
				this._highlightLayer(data);
		}
	}

	_displayTimeTravel() {
		const timeTravelGeoResourceId = 'zeitreihe_tk';
		addLayerIfNotPresent(timeTravelGeoResourceId);
		this.#storeService
			.getStore()
			.getState()
			.layers.active.forEach((l) => {
				if (l.geoResourceId === timeTravelGeoResourceId) {
					modifyLayer(l.id, { visible: true });
				}
			});
		openSlider();
	}

	_highlightLayer(data) {
		//TO DISCUSS: choosing the better approach for reducing the opacity
		//eslint-disable-next-line no-unused-vars
		const opacity_decrement_divisor = 5;
		const opacity_reduced = 0.2;
		const opacity_max = 1;
		const { id: highlightLayerId } = data;
		const { StoreService } = $injector.inject('StoreService');
		const layers = StoreService.getStore().getState().layers.active;

		if (!highlightLayerId || !layers.some((l) => l.id === highlightLayerId)) {
			return;
		}

		const deactivateHighlight = this.#lastHighlight.some((l) => l.id === highlightLayerId && l.active);
		const currentHighlight = [];

		const getLayerFromLast = (id) => {
			const last = this.#lastHighlight.filter((l) => l.id === id);
			return last.length === 1 ? last[0] : null;
		};

		const beforeunloadEventListener = (e) => {
			// see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
			e.returnValue = 'string';
			e.preventDefault();
			// HINT: any changes on the layer states are not reflected in the encoded state
			// resetLayerStateToBefore();
		};

		const resetLayerStateToBefore = () =>
			layers.forEach((layer) => {
				const changedProperties = { ...layer, opacity: getLayerFromLast(layer.id)?.before.opacity ?? layer.opacity };
				modifyLayer(layer.id, changedProperties);
			});
		if (deactivateHighlight) {
			resetLayerStateToBefore();
			this.#environmentService.getWindow().removeEventListener('beforeunload', beforeunloadEventListener);
		} else {
			if (this.#lastEventListener) {
				this.#environmentService.getWindow().removeEventListener('beforeunload', this.#lastEventListener);
			}
			this.#lastEventListener = beforeunloadEventListener;

			this.#environmentService.getWindow().addEventListener('beforeunload', beforeunloadEventListener);
			// activate the highlight
			layers.forEach((layer) => {
				const opacityBefore = getLayerFromLast(layer.id)?.before.opacity ?? layer.opacity;
				const highlight = { id: layer.id, before: { opacity: opacityBefore }, active: layer.id === highlightLayerId };

				//const changedOpacity = layer.id !== highlightLayerId ? opacityBefore / opacity_decrement_divisor : opacity_max;
				const changedOpacity = layer.id !== highlightLayerId ? (opacityBefore > opacity_reduced ? opacity_reduced : opacityBefore) : opacity_max;
				const changedProperties = layer.zIndex !== 0 ? { ...layer, opacity: changedOpacity } : layer;
				currentHighlight.push(highlight);
				modifyLayer(layer.id, changedProperties);
			});
		}
		this.#lastHighlight = currentHighlight;
	}
}
