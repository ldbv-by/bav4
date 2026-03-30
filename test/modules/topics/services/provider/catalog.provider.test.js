import { $injector } from '@src/injection';
import { loadBvvCatalog } from '@src/modules/topics/services/provider/catalog.provider';

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
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(JSON.stringify(testCatalog)));

			const catalog = await loadBvvCatalog(topicId);

			expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
			expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
			expect(catalog).toEqual(testCatalog);
		});

		it('rejects when backend request cannot be fulfilled', async () => {
			const topicId = 'foo';
			const backendUrl = 'https://backend.url/';
			const expectedArgs0 = backendUrl + 'catalog/' + topicId;
			const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(backendUrl);
			const httpServiceSpy = vi.spyOn(httpService, 'get').mockResolvedValue(new Response(null, { status: 404 }));

			try {
				await loadBvvCatalog(topicId);
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(configServiceSpy).toHaveBeenCalledWith('BACKEND_URL');
				expect(httpServiceSpy).toHaveBeenCalledWith(expectedArgs0);
				expect(error.message).toBe(`Catalog for '${topicId}' could not be loaded`);
			}
		});
	});
});
