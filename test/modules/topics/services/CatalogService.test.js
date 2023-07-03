/* eslint-disable no-undef */
import { CatalogService } from '../../../../src/modules/topics/services/CatalogService';
import { loadBvvCatalog } from '../../../../src/modules/topics/services/provider/catalog.provider';
import {
	FALLBACK_GEORESOURCE_ID_0,
	FALLBACK_GEORESOURCE_ID_1,
	FALLBACK_GEORESOURCE_ID_2,
	FALLBACK_GEORESOURCE_ID_3
} from '../../../../src/services/GeoResourceService';
import { FALLBACK_TOPICS_IDS } from '../../../../src/services/TopicsService';

describe('CatalogService', () => {
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
	const setup = (provider) => {
		return new CatalogService(provider);
	};

	describe('init', () => {
		it('initializes the service', async () => {
			const provider = async () => {};
			const instanceUnderTest = setup(provider);

			expect(instanceUnderTest._provider).toEqual(provider);
			expect(instanceUnderTest._cache).toHaveSize(0);
		});

		it('initializes the service with a default provider', async () => {
			const instanceUnderTest = new CatalogService();

			expect(instanceUnderTest._provider).toEqual(loadBvvCatalog);
		});
	});

	describe('byId', () => {
		it('provides and caches a catalog definition by id', async () => {
			const topicId = 'foo';
			const spyProvider = jasmine.createSpy().and.returnValue(testCatalog);
			const instanceUnderTest = setup(spyProvider);

			//first call should be served from the provider
			const catalog0 = await instanceUnderTest.byId(topicId);
			//a second call should be served from cache
			const catalog1 = await instanceUnderTest.byId(topicId);

			expect(catalog0).toEqual(testCatalog);
			expect(catalog1).toEqual(testCatalog);
			expect(spyProvider).toHaveBeenCalledOnceWith('foo');
		});

		describe('and provider throws exception', () => {
			it('throws an exception when provider throws exception', async () => {
				const catalogProviderError = new Error('Something got wrong');
				const instanceUnderTest = setup(async () => {
					throw catalogProviderError;
				});

				await expectAsync(instanceUnderTest.byId('foo')).toBeRejectedWith(
					jasmine.objectContaining({
						message: 'Could not load catalog from provider',
						cause: catalogProviderError
					})
				);
			});

			it('returns a fallback catalog when we have a fallback topic', async () => {
				const [fallbackTopicId] = FALLBACK_TOPICS_IDS;
				const instanceUnderTest = setup(async () => {
					throw new Error('Something got wrong');
				});

				const catalog = await instanceUnderTest.byId(fallbackTopicId);

				expect(catalog).toEqual(instanceUnderTest._newFallbackCatalog());
				expect(catalog).toEqual([
					{
						label: 'Subtopic 1',
						children: [
							{
								geoResourceId: FALLBACK_GEORESOURCE_ID_0
							},
							{
								geoResourceId: FALLBACK_GEORESOURCE_ID_1
							},
							{
								label: 'Suptopic 2',
								children: [
									{
										geoResourceId: FALLBACK_GEORESOURCE_ID_2
									}
								]
							}
						]
					},
					{
						geoResourceId: FALLBACK_GEORESOURCE_ID_3
					}
				]);
			});
		});
	});
});
