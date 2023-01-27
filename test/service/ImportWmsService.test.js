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
		const getOptions = () => {
			return { isAuthenticated: false, sourceType: new SourceType(SourceTypeName.WMS, '42') };
		};

		it('calls the provider', async () => {
			const url = 'https://some.url/wms';
			const options = getOptions();
			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, options).and.resolveTo(resultMock);
			spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(providerSpy);

			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});

		it('registers the georesources', async () => {
			const url = 'https://some.url/wms';
			const options = getOptions();
			const resultMock = [new WmsGeoResource('0', '', '', '', ''), new WmsGeoResource('1', '', '', '', ''), new WmsGeoResource('2', '', '', '', '')];
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace').and.callFake(addOrReplaceMethodMock);
			const urlServiceSpy = spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toHaveSize(3);
			result.forEach(gr => {
				expect(gr.importedByUser).toBeTrue();
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
				sourceType: new SourceType(SourceTypeName.WMS, '1.1.1')
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
