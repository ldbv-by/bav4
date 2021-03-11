import { $injector } from '../../injection';

/**
 * 
 * @param {Coordinate} coordinate3857
 * @returns {Number} altitude loaded from backend
 */
export const loadBvvAltitude = async (coordinate3857) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/altitude';


	const result = await httpService.fetch(`${url}/${coordinate3857[0]}/${coordinate3857[1]}`, {
		mode: 'cors'
	});

	if (result.ok) {
		const payload = await result.json();
		const altitude = payload.altitude;
		if (Number.isFinite(altitude)) {
			return altitude;
		} 
	}
	throw new Error('Altitude could not be retrieved');
};