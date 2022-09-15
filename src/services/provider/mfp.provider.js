import { $injector } from '../../injection';

/**
 * Uses the BVV backend to load an array of MfpCapabilities.
 * @function
 * @returns {Array<MfpCapabilities>}
 */
export const loadBvvMfpCapabilities = async () => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const url = configService.getValueAsPath('BACKEND_URL') + 'print/info';
	const result = await httpService.get(`${url}`);

	const readCapabilities = capabilities => capabilities.map(c => ({ id: c.name, urlId: c.urlId, scales: [...c.scales], dpis: [...c.dpis], mapSize: { ...c.map } }));

	switch (result.status) {
		case 200:
			return readCapabilities(await result.json());
		default:
			throw new Error(`MfpCapabilties could not be loaded: Http-Status ${result.status}`);
	}
};
