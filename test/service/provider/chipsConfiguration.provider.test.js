import { loadBvvChipConfiguration } from '../../../src/services/provider/chipsConfiguration.provider.test';

describe('Chips configuration provider', () => {

	describe('Bvv provider', () => {

		it('throws error when backend provides empty payload', async () => {
			await expectAsync(loadBvvChipConfiguration()).toBeRejectedWithError('Not yet implemented');

		});
	});
});
