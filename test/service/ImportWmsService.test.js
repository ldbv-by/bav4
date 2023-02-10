import { $injector } from '../../src/injection';
import { WmsGeoResource } from '../../src/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType';
import { ImportWmsService } from '../../src/services/ImportWmsService';
import { bvvCapabilitiesProvider } from '../../src/services/provider/wmsCapabilities.provider';
import { getAttributionProviderForGeoResourceImportedByUrl } from '../../src/services/provider/attribution.provider';

describe('ImportWmsService', () => {
	const geoResourceService = {
		addOrReplace() { }
	};
	const urlService = {
		originAndPathname() { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('UrlService', urlService);
	});

	const handledByGeoResourceServiceMarker = 'marker';
	const addOrReplaceMethodMock = gr => {
		gr.marker = handledByGeoResourceServiceMarker;
		return gr;
	};

	describe('init', () => {

		it('initializes the service with custom provider', () => {
			const customProvider = async () => { };
			const instanceUnderTest = new ImportWmsService(customProvider);
			expect(instanceUnderTest._wmsCapabilitiesProvider).toBeDefined();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', () => {
			const instanceUnderTest = new ImportWmsService();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(bvvCapabilitiesProvider);
		});
	});

	describe('forUrl', () => {
		const getCompleteOptions = () => {
			return {
				isAuthenticated: false, sourceType: new SourceType(SourceTypeName.WMS, '42'), layers: [],
				ids: []
			};
		};

		it('calls the provider with the whole set of options', async () => {
			const url = 'https://some.url/wms';
			const subSetOfOptions = {
				sourceType: new SourceType(SourceTypeName.WMS, '42')
			};
			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, getCompleteOptions()).and.resolveTo(resultMock);
			spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(providerSpy);

			const result = await instanceUnderTest.forUrl(url, subSetOfOptions);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});

		it('registers the WmsGeoResources', async () => {
			const url = 'https://some.url/wms';
			const options = getCompleteOptions();
			const resultMock = [new WmsGeoResource('0', '', '', '', ''), new WmsGeoResource('1', '', '', '', ''), new WmsGeoResource('2', '', '', '', '')];
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake(addOrReplaceMethodMock);
			const urlServiceSpy = spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toHaveSize(3);
			result.forEach(gr => {
				expect(gr.getAttribution()).toEqual([getAttributionProviderForGeoResourceImportedByUrl(url)(gr)]);
				expect(gr.marker).toBe(handledByGeoResourceServiceMarker);
			});
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(3);
			expect(urlServiceSpy).toHaveBeenCalled();
		});

		it('uses defaultOptions', async () => {
			const url = 'https://some.url/wms';

			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, {
				// the default options
				isAuthenticated: false,
				sourceType: new SourceType(SourceTypeName.WMS, '1.1.1'),
				layers: [],
				ids: []
			})
				.and.resolveTo(resultMock);
			spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(providerSpy);

			const result = await instanceUnderTest.forUrl(url);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});
	});
});
