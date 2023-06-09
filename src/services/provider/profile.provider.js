/**
 * @module services/provider/profile_provider
 */
import { $injector } from '../../injection';
import { MediaType } from '../../domain/mediaTypes';

/**
 * A function that takes an array of coordinates (in 3857) and returns a promise resolving to  a {@link Profile}.
 *
 * @typedef {function(Array<coordinate>) : (Promise<Profile|null>)} profileProvider
 */

/**
 * Uses the BVV backend to fetch a Profile.
 * @function
 * @returns {Profile}
 */
export const getBvvProfile = async (coordinates3857) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/profile';
	const requestPayload = { coords: coordinates3857.map((c) => ({ e: c[0], n: c[1] })) };
	const result = await httpService.post(url, JSON.stringify(requestPayload), MediaType.JSON, {
		timeout: 2000
	});

	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`Profile could not be fetched: Http-Status ${result.status}`);
	}
};
