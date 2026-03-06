import { $injector } from '../../../src/injection';
import { HttpService } from '../../../src/services/HttpService';
import { MediaType } from '../../../src/domain/mediaTypes';
import { getMfpCapabilities, postMfpSpec } from '../../../src/services/provider/mfp.provider';
describe('mfp provider', () => {
	describe('getMfpCapabilities', () => {
		const configService = {
			getValueAsPath() {}
		};

		const httpService = {
			async get() {}
		};

		beforeEach(() => {
			$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
		});
		afterEach(() => {
			$injector.reset();
		});

		it('loads an array of MfpCapabilities', async () => {
			const backendUrl = 'https://backend.url';
			const mockResponse = {
				urlId: 0,
				layouts: [
					{
						id: 'a4_landscape',
						mapSize: { width: 785, height: 475 },
						dpis: [72, 120, 200],
						scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500]
					},
					{
						id: 'a3_portrait',
						mapSize: { width: 786, height: 1041 },
						dpis: [72, 120, 200],
						scales: [2000000, 1000000, 500000, 200000, 100000, 50000, 25000, 10000, 5000, 2500, 1250, 1000, 500]
					}
				]
			};
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(`${backendUrl}/print/info`)
				.and.resolveTo(new Response(JSON.stringify(mockResponse)));

			const mfpCapabilities = await getMfpCapabilities();

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(mfpCapabilities).toEqual(mockResponse);
		});

		it('throws error on failed request', async () => {
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(`${backendUrl}/print/info`)
				.and.resolveTo(new Response(JSON.stringify({}), { status: 500 }));

			await expectAsync(getMfpCapabilities()).toBeRejectedWithError('MfpCapabilties could not be loaded: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});

	describe('postMfpSpec', () => {
		const configService = {
			getValueAsPath() {}
		};

		const httpService = {
			async fetch() {}
		};

		beforeEach(() => {
			$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
		});
		afterEach(() => {
			$injector.reset();
		});

		it('posts the mfp spec and returns a BvvMfJob object', async () => {
			const abortController = new AbortController();
			const spec = { foo: 'bar' };
			const urlId = '0';
			const id = 'id';
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
				timeout: 40000
			};
			const httpServiceSpy = spyOn(httpService, 'fetch')
				.withArgs(`${backendUrl}/print/create/${urlId}`, options, abortController)
				.and.resolveTo(
					new Response(
						JSON.stringify({
							downloadURL: downloadUrl,
							id: id
						})
					)
				);

			const result = await postMfpSpec(spec, urlId, abortController);

			expect(result.downloadURL).toBe(downloadUrl);
			expect(result.id).toBe(id);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('throws error on failed request', async () => {
			const abortController = new AbortController();
			const spec = { foo: 'bar' };
			const urlId = '0';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.resolveTo(new Response(JSON.stringify({}), { status: 500 }));

			await expectAsync(postMfpSpec(spec, urlId, abortController)).toBeRejectedWithError('Mfp spec could not be posted: Http-Status 500');
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});

		it('returns NULL on AbortError', async () => {
			const abortController = new AbortController();
			const spec = { foo: 'bar' };
			const urlId = '0';
			const backendUrl = 'https://backend.url';
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(`${backendUrl}/`);
			const httpServiceSpy = spyOn(httpService, 'fetch').and.throwError(new DOMException('AbortError'));

			await expectAsync(postMfpSpec(spec, urlId, abortController)).toBeResolvedTo(null);
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
		});
	});
});
