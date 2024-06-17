/* eslint-disable no-undef */
import { calc3857MapResolution, roundCenter, roundRotation, roundZoomLevel } from '../../src/utils/mapUtils.js';

describe('mapUtils', () => {
	describe('calc3857MapResolution)', () => {
		it('calculates a resolution for a given latitude, zoom level and tile size', () => {
			expect(calc3857MapResolution(48, 5, 256)).toBeCloseTo(3273.3667254226675, 3);
			expect(calc3857MapResolution(48, 6, 256)).toBeCloseTo(1636.6833627113338, 3);
			expect(calc3857MapResolution(48, 5, 512)).toBeCloseTo(1636.683362711333, 3);
			expect(calc3857MapResolution(24, 5, 256)).toBeCloseTo(4469.036799079792, 3);
		});
	});

	describe('roundZoomLevel', () => {
		it('rounds a zoom level', () => {
			const zoomRaw = 10.2222;
			const zoomRounded = 10.222; // rounded to 3 decimal digits
			expect(roundZoomLevel(zoomRaw)).toBe(zoomRounded);
		});
	});

	describe('roundRotation', () => {
		it('rounds a rotation value', () => {
			const rotationRaw = 0.444444;
			const rotationRounded = 0.44444; // rounded to 5 decimal digits
			expect(roundRotation(rotationRaw)).toBe(rotationRounded);
		});
	});

	describe('roundCenter', () => {
		it('rounds a center coordinate', () => {
			const centerRaw = [21.11111111, 21.11111111, 42.22222222, 42.22222222];
			const centerRounded = [21.1111111, 21.1111111, 42.2222222, 42.2222222]; // rounded to 7 decimal digits
			expect(roundCenter(centerRaw)).toEqual(centerRounded);
		});
	});
});
