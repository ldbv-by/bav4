/**
 * @module services/provider/elevation_provider
 */
import { $injector } from '../../injection';

/**
 * Bvv specific implementation of {@link module:services/ElevationService~elevationProvider}
 * @function
 * @type {module:services/ElevationService~elevationProvider}
 */
export const loadBvvElevation = async (coordinateLike3857) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/elevation';

	const result = await httpService.get(`${url}/${coordinateLike3857[0]}/${coordinateLike3857[1]}`);

	switch (result.status) {
		case 200:
			return (await result.json()).z;
		default:
			throw new Error(`Elevation could not be retrieved: Http-Status ${result.status}`);
	}
};
