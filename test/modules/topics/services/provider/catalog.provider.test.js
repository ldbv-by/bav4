import { $injector } from '../../../../../src/injection';
import { loadBvvCatalog, loadExampleCatalog, loadFallbackCatalog } from '../../../../../src/modules/topics/services/provider/catalog.provider';

describe('Catalog provider', () => {

	describe('Bvv catalog provider', () => {

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

		it('loads GeoResources', async () => {

			const topicId = 'foo';
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'catalog/' + topicId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(Promise.resolve(
				new Response(
					JSON.stringify(await loadExampleCatalog())
				)
			));


			const catalog = await loadBvvCatalog(topicId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(catalog).toEqual(await loadExampleCatalog());

		});


		it('rejects when backend request cannot be fulfilled', (done) => {

			const topicId = 'foo';
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'catalog/' + topicId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get').withArgs(expectedArgs0).and.returnValue(
				Promise.resolve(new Response(null, { status: 404 })
				));

			loadBvvCatalog(topicId).then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(reason.message).toBe(`Catalog for '${topicId}' could not be loaded`);
				done();
			});
		});
	});

	describe('Example catalog provider', () => {

		it('loads an example catalog', async () => {
			const catalog = await loadExampleCatalog('foo');

			expect(catalog.length).toBe(2);
			expect(catalog[0].open).toBeTrue();
			expect(catalog[0].children.length).toBe(3);
			expect(catalog[0].children[2].children.length).toBe(1);
		});
	});

	describe('Util function for a fallback catalog', () => {

		it('loads a fallback catalog', async () => {
			const catalog = loadFallbackCatalog();

			expect(catalog.length).toBe(2);
			expect(catalog[0].open).toBeTrue();
			expect(catalog[0].children.length).toBe(3);
			expect(catalog[0].children[2].children.length).toBe(1);
		});
	});
});
