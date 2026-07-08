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
	async register(store) {
		await this._init(store);
	}

	async _init(store) {
		const { GeoResourceService: geoResourceService, EnvironmentService: environmentService } = $injector.inject(
			'GeoResourceService',
			'EnvironmentService'
		);

		const queryParams = environmentService.getQueryParams();
		this._addLegendsFromQueryParams(queryParams);
	}

	_addLegendsFromQueryParams(queryParams) {
		const layerQueryParam = queryParams.get(QueryParameters.LAYER);
		const legendsQueryParam = queryParams.get(QueryParameters.LEGEND);

		const layers = layerQueryParam ? layerQueryParam.split(',') : [];
		const legends = legendsQueryParam ? legendsQueryParam.split(',') : [];

		if (layers.length < 1 || legends.length < 1) {
			return;
		}

		// TODO Check if layer has legend (how do we get the layers?)
		layers.filter((geoResourceId) => legends.includes(geoResourceId)).forEach((geoResourceId) => addLegend(geoResourceId));
	}
}
