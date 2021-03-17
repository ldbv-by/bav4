import { $injector } from '../../injection';

/**
 * 
 * @param {Coordinate} coordinate3857
 * @returns {Object} with community and district as string properties, loaded from backend
 */
export const loadBvvAdministration = async (coordinate3857) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'administration/info';


	const result = await httpService.fetch(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`, { });

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