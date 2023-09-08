import { ETACalculatorService } from '../../src/services/ETACalculatorService';
import { bvvEtaCalculatorProvider } from '../../src/services/provider/etaCalculator.provider';

describe('ETACalculatorService', () => {
	const setup = (provider = bvvEtaCalculatorProvider) => {
		return new ETACalculatorService(provider);
	};

	describe('init', () => {
		it('initializes the service with custom provider', async () => {
			// eslint-disable-next-line no-unused-vars
			const customProvider = (vehicle) => {
				// eslint-disable-next-line no-unused-vars
				return (a, b, c) => 0;
			};

			const instanceUnderTest = setup(customProvider);
			expect(instanceUnderTest._etaCalculatorProvider).toBeDefined();
			expect(instanceUnderTest._etaCalculatorProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = new ETACalculatorService();
			expect(instanceUnderTest._etaCalculatorProvider).toEqual(bvvEtaCalculatorProvider);
		});

		it('provides a ETACalculator', async () => {
			const instanceUnderTest = setup();
			const vehicle = 'hike';

			const etaCalculator = instanceUnderTest.getETACalculatorFor(vehicle);

			expect(etaCalculator.getETAfor).toBeDefined();
			expect(etaCalculator.getETAfor(100, 20, 3)).toEqual(306600);
		});
	});
});
