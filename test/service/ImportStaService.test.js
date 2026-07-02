import { $injector } from '@src/injection';
import { StaGeoResource } from '@src/domain/geoResources';
import { ImportStaService } from '@src/services/ImportStaService';
import { getAttributionProviderForGeoResourceImportedByUrl } from '@src/services/provider/attribution.provider';
import { bvvStaGeoResourceProvider } from '@src/services/provider/sta.provider';

describe('ImportStaService', () => {
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
			const customStaGeoResourceProvider = async () => {};
			const instanceUnderTest = new ImportStaService(customStaGeoResourceProvider);
			expect(instanceUnderTest._staGeoResourceProvider).toEqual(customStaGeoResourceProvider);
		});

		it('initializes the service with default provider', () => {
			const instanceUnderTest = new ImportStaService();
			expect(instanceUnderTest._staGeoResourceProvider).toEqual(bvvStaGeoResourceProvider);
		});
	});

	describe('forUrl', () => {
		const getCompleteOptions = () => {
			return {
				isAuthenticated: false,
				observedProperties: [],
				ids: []
			};
		};

		it('calls the provider with the whole set of options', async () => {
			const url = 'https://some.url/sta?preserve=me';
			const subSetOfOptions = {
				isAuthenticated: false
			};
			const resultMock = [];
			const staGeoResourceProviderSpy = vi.fn().mockResolvedValue(resultMock);
			const instanceUnderTest = new ImportStaService(staGeoResourceProviderSpy);

			const result = await instanceUnderTest.forUrl(url, subSetOfOptions);

			expect(result).toEqual(resultMock);
			expect(staGeoResourceProviderSpy).toHaveBeenCalledWith(url, getCompleteOptions());
		});

		it('registers the StaGeoResources', async () => {
			const url = 'https://some.url/sta?preserve=me';
			const options = getCompleteOptions();
			const resultMock = [
				new StaGeoResource('id0', 'label0', 'url0', 'observedProperty0'),
				new StaGeoResource('id1', 'label1', 'url1', 'observedProperty0')
			];
			const geoResourceServiceSpy = vi.spyOn(geoResourceService, 'addOrReplace').mockImplementation(addOrReplaceMethodMock);
			const instanceUnderTest = new ImportStaService(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toHaveLength(2);
			result.forEach((gr) => {
				expect(gr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(gr)]);
				expect(gr.marker).toBe(handledByGeoResourceServiceMarker);
			});
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(2);
		});

		it('passes the error of the underlying provider', async () => {
			const msg = 'Something got wrong';
			const url = 'https://some.url/sta?preserve=me';

			const staGeoResourceProviderSpy = vi.fn().mockRejectedValue(msg);
			const instanceUnderTest = new ImportStaService(staGeoResourceProviderSpy);

			await expect(instanceUnderTest.forUrl(url)).rejects.toThrow(msg);
		});

		it('uses default options', async () => {
			const url = 'https://some.url/sta?preserve=me';

			const resultMock = [];
			const staGeoResourceProviderSpy = vi.fn('provider').mockResolvedValue(resultMock);
			const instanceUnderTest = new ImportStaService(staGeoResourceProviderSpy);

			const result = await instanceUnderTest.forUrl(url);

			expect(result).toEqual([]);
			expect(staGeoResourceProviderSpy).toHaveBeenCalledWith(url, {
				// the default options
				isAuthenticated: false,
				observedProperties: [],
				ids: []
			});
		});
	});
});
