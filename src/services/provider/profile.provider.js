/**
 * @module services/provider/profile_provider
 */
import { $injector } from '../../injection';
import { MediaType } from '../../domain/mediaTypes';
import { CoordinateSimplificationTarget } from '../OlCoordinateService';
import { GlobalCoordinateRepresentations } from '../../domain/coordinateRepresentation';

/**
 * BVV specific implementation of {@link module:services/ElevationService~profileProvider}
 * @function
 * @type {module:services/ElevationService~profileProvider}
 */
export const getBvvProfile = async (coordinateLikes3857) => {
	const {
		HttpService: httpService,
		ConfigService: configService,
		CoordinateService: coordinateService
	} = $injector.inject('HttpService', 'ConfigService', 'CoordinateService');

	const coordinates3857 = coordinateService.toCoordinate(coordinateLikes3857);

	const projectedDistance = coordinateService.getLength(coordinates3857, GlobalCoordinateRepresentations.SphericalMercator);

	// todo: usage of mapservice.coordinateRepresentations() + coordinateService.getLength()
	const simplifiedCoordinates = coordinateService.simplify(coordinates3857, CoordinateSimplificationTarget.ELEVATION_PROFILE);
	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/profile';
	const requestPayload = { coords: simplifiedCoordinates.map((c) => ({ e: c[0], n: c[1] })) };
	const result = await httpService.post(url, JSON.stringify(requestPayload), MediaType.JSON, {
		timeout: 2000
	});
	const replaceDistance = (profile, distance) => {
		const { stats, ...rest } = profile;
		return { ...rest, stats: { ...stats, linearDistance: distance } };
	};
	switch (result.status) {
		case 200:
			return replaceDistance(await result.json(), projectedDistance);
		default:
			throw new Error(`Profile could not be fetched: Http-Status ${result.status}`);
	}
};
