/**
 * @module services/PredefinedConfigurationService
 */
import { addLayerIfNotPresent } from '../store/layers/layers.action';
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
	apply(task) {
		switch (task) {
			case PredefinedConfiguration.DISPLAY_TIME_TRAVEL:
				this._displayTimeTravel();
				break;
		}
	}

	_displayTimeTravel() {
		addLayerIfNotPresent('zeitreihe_tk');
		openSlider();
	}
}
