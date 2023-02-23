/**
 * A function that returns a promise resolving to an array of `ChipConfiguration`.
 *
 * @typedef {function() : (Promise<Array<ChipConfiguration>>)} chipsConfigurationProvider
 */

import { $injector } from '../../injection';

/**
 * Uses the BVV endpoint to load an array of `ChipConfiguration`.
 * @function
 * @async
 * @returns {Array<ChipConfiguration>}
 */
export const loadBvvChipConfiguration = async () => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'chips';
	const result = await httpService.get(url);

	switch (result.status) {
		case 200:
			return await result.json();
		default:
			throw new Error(`Chips configuration could not be fetched: Http-Status ${result.status}`);
	}
};
