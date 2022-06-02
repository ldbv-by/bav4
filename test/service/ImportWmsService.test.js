import { $injector } from '../../src/injection';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../../src/services/domain/sourceType';
import { ImportWmsService } from '../../src/services/ImportWmsService';
import { bvvCapabilitiesProvider } from '../../src/services/provider/wmsCapabilities.provider';
import { TestUtils } from '../test-utils';

describe('ImportWmsService', () => {
	const geoResourceService = {
		addOrReplace() { }
	};
	const setup = (provider = bvvCapabilitiesProvider) => {
		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('GeoResourceService', geoResourceService);
		return new ImportWmsService(provider);
	};

	describe('init', () => {

		it('initializes the service with custom provider', async () => {
			const customProvider = async () => { };
			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._wmsCapabilitiesProvider).toBeDefined();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			TestUtils.setupStoreAndDi();
			$injector.registerSingleton('GeoResourceService', geoResourceService);
			const instanceUnderTest = new ImportWmsService();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(bvvCapabilitiesProvider);
		});


	});

	describe('forUrl', () => {
		const getSourceTypeResult = () => new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.WMS, '42'));

		it('calls the provider', async () => {
			const url = 'https://some.url/wms';
			const sourceTypeResult = getSourceTypeResult();
			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, sourceTypeResult).and.resolveTo(resultMock);
			const instanceUnderTest = setup(providerSpy);

			const result = await instanceUnderTest.forUrl(url, sourceTypeResult);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});

		it('registers the georesources', async () => {
			const url = 'https://some.url/wms';
			const sourceTypeResult = getSourceTypeResult();
			const resultMock = [{}, {}, {}];
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');
			const instanceUnderTest = setup(async () => {
				return resultMock;
			});
			const result = await instanceUnderTest.forUrl(url, sourceTypeResult);

			expect(result).toHaveSize(3);
			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(3);
		});
	});

});
