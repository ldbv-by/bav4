import { $injector } from '../../src/injection';
import { OafGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { ImportOafService } from '../../src/services/ImportOafService';
import { getAttributionProviderForGeoResourceImportedByUrl } from '../../src/services/provider/attribution.provider';
import { bvvOafFilterCapabilitiesProvider, bvvOafGeoResourceProvider } from '../../src/services/provider/oaf.provider';

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
		const sourceType = new SourceType(SourceTypeName.OAF, null, 3857);
		const getCompleteOptions = () => {
			return {
				isAuthenticated: false,
				sourceType,
				collections: [],
				ids: []
			};
		};

		it('calls the provider with the whole set of options', async () => {
			const url = 'https://some.url/oaf?preserve=me';
			const subSetOfOptions = {
				sourceType
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
			const resultMock = [new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345), new OafGeoResource('id1', 'label1', 'url1', 'collectionId1', 12345)];
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
					sourceType,
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
		it('calls the oafFilterCapabilitiesProvider', async () => {
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const mockOafFilterCapabilities = { foo: 'bar' };
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().withArgs(oafGeoResource).and.resolveTo(mockOafFilterCapabilities);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			const result = await instanceUnderTest.getFilterCapabilities(oafGeoResource);

			expect(result).toEqual(mockOafFilterCapabilities);
			expect(oafFilterCapabilitiesProviderSpy).toHaveBeenCalled();
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const oafGeoResource = new OafGeoResource('id0', 'label0', 'url0', 'collectionId0', 12345);
			const oafFilterCapabilitiesProviderSpy = jasmine.createSpy().and.throwError(msg);
			const instanceUnderTest = new ImportOafService(null, oafFilterCapabilitiesProviderSpy);

			await expectAsync(instanceUnderTest.getFilterCapabilities(oafGeoResource)).toBeRejectedWithError(Error, msg);
		});
	});
});
