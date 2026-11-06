/**
 * @module plugins/LegendsPlugin
 */

import { QueryParameters } from '@src/domain/queryParameters';
import { $injector } from '@src/injection';
import { addLegends, setReady } from '@src/store/legends/legends.action';
import { hashCode } from '@src/utils/hashCode';
import { observeOnce } from '@src/utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * This plugin does the following legend-related things:
 *
 * - initially set the legends from available query parameters or configuration
 *
 *
 * @class
 * @extends BaPlugin
 * @author badeniji
 */
export class LegendsPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register(store) {
		/**
		 * Calling _addLegendsFromQueryParams may take some time. No need to wait for it
		 */
		observeOnce(
			store,
			(state) => state.layers.ready,
			() => this._addLegendsFromQueryParams()
		);
		return true;
	}

	async _addLegendsFromQueryParams() {
		const { GeoResourceLegendService: geoResourceLegendService, EnvironmentService: environmentService } = $injector.inject(
			'GeoResourceLegendService',
			'EnvironmentService'
		);

		const queryParams = environmentService.getQueryParams();

		/**
		 * Calling geoResourceLegendService.available() may take some take as it waits until GeoResourceFuture are resolved
		 */
		const availableLegends = await geoResourceLegendService.available();

		const legendsQueryParam = queryParams.get(QueryParameters.LEGEND);
		const legends = legendsQueryParam ? legendsQueryParam.split(',') : [];

		if (availableLegends.length > 0 && legends.length > 0) {
			const availableHashedLegends = availableLegends.map((geoResourceId) => hashCode(geoResourceId).toString());
			const legendsToAdd = [];

			legends.forEach((hashedId) => {
				const resourceIndex = availableHashedLegends.indexOf(hashedId);
				if (resourceIndex > -1) {
					legendsToAdd.push(availableLegends[resourceIndex]);
				}
			});

			addLegends(legendsToAdd);
		}

		/**
		 * update legends s-o-s ready flag
		 */
		setReady();
	}
}
