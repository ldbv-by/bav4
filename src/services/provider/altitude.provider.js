import { $injector } from '../../injection';

export const loadBvvAltitude = async (easting, northing) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'dem/altitude';


	const result = await httpService.fetch(`${url}/${easting}/${northing} `, {
		mode: 'cors'
	});

	if (result.ok) {
		return await result.json();
	}
	throw new Error('Altitude could not be retrieved');
};