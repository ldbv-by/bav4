import { MfpService } from '../../src/services/MfpService';

describe('MfpService', () => {

	describe('getCapabilities', () => {

		it('provides mocked mfp capabilities', async () => {

			const instanceUnderTest = new MfpService();

			const result = await instanceUnderTest.getCapabilities();

			expect(result).toHaveSize(4);
		});
	});
});
