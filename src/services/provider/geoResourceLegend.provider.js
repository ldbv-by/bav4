/**
 * @module services/provider/geoResourceLegend_provider
 */
import { $injector } from '@src/injection';

/**
 * BVV specific implementation of {@link module:services/GeoResourceLegendService~geoResourceLegendProvider}.
 * @function
 * @type {module:services/GeoResourceLegendService~geoResourceLegendProvider}
 */
export const bvvGeoResourceLegendProvider = async (geoResourceId) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const throwError = (reason) => {
		throw new Error(`GeoResourceInfoResult for '${geoResourceId}' could not be loaded: ${reason}`);
	};

	const loadInternal = async (geoResourceId) => {
		const url = `${configService.getValueAsPath('BACKEND_URL')}georesource/legend/${geoResourceId}`;
		return httpService.get(url);
	};

	const result = await loadInternal(geoResourceId);

	switch (result.status) {
		case 200: {
			const content = await result.text();
			return content;
		}
		case 403:
		case 404:
		case 204:
			return null;
		default:
			throwError(`Http-Status ${result.status}`);
	}
};
