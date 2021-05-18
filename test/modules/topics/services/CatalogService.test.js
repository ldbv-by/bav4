/* eslint-disable no-undef */
import { CatalogService } from '../../../../src/modules/topics/services/CatalogService';
import { loadBvvCatalog, loadExampleCatalog } from '../../../../src/modules/topics/services/provider/catalog.provider';

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

			const spyProvider = jasmine.createSpy().and.returnValue(await loadExampleCatalog());
			const instanceUnderTest = setup(spyProvider);

			//first call shoud be served from the provider
			const catalog0 = await instanceUnderTest.byId('foo');
			//a second call shoukd be served from cache 
			const catalog1 = await instanceUnderTest.byId('foo');

			expect(catalog0).toEqual(await loadExampleCatalog());
			expect(catalog1).toEqual(await loadExampleCatalog());
			expect(spyProvider).toHaveBeenCalledOnceWith('foo');
		});


		it('throws an exception when provider throws exception', (done) => {
			const instanceUnderTest = setup(async () => {
				throw new Error('Something got wrong');
			});


			instanceUnderTest.byId('foo').then(() => {
				done(new Error('Promise should not be resolved'));
			}, (reason) => {
				expect(reason.message).toContain('Could not load catalog from provider: Something got wrong');
				expect(reason).toBeInstanceOf(Error);
				done();
			});

		});
	});
});

