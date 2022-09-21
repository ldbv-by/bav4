import { $injector } from '../../injection';
import { HttpService, MediaType } from '../HttpService';

/**
 * Uses the BVV backend to load an array of MfpCapabilities.
 * @function
 * @returns {Array<MfpCapabilities>}
 */
export const loadMfpCapabilities = async () => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'print/info';
	const result = await httpService.get(`${url}`);

	const readCapabilities = capabilities => capabilities.map(c => ({ id: c.id, urlId: c.urlId, scales: [...c.scales], dpis: [...c.dpis], mapSize: { ...c.mapSize } }));

	switch (result.status) {
		case 200:
			return readCapabilities(await result.json());
		default:
			throw new Error(`MfpCapabilties could not be loaded: Http-Status ${result.status}`);
	}
};

export const postMpfSpec = async (spec, urlId, abortController) => {
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = `${configService.getValueAsPath('BACKEND_URL')}print/create/${urlId}`;
	const result = await httpService.fetch(`${url}`, {
		method: 'POST',
		mode: HttpService.DEFAULT_REQUEST_MODE,
		body: JSON.stringify(spec),
		headers: {
			'Content-Type': MediaType.JSON
		},
		timeout: 20000
	}, abortController);

	switch (result.status) {
		case 200: {
			return (await result.json()).downloadURL;
		}
		default:
			throw new Error(`Mfp spec could not be posted: Http-Status ${result.status}`);
	}
};
