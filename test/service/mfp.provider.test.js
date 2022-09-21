import { $injector } from '../../src/injection';
import { HttpService, MediaType } from '../../src/services/HttpService';
import { loadMfpCapabilities, postMpfSpec } from '../../src/services/provider/mfp.provider';
describe('mfp provider', () => {

	describe('loadMfpCapabilities', () => {
		const configService = {
			getValueAsPath() { }
		};

		const httpService = {
			async get() { }
		};

		beforeEach(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});
		afterEach(() => {
			$injector.reset();
		});


		it('loads an array of MfpCapabilities', async () => {
			const backendUrl = 'https://backend.url';
			const mockResponse = [{ 'id': 'a4_landscape', 'urlId': 0, 'mapSize': { 'width': 785, 'height': 475 }, 'dpis': [72, 120, 200], 'scales': [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }, { 'id': 'a3_portrait', 'urlId': 0, 'mapSize': { 'width': 786, 'height': 1041 }, 'dpis': [72, 120, 200], 'scales': [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }];
			const expectedResult = [{ id: 'a4_landscape', urlId: 0, mapSize: { width: 785, height: 475 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }, { id: 'a3_portrait', urlId: 0, mapSize: { width: 786, height: 1041 }, dpis: [72, 120, 200], scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500] }];
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(`${backendUrl}/print/info`).and.resolveTo(new Response(
				JSON.stringify(mockResponse))
			);

			const mfpCapabilities = await loadMfpCapabilities();

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

			await expectAsync(loadMfpCapabilities()).toBeRejectedWithError('MfpCapabilties could not be loaded: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('postMpfSpec', () => {
		const configService = {
			getValueAsPath() { }
		};

		const httpService = {
			async fetch() { }
		};

		beforeEach(() => {
			$injector
				.registerSingleton('ConfigService', configService)
				.registerSingleton('HttpService', httpService);
		});
		afterEach(() => {
			$injector.reset();
		});


		it('posts the mfp spec and returns a download URL', async () => {
			const abortController = new AbortController();
			const spec = { foo: 'bar' };
			const urlId = '0';
			const downloadUrl = 'http://foo.bar';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const options = {
				method: 'POST',
				mode: HttpService.DEFAULT_REQUEST_MODE,
				body: JSON.stringify(spec),
				headers: {
					'Content-Type': MediaType.JSON
				},
				timeout: 20000
			};
			const httpServiceSpy = spyOn(httpService, 'fetch').withArgs(`${backendUrl}/print/create/${urlId}`, options, abortController).and.resolveTo(new Response(
				JSON.stringify({
					downloadURL: downloadUrl
				}))
			);

			const result = await postMpfSpec(spec, urlId, abortController);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(result).toBe(downloadUrl);
		});

		it('throws error on failed request', async () => {

			const abortController = new AbortController();
			const spec = { foo: 'bar' };
			const urlId = '0';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.resolveTo(new Response(JSON.stringify({}), { status: 500 }));

			await expectAsync(postMpfSpec(spec, urlId, abortController)).toBeRejectedWithError('Mfp spec could not be posted: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
