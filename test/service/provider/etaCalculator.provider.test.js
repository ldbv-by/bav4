import { bvvEtaCalculatorProvider } from '../../../src/services/provider/etaCalculator.provider';

describe('ETACalculator provider', () => {
	describe('Bvv ETACalculator provider', () => {
		const provider = bvvEtaCalculatorProvider;
		it('have defined ETACalculators ', () => {
			expect(provider('hike').getETAfor).toBeDefined();
			expect(provider('bike').getETAfor).toBeDefined();
			expect(provider('mtb').getETAfor).toBeDefined();
			expect(provider('roadbike').getETAfor).toBeDefined();
			expect(provider('foo')).toBeNull();

			const distance = 5000;
			const elevationUp = 500;
			const elevationDown = 100;

			expect(provider('hike').getETAfor(distance, elevationUp, elevationDown)).toBe(8970000);
			expect(provider('bike').getETAfor(distance, elevationUp, elevationDown)).toBe(6601440);
			expect(provider('mtb').getETAfor(distance, elevationUp, elevationDown)).toBe(4951440);
			expect(provider('roadbike').getETAfor(distance, elevationUp, elevationDown)).toBeCloseTo(4834361.9, 1);
		});
	});
});
