import { MfpService } from '../../src/services/MfpService';

describe('MfpService', () => {

	describe('getCapabilities', () => {

		it('provides ab array of mocked MfpCapabilities', async () => {

			const instanceUnderTest = new MfpService();

			const result = await instanceUnderTest.getCapabilities();

			expect(result).toHaveSize(4);
		});
	});

	describe('getCapabilitiesById', () => {

		it('provides a mocked MfpCapabilities by id', async () => {

			const instanceUnderTest = new MfpService();

			expect(instanceUnderTest.getCapabilitiesById('a4_landscape')).not.toBeNull();
			expect(instanceUnderTest.getCapabilitiesById('foo')).toBeNull();
		});
	});
});
