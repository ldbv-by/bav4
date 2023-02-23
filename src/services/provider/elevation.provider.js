/**
 * @module service/provider
 */
import { $injector } from '../../injection';

/**
 * A function that takes a coordinate and returns a promise with a number.
 *
 * @typedef {function(coordinate) : (Promise<number>)} elevationProvider
 */

/**
 * Uses the BVV service to load an elevation.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {number} elevation loaded from backend
 */
export const loadBvvElevation = async (coordinate3857) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/elevation';

	const result = await httpService.get(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`);

	if (result.ok) {
		const payload = await result.json();
		const elevation = payload.z;
		if (Number.isFinite(elevation)) {
			return elevation;
		}
	}
	throw new Error('Elevation could not be retrieved');
};
