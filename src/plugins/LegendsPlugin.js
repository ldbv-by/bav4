/**
 * @module plugins/LegendsPlugin
 */

import { QueryParameters } from '@src/domain/queryParameters';
import { $injector } from '@src/injection';
import { addLegends, setReady } from '@src/store/legends/legends.action';
import { hashCode } from '@src/utils/hashCode';
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
	async register() {
		/**
		 * Calling _addLegendsFromQueryParams may take some time. No need to wait for it
		 */
		this._addLegendsFromQueryParams();
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
		/**
		 * update legends s-o-s ready flag
		 */
		setReady();

		const legendsQueryParam = queryParams.get(QueryParameters.LEGEND);
		const legends = legendsQueryParam ? legendsQueryParam.split(',') : [];
		if (availableLegends.length < 1 || legends.length < 1) {
			return;
		}

		const availableHashedLegends = availableLegends.map((geoResourceId) => hashCode(geoResourceId).toString());
		const legendsToAdd = [];

		legends.forEach((hashedId) => {
			const resourceIndex = availableHashedLegends.indexOf(hashedId);
			if (resourceIndex > -1) {
				legendsToAdd.push(availableLegends[resourceIndex]);
			}
		});
		console.log(legendsToAdd);

		addLegends(legendsToAdd);
	}
}
