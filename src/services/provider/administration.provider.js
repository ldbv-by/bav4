import { $injector } from '../../injection';

/**
 * 
 * @param {Coordinate} coordinate3857
 * @returns {Array} array with community and district loaded from backend
 */
export const loadBvvAdministration = async (coordinate3857) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'verwaltungsservice/info';


	const result = await httpService.fetch(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`, {
		mode: 'cors'
	});

	if (result.ok) {
		const payload = await result.json();
		const community = payload.gemeinde;
        const district = payload.gemarkung;
        // keep for BAplus
        // const parcelDenomination = payload.flstBezeichnung;
		if (typeof community === String  && typeof district === String) { //ToDo how to test payload
            const bvvAdministration = []; 
            bvvAdministration.push(community);
            bvvAdministration.push(district);            
			return bvvAdministration;
		} 
	}
	throw new Error('Administration could not be retrieved');
}; 