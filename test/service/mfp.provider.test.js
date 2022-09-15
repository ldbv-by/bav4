import { $injector } from '../../src/injection';
import { loadBvvMfpCapabilities } from '../../src/services/provider/mfp.provider';

describe('bvvMfpCapabilitiesProvider', () => {
	const configService = {
		getValueAsPath() { }
	};

	const httpService = {
		async get() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});


	it('loads an array of MfpCapabilities', async () => {
		const backendUrl = 'https://backend.url';
		const mockResponse = [{ 'id': 'A4 landscape', 'urlId': 0, 'mapSize': { 'width': 785, 'height': 475 }, 'dpis': [72, 120, 200], 'scales': [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }, { 'id': 'A3 portrait', 'urlId': 0, 'mapSize': { 'width': 786, 'height': 1041 }, 'dpis': [72, 120, 200], 'scales': [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }];
		const expectedResult = [{ id: 'A4 landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }, { id: 'A3 portrait', urlId: 0, mapSize: { width: 786, height: 1041 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }];
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
		const httpServiceSpy = spyOn(httpService, 'get').withArgs(`${backendUrl}/print/info`).and.resolveTo(new Response(
			JSON.stringify(mockResponse))
		);

		const mfpCapabilities = await loadBvvMfpCapabilities();

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(mfpCapabilities).toEqual(expectedResult);
	});

	it('throws error on failed request', async () => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
		const httpServiceSpy = spyOn(httpService, 'get').withArgs(`${backendUrl}/print/info`).and.resolveTo(
			new Response(JSON.stringify({}), { status: 500 })
		);

		await expectAsync(loadBvvMfpCapabilities()).toBeRejectedWithError('MfpCapabilties could not be loaded: Http-Status 500');
		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
	});
});
