import { bvvEtaCalculationProvider } from '../../../src/services/provider/etaCalculation.provider';

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

		const calculateETA = (categoryId, stats) => {
			const eta = bvvEtaCalculationProvider(categoryId, stats.distance, stats.up, stats.down);
			return eta ? milliSecondsToHour(eta) : null;
		};

		it('calculates correct ETA for defined vehicle', () => {
			expect(calculateETA('bvv-hike', upDownEvenStats)).toBe('09:21');
			expect(calculateETA('bvv-bike', upDownEvenStats)).toBe('02:46');
			expect(calculateETA('bvv-mtb', upDownEvenStats)).toBe('02:05');
			expect(calculateETA('racingbike', upDownEvenStats)).toBe('01:38');

			expect(calculateETA('bvv-hike', moreUpThanDownStats)).toBe('10:11');
			expect(calculateETA('bvv-bike', moreUpThanDownStats)).toBe('03:48');
			expect(calculateETA('bvv-mtb', moreUpThanDownStats)).toBe('02:51');
			expect(calculateETA('racingbike', moreUpThanDownStats)).toBe('02:38');

			expect(calculateETA('foo', upDownEvenStats)).toBeNull();
		});
	});
});
