import { $injector } from '../../injection';

/**
 * A function that takes a coordinate and returns a promise with an administration object.
 *
 * @typedef {function(coordinate) : (Promise<administration>)} administrationProvider
 */

/**
 * Uses the BVV service to load an administration object.
 * @function
 * @param {coordinate} coordinate3857
 * @returns {Promise<administration>} with community and district as string properties, loaded from backend
 */
export const loadBvvAdministration = async (coordinate3857) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'administration/info';

	const result = await httpService.get(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`);

	switch (result.status) {
		case 200: {
			const { gemeinde: community, gemarkung: district } = await result.json();
			return {
				community,
				district
			};
		}
		default:
			throw new Error(`Administration could not be retrieved: Http-Status ${result.status}`);
	}
};
