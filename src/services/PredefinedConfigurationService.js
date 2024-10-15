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
 */

/**
 * Enum of all available predefined configurations.
 * @readonly
 * @enum {String}
 */
export const PredefinedConfiguration = Object.freeze({
	DISPLAY_TIME_TRAVEL: 'display_time_travel'
});

/**
 * BVV implementation of{@link PredefinedConfigurationService}
 * @class
 * @implements {PredefinedConfigurationService}
 */
export class BvvPredefinedConfigurationService {
	#storeService;
	constructor() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		this.#storeService = storeService;
	}
	apply(task) {
		switch (task) {
			case PredefinedConfiguration.DISPLAY_TIME_TRAVEL:
				this._displayTimeTravel();
				break;
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
}
