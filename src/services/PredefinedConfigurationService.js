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
	LAYER_EXCLUSIVE_VISIBLE: 'layer_exclusive_visible'
});

/**
 * BVV implementation of{@link PredefinedConfigurationService}
 * @class
 * @implements {module:services/PredefinedConfigurationService~PredefinedConfigurationService}
 */
export class BvvPredefinedConfigurationService {
	#storeService;
	constructor() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		this.#storeService = storeService;
	}
	apply(task, data) {
		switch (task) {
			case PredefinedConfiguration.DISPLAY_TIME_TRAVEL:
				this._displayTimeTravel();
				break;
			case PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE:
				this._setExclusiveVisible(data);
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

	_setExclusiveVisible(data) {
		const { id: selectedLayerId } = data;
		const { StoreService } = $injector.inject('StoreService');
		const layers = StoreService.getStore().getState().layers.active;

		if (!selectedLayerId || !layers.some((l) => l.id === selectedLayerId)) {
			return;
		}

		const isLayerExclusiveVisible = layers.filter((l) => l.zIndex !== 0).every((l) => (l.id === selectedLayerId && l.visible) || l.visible === false);

		const setAllLayerVisible = () =>
			layers.forEach((layer) => {
				const changedProperties = { ...layer, visible: true };
				modifyLayer(layer.id, changedProperties);
			});

		const setLayerExclusiveVisible = () =>
			layers
				.filter((l) => l.zIndex !== 0)
				.forEach((l) => {
					const changedProperties = { ...l, visible: l.id === selectedLayerId };
					modifyLayer(l.id, changedProperties);
				});

		if (isLayerExclusiveVisible) {
			setAllLayerVisible();
		} else {
			setLayerExclusiveVisible();
		}
	}
}
