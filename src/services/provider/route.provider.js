/**
 * @module services/provider/route_provider
 */
import { MediaType } from '../../domain/mediaTypes';
import { RouteCalculationErrors } from '../../domain/routing';
import { $injector } from '../../injection';

/**
 * BVV specific implementation of {@link module:services/RoutingService~routeProvider}
 * @function
 * @type {module:services/RoutingService~routeProvider}
 */
export const bvvRouteProvider = async (categories, coordinates3857) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		CoordinateService: coordinateService
	} = $injector.inject('HttpService', 'ConfigService', 'CoordinateService');

	const coordinates4326 = coordinates3857.map((coord3857) => coordinateService.toLonLat(coord3857));

	const payload = {
		vehicle: categories,
		points: coordinates4326
	};

	const result = await httpService.post(`${configService.getValueAsPath('BACKEND_URL')}routing/route`, JSON.stringify(payload), MediaType.JSON, {
		timeout: 2000
	});

	switch (result.status) {
		case 200:
			return await result.json();
		case 400:
			throw new Error(`A route could not be retrieved: Http-Status ${result.status}`, { cause: RouteCalculationErrors.Improper_Waypoints });
		case 500:
			throw new Error(`A route could not be retrieved: Http-Status ${result.status}`, { cause: RouteCalculationErrors.Technical_Error });
		default:
			throw new Error(`A route could not be retrieved: Http-Status ${result.status}`);
	}
};
