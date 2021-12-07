/* eslint-disable no-undef */
import { CatalogService } from '../../../../src/modules/topics/services/CatalogService';
import { loadBvvCatalog, loadExampleCatalog, loadFallbackCatalog } from '../../../../src/modules/topics/services/provider/catalog.provider';
import { FALLBACK_TOPICS_IDS } from '../../../../src/services/TopicsService';

describe('CatalogService', () => {

	const setup = (provider) => {
		return new CatalogService(provider);
	};

	describe('init', () => {

		it('initializes the service', async () => {
			const provider = async () => { };
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
			const spyProvider = jasmine.createSpy().and.returnValue(await loadExampleCatalog());
			const instanceUnderTest = setup(spyProvider);

			//first call shoud be served from the provider
			const catalog0 = await instanceUnderTest.byId(topicId);
			//a second call shoukd be served from cache
			const catalog1 = await instanceUnderTest.byId(topicId);

			expect(catalog0).toEqual(await loadExampleCatalog());
			expect(catalog1).toEqual(await loadExampleCatalog());
			expect(spyProvider).toHaveBeenCalledOnceWith('foo');
		});


		describe('and provider throws exception', () => {

			it('throws an exception when provider throws exception', async () => {
				const instanceUnderTest = setup(async () => {
					throw new Error('Something got wrong');
				});

				try {
					await instanceUnderTest.byId('foo');
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toContain('Could not load catalog from provider: Something got wrong');
					expect(error).toBeInstanceOf(Error);
				}
			});

			it('returns a fallback catalog when we have a fallback topic', async () => {
				const [fallbackTopicId] = FALLBACK_TOPICS_IDS;
				const instanceUnderTest = setup(async () => {
					throw new Error('Something got wrong');
				});

				const catalog0 = await instanceUnderTest.byId(fallbackTopicId);

				expect(catalog0).toEqual(loadFallbackCatalog());
			});
		});
	});
});

