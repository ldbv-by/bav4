import { $injector } from '../../../src/injection';
import { loadBvvLayerInfo } from '../../../src/services/provider/layerInfo.provider';

describe('LayerInfo provider', () => {

	const configService = {
		getValueAsPath: () => { }
	};

	const httpService = {
		get: async () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('ConfigService', configService)
			.registerSingleton('HttpService', httpService);
	});

	it('shout load layerinfo', async () => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response('<b>hello</b>')
		));

		const result = await loadBvvLayerInfo('914c9263-5312-453e-b3eb-5104db1bf788');

		expect(configServiceSpy).toHaveBeenCalled();
		expect(httpServiceSpy).toHaveBeenCalled();
		expect(result.content).toBe('<b>hello</b>');
	});

	it('rejects when backend request cannot be fulfilled', (done) => {

		const backendUrl = 'https://backend.url';
		const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
		const httpServiceSpy = spyOn(httpService, 'get').and.returnValue(Promise.resolve(
			new Response(null, { status: 404 })
		));

		loadBvvLayerInfo('914c9263-5312-453e-b3eb-5104db1bf788').then(() => {
			done(new Error('Promise should not be resolved'));
		}, (reason) => {
			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(reason.message).toBe('LayerInfo for \'914c9263-5312-453e-b3eb-5104db1bf788\' could not be loaded');
			done();
		});
	});
});
