import { calculateSpatialHeight, calculateSpatialResolution } from '@src/modules/csGlobe/utils/csGlobeUtils';

describe('csGlobeUtils', () => {
	// used to remove decimal places, thus resulting in integers as test results.
	const focal = 2 * Math.tan(Math.PI / 6);

	it('calculates the spatial height', () => {
		expect(calculateSpatialHeight(100 * focal, 30)).toBe(3000);
		expect(calculateSpatialHeight(100 * focal, 100)).toBe(10000);
		expect(calculateSpatialHeight(100 * focal, 50)).toBe(5000);
		expect(calculateSpatialHeight(150 * focal, 30)).toBe(4500);
	});

	it('calculates the spatial resolution', () => {
		expect(calculateSpatialResolution(100, 10 * focal)).toBe(10);
		expect(calculateSpatialResolution(100, 100 * focal)).toBe(1);
		expect(calculateSpatialResolution(100, 50 * focal)).toBe(2);
		expect(calculateSpatialResolution(150, 30 * focal)).toBe(5);
	});
});
