import { $injector } from '../../../../../src/injection';
import { loadBvvCatalog } from '../../../../../src/modules/topics/services/provider/catalog.provider';

describe('catalog provider', () => {
	describe('Bvv catalog provider', () => {
		const testCatalog = [
			{
				label: 'Subtopic 1',
				children: [
					{
						geoResourceId: 'gr0'
					},
					{
						geoResourceId: 'gr1'
					},
					{
						label: 'Suptopic 2',
						children: [
							{
								geoResourceId: 'gr3'
							}
						]
					}
				]
			},
			{
				geoResourceId: 'gr3'
			}
		];
		const configService = {
			getValueAsPath: () => {}
		};

		const httpService = {
			get: async () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService).registerSingleton('HttpService', httpService);
		});

		it('loads GeoResources', async () => {
			const topicId = 'foo';
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'catalog/' + topicId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(JSON.stringify(testCatalog))));

			const catalog = await loadBvvCatalog(topicId);

			expect(configServiceSpy).toHaveBeenCalled();
			expect(httpServiceSpy).toHaveBeenCalled();
			expect(catalog).toEqual(testCatalog);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const topicId = 'foo';
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'catalog/' + topicId;
			const configServiceSpy = spyOn(configService, 'getValueAsPath').withArgs('BACKEND_URL').and.returnValue(backendUrl);
			const httpServiceSpy = spyOn(httpService, 'get')
				.withArgs(expectedArgs0)
				.and.returnValue(Promise.resolve(new Response(null, { status: 404 })));

			try {
				await loadBvvCatalog(topicId);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(configServiceSpy).toHaveBeenCalled();
				expect(httpServiceSpy).toHaveBeenCalled();
				expect(error.message).toBe(`Catalog for '${topicId}' could not be loaded`);
			}
		});
	});
});
