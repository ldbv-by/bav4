/**
 * @module plugins/LegendsPlugin
 */
import { $injector } from '@src/injection';
import { QueryParameters } from '@src/domain/queryParameters';
import { addLegend } from '@src/store/legends/legends.action';
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
		return await this._init();
	}

	async _init() {
		const { GeoResourceLegendService: geoResourceLegendService, EnvironmentService: environmentService } = $injector.inject(
			'GeoResourceLegendService',
			'EnvironmentService'
		);

		const queryParams = environmentService.getQueryParams();
		const availableLegends = geoResourceLegendService.available();

		this._addLegendsFromQueryParams(queryParams, availableLegends);
	}

	_addLegendsFromQueryParams(queryParams, availableLegends) {
		const legendsQueryParam = queryParams.get(QueryParameters.LEGEND);
		const legends = legendsQueryParam ? legendsQueryParam.split(',') : [];
		if (availableLegends.length < 1 || legends.length < 1) {
			return;
		}

		availableLegends.filter((geoResourceId) => legends.includes(geoResourceId)).forEach((geoResourceId) => addLegend(geoResourceId));
	}
}
