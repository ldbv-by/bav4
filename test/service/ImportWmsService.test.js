import { $injector } from '../../src/injection';
import { WmsGeoResource } from '../../src/services/domain/geoResources';
import { SourceType, SourceTypeName } from '../../src/services/domain/sourceType';
import { ImportWmsService } from '../../src/services/ImportWmsService';
import { bvvCapabilitiesProvider } from '../../src/services/provider/wmsCapabilities.provider';

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
			const providerSpy = jasmine.createSpy('provider').withArgs(url, options.sourceType, options.isAuthenticated).and.resolveTo(resultMock);
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
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const urlServiceSpy = spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, options);

			expect(result).toHaveSize(3);
			result.forEach(gr => {
				expect(gr.importedByUser).toBeTrue();
			});
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(3);
			expect(urlServiceSpy).toHaveBeenCalled();
		});

		it('use defaultOptions', async () => {
			const url = 'https://some.url/wms';

			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, jasmine.any(SourceType), false).and.resolveTo(resultMock);
			spyOn(urlService, 'originAndPathname').withArgs(url).and.returnValue(url);
			const instanceUnderTest = new ImportWmsService(providerSpy);

			const result = await instanceUnderTest.forUrl(url);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});
	});
});
