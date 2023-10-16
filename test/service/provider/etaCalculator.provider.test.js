import { bvvEtaCalculatorProvider } from '../../../src/services/provider/etaCalculator.provider';

const milliSecondsToHour = (milliseconds) => {
	// 1- Convert to seconds:
	const seconds = milliseconds / 1000;
	// 2- Extract hours:
	const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
	const remainingSeconds = seconds % 3600; // seconds remaining after extracting hours
	// 3- Extract minutes:
	const minutes = parseInt(remainingSeconds / 60); // 60 seconds in 1 minute
	// 4- Keep only seconds not extracted to minutes:
	// remainingSeconds = seconds % 60;
	const size = 2;

	let hoursFormatted = hours + '';
	while (hoursFormatted.length < size) hoursFormatted = '0' + hoursFormatted;
	let minutesFormatted = minutes + '';
	while (minutesFormatted.length < size) minutesFormatted = '0' + minutesFormatted;
	return hoursFormatted + ':' + minutesFormatted;
};

describe('ETACalculator provider', () => {
	describe('Bvv ETACalculator provider', () => {
		const upDownEvenStats = { distance: 34200, up: 300, down: 300 };
		const moreUpThanDownStats = { distance: 34200, up: 800, down: 300 };
		const provider = bvvEtaCalculatorProvider;

		const calculateETA = (etaCalculator, stats) => {
			return milliSecondsToHour(etaCalculator.getETAfor(stats.distance, stats.up, stats.down));
		};
		it('have defined ETACalculators ', () => {
			expect(provider('bvv-hike').getETAfor).toBeDefined();
			expect(provider('bvv-bike').getETAfor).toBeDefined();
			expect(provider('bvv-mtb').getETAfor).toBeDefined();
			expect(provider('racingbike').getETAfor).toBeDefined();

			expect(provider('foo')).toBeNull();
		});

		it('calculates correct ETA for defined vehicle', () => {
			expect(calculateETA(provider('bvv-hike'), upDownEvenStats)).toBe('09:21');
			expect(calculateETA(provider('bvv-bike'), upDownEvenStats)).toBe('02:46');
			expect(calculateETA(provider('bvv-mtb'), upDownEvenStats)).toBe('02:05');
			expect(calculateETA(provider('racingbike'), upDownEvenStats)).toBe('01:38');

			expect(calculateETA(provider('bvv-hike'), moreUpThanDownStats)).toBe('10:11');
			expect(calculateETA(provider('bvv-bike'), moreUpThanDownStats)).toBe('03:48');
			expect(calculateETA(provider('bvv-mtb'), moreUpThanDownStats)).toBe('02:51');
			expect(calculateETA(provider('racingbike'), moreUpThanDownStats)).toBe('02:38');
		});
	});
});
