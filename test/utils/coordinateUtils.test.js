import { fromString, normalize } from '../../src/utils/coordinateUtils.js';

describe('Unit test functions from coordinateUtils.js', () => {
	describe('fromString', () => {
		it('parses a coordinate from a string', () => {
			expect(fromString('1,2.3456')).toEqual([1, 2.3456]);
			expect(fromString('1#2.3456', '#')).toEqual([1, 2.3456]);
			expect(fromString()).toBeNull();
			expect(fromString('1,foo')).toBeNull();
			expect(fromString('1')).toBeNull();
			expect(fromString('Infinity,123')).toBeNull();
			expect(fromString('Infinity,NaN')).toBeNull();
		});
	});

	describe('normalize', () => {
		it('normalizes coordinates in map projection', () => {
			const boundary = 20037508.34;

			// going east multiple worlds
			expect(normalize([boundary + 500, 0])[0]).toBeCloseTo((boundary - 500) * -1, 0.01);
			expect(normalize([boundary + 1000, 0])[0]).toBeCloseTo((boundary - 1000) * -1, 0.01);
			expect(normalize([boundary * 2 + 1000, 0])[0]).toBeCloseTo(1000, 0.01);
			expect(normalize([boundary * 3 + 1000, 0])[0]).toBeCloseTo((boundary - 1000) * -1, 0.01);

			// going west multiple worlds
			expect(normalize([boundary * -1 - 500, 0])[0]).toBeCloseTo(boundary - 500, 0.01);
			expect(normalize([boundary * -2 - 1000, 0])[0]).toBeCloseTo(-1000, 0.01);
			expect(normalize([boundary * -3 - 2000, 0])[0]).toBeCloseTo(boundary - 2000, 0.01);

			// primary world coordinates stay the same
			expect(normalize([0, 0])[0]).toBeCloseTo(0, 0.01);
			expect(normalize([1000, 0])[0]).toBeCloseTo(1000, 0.01);
			expect(normalize([-1000, 0])[0]).toBeCloseTo(-1000, 0.01);
		});
	});
});
