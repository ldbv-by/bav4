import { ImportWmsService } from '../../src/services/ImportWmsService';
import { bvvCapabilitiesProvider } from '../../src/services/provider/wmsCapabilities.provider';

describe('ImportWmsService', () => {

	const setup = (provider = bvvCapabilitiesProvider) => {
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
			const instanceUnderTest = new ImportWmsService();
			expect(instanceUnderTest._wmsCapabilitiesProvider).toEqual(bvvCapabilitiesProvider);
		});

		it('calls the provider', async () => {
			const url = 'https://some.url/wms';
			const credential = { username: 'foo', password: 'bar' };
			const resultMock = [];
			const providerSpy = jasmine.createSpy('provider').withArgs(url, credential).and.resolveTo(resultMock);
			const instanceUnderTest = setup(providerSpy);

			const result = await instanceUnderTest.forUrl(url, credential);

			expect(result).toEqual([]);
			expect(providerSpy).toHaveBeenCalled();
		});
	});

});
