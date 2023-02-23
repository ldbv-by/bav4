/**
 * @module service/provider
 */
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

	if (result.ok) {
		const payload = await result.json();
		const community = payload.gemeinde;
		const district = payload.gemarkung;
		// later we have to add this for BAplus users
		// const parcelDenomination = payload.flstBezeichnung;
		if (community && district) {
			const bvvAdministration = {
				community: community,
				district: district
			};
			return Object.freeze(bvvAdministration);
		}
	}
	throw new Error('Administration could not be retrieved');
};
