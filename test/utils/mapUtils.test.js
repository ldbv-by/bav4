/* eslint-disable no-undef */
import { calc3857MapResolution } from '../../src/utils/mapUtils.js';


describe('mapUtils', () => {

	describe('calc3857MapResolution)', () => {

		it('calculates a resolution for a given latitude, zoom level and tile size', () => {
			expect(calc3857MapResolution(48, 5, 256)).toBeCloseTo(3273.3667254226675, 3);
			expect(calc3857MapResolution(48, 6, 256)).toBeCloseTo(1636.6833627113338, 3);
			expect(calc3857MapResolution(48, 5, 512)).toBeCloseTo(1636.683362711333, 3);
			expect(calc3857MapResolution(24, 5, 256)).toBeCloseTo(4469.036799079792, 3);
		});
	});
});
