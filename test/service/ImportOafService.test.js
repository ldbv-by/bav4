import { $injector } from '../../src/injection';
import { OafGeoResource, WmsGeoResource } from '../../src/domain/geoResources';
import { DEFAULT_OAF_CAPABILITIES_CACHE_DURATION_SECONDS, ImportOafService } from '../../src/services/ImportOafService';
import { getAttributionProviderForGeoResourceImportedByUrl } from '../../src/services/provider/attribution.provider';
import { bvvOafFilterCapabilitiesProvider, bvvOafGeoResourceProvider } from '../../src/services/provider/oaf.provider';
import { TestUtils } from '../test-utils';

describe('ImportOafService', () => {
	const geoResourceService = {
		addOrReplace() {}
	};

	beforeAll(() => {
		$injector.registerSingleton('GeoResourceService', geoResourceService);
	});

	const handledByGeoResourceServiceMarker = 'marker';
	const addOrReplaceMethodMock = (gr) => {
		gr.marker = handledByGeoResourceServiceMarker;
		return gr;
	};

	it('exports constant values', () => {
		expect(DEFAULT_OAF_CAPABILITIES_CACHE_DURATION_SECONDS).toBe(600);
	});

	describe('init', () => {
		it('initializes the service with custom provider', () => {
			const customOafGeoResourceProvider = async () => {};
			const customOafFilterCapabilitiesProvider = async () => {};
			const instanceUnderTest = new ImportOafService(customOafGeoResourceProvider, customOafFilterCapabilitiesProvider);
			expect(instanceUnderTest._oafGeoResourceProvider).toEqual(customOafGeoResourceProvider);
			expect(instanceUnderTest._oafFilterCapabilitiesProvider).toEqual(customOafFilterCapabilitiesProvider);
		});

		it('initializes the service with default provider', () => {
			const instanceUnderTest = new ImportOafService();
			expect(instanceUnderTest._oafGeoResourceProvider).toEqual(bvvOafGeoResourceProvider);
			expect(instanceUnderTest._oafFilterCapabilitiesProvider).toEqual(bvvOafFilterCapabilitiesProvider);
		});
	});

	describe('forUrl', () => {
		const getCompleteOptions = () => {
			return {
				isAuthenticated: false,
				collections: [],
				ids: []
			};
		};

		it('calls the provider with the whole set of options', async () => {
			const url = 'https://some.url/oaf?preserve=me';
			const subSetOfOptions = {
				isAuthenticated: false
			};
			const resultMock = [];
			const oafGeoResourceProviderSpy = jasmine.createSpy().withArgs(url, getCompleteOptions()).and.resolveTo(resultMock);
			const instanceUnderTest = new ImportOafService(oafGeoResourceProviderSpy);

			const result = await instanceUnderTest.forUrl(url, subSetOfOptions);

			expect(result).toEqual(resultMock);
			expect(oafGeoResourceProviderSpy).toHaveBeenCalled();
		});

		it('registers the OafGeoResources', async () => {
			const url = 'https://some.url/oaf?preserve=me';
			const options = getCompleteOptions();
			const resultMock = [
				new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345),
				new OafGeoResource('id1', 'label1', 'url1', 'collectionId1', 12345)
			];
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake(addOrReplaceMethodMock);
			const instanceUnderTest = new ImportOafService(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toHaveSize(2);
			result.forEach((gr) => {
				expect(gr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(gr)]);
				expect(gr.marker).toBe(handledByGeoResourceServiceMarker);
			});
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(2);
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const url = 'https://some.url/oaf?preserve=me';
			const oafGeoResourceProviderSpy = jasmine.createSpy().and.throwError(msg);
			const instanceUnderTest = new ImportOafService(oafGeoResourceProviderSpy);

			await expectAsync(instanceUnderTest.forUrl(url)).toBeRejectedWithError(Error, msg);
		});

		it('uses default options', async () => {
			const url = 'https://some.url/oaf?preserve=me';

			const resultMock = [];
			const oafGeoResourceProviderSpy = jasmine
				.createSpy('provider')
				.withArgs(url, {
					// the default options
					isAuthenticated: false,
					collections: [],
					ids: []
				})
				.and.resolveTo(resultMock);
			const instanceUnderTest = new ImportOafService(oafGeoResourceProviderSpy);

			const result = await instanceUnderTest.forUrl(url);

			expect(result).toEqual([]);
			expect(oafGeoResourceProviderSpy).toHaveBeenCalled();
		});
	});

	describe('getFilterCapabilities', () => {
		beforeEach(() => {
			jasmine.clock().install();
		});

		afterEach(() => {
			jasmine.clock().uninstall();
		});

		it('calls the oafFilterCapabilitiesProvider for a OafGeoResource and serves the second call from the cache', async () => {
			const oafGeoResource0 = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafGeoResource1 = new OafGeoResource('id1', 'label1', 'url1', 'collectionId1', 12345);
			const mockOafFilterCapabilities = { foo: 'bar' };
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.callFake((geoResource) => {
				switch (geoResource.id) {
					case 'id0':
						return Promise.resolve(mockOafFilterCapabilities);
					default:
						return Promise.resolve(null);
				}
			});
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			const result0 = await instanceUnderTest.getFilterCapabilities(oafGeoResource0);
			const result1 = await instanceUnderTest.getFilterCapabilities(oafGeoResource0);
			const result2 = await instanceUnderTest.getFilterCapabilities(oafGeoResource1);

			expect(result0).toEqual(mockOafFilterCapabilities);
			expect(result1).toEqual(mockOafFilterCapabilities);
			expect(result2).toBeNull();
			expect(oafFilterCapabilitiesProviderSpy).toHaveBeenCalledTimes(2);
		});

		it('returns `null` for other GeoResources', async () => {
			const oafGeoResource0 = new WmsGeoResource('id0', 'label0', 'url0', 'layer0', 'format0');
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy();
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			await expectAsync(instanceUnderTest.getFilterCapabilities(oafGeoResource0)).toBeResolvedTo(null);
			expect(oafFilterCapabilitiesProviderSpy).not.toHaveBeenCalled();
		});

		it('does only add valid results to the cache', async () => {
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().withArgs(oafGeoResource).and.resolveTo(null);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			const result0 = await instanceUnderTest.getFilterCapabilities(oafGeoResource);
			const result1 = await instanceUnderTest.getFilterCapabilities(oafGeoResource);

			expect(result0).toBeNull();
			expect(result1).toBeNull();
			expect(oafFilterCapabilitiesProviderSpy).toHaveBeenCalledTimes(2);
		});

		it('clears the cache entry when it has expired', async () => {
			jasmine.clock().mockDate();
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const mockOafFilterCapabilities = { foo: 'bar' };
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().withArgs(oafGeoResource).and.resolveTo(mockOafFilterCapabilities);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			const result0 = await instanceUnderTest.getFilterCapabilities(oafGeoResource);

			jasmine.clock().tick(DEFAULT_OAF_CAPABILITIES_CACHE_DURATION_SECONDS * 1000 + 100);

			const result1 = await instanceUnderTest.getFilterCapabilities(oafGeoResource);

			expect(result0).toEqual(mockOafFilterCapabilities);
			expect(result1).toEqual(mockOafFilterCapabilities);
			expect(oafFilterCapabilitiesProviderSpy).toHaveBeenCalledTimes(2);
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.rejectWith(new Error(msg));
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			await expectAsync(instanceUnderTest.getFilterCapabilities(oafGeoResource)).toBeRejectedWithError(Error, msg);
		});
	});

	describe('getFilterCapabilitiesFromCache', () => {
		it('returns `null`, calls the oafFilterCapabilitiesProvider afterward and serves the second call from the cache', async () => {
			const oafGeoResource0 = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const mockOafFilterCapabilities = { foo: 'bar' };
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.resolveTo(mockOafFilterCapabilities);

			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			expect(instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource0)).toBeNull();

			await TestUtils.timeout();

			expect(instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource0)).toEqual(mockOafFilterCapabilities);
		});

		it('returns `null` and does NOT call the oafFilterCapabilitiesProvider afterward', async () => {
			const oafGeoResource0 = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const mockOafFilterCapabilities = { foo: 'bar' };
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.resolveTo(mockOafFilterCapabilities);

			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			expect(instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource0, false)).toBeNull();

			await TestUtils.timeout();

			expect(oafFilterCapabilitiesProviderSpy).not.toHaveBeenCalled();
		});

		it('returns `null` for other GeoResources', async () => {
			const oafGeoResource0 = new WmsGeoResource('id0', 'label0', 'url0', 'layer0', 'format0');
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy();
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			expect(instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource0)).toBeNull(null);

			await TestUtils.timeout();

			expect(oafFilterCapabilitiesProviderSpy).not.toHaveBeenCalled();
		});

		it('does only add valid results to the cache', async () => {
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().withArgs(oafGeoResource).and.resolveTo(null);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			const result0 = instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource);
			const result1 = instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource);

			expect(result0).toBeNull();

			await TestUtils.timeout();

			expect(result1).toBeNull();
			expect(oafFilterCapabilitiesProviderSpy).toHaveBeenCalledTimes(2);
		});

		it('logs the error of the underlying provider', async () => {
			const warnSpy = spyOn(console, 'warn');
			const msg = 'Something got wrong';
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.rejectWith(msg);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			instanceUnderTest.getFilterCapabilitiesFromCache(oafGeoResource);

			await TestUtils.timeout();

			expect(warnSpy).toHaveBeenCalledWith(msg);
		});
	});
});
