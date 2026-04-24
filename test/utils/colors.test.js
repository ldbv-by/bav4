import { getContrastColorFrom, hexToRgb, rgbToHex } from '@src/utils/colors';
import { expect } from 'vitest';

const Rgb_Red = [255, 0, 0];
const Rgb_Yellow = [255, 255, 0];
const Rgb_Black = [0, 0, 0];

describe('rgbToHex', () => {
	it('should convert a rgb-array to hex-representation', () => {
		expect(rgbToHex(undefined)).toBeNull();
		expect(rgbToHex(null)).toBeNull();
		expect(rgbToHex('foo')).toBeNull();
		expect(rgbToHex([-1, -1, -1])).toBeNull();
		expect(rgbToHex([0, 0, 0])).toBe('#000000');
		expect(rgbToHex([186, 218, 85])).toBe('#bada55');
		expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
		expect(rgbToHex([256, 256, 256])).toBeNull();
	});
});

describe('hexToRgb', () => {
	it('should convert a color hex-representation to a rgb-array', () => {
		expect(hexToRgb(undefined)).toBeNull();
		expect(hexToRgb(null)).toBeNull();
		expect(hexToRgb(42)).toBeNull();
		expect(hexToRgb('#foo')).toBeNull();
		expect(hexToRgb('#000')).toEqual([0, 0, 0]);
		expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
		expect(hexToRgb('#bada55')).toEqual([186, 218, 85]);
		expect(hexToRgb('#ad5')).toEqual([170, 221, 85]);
		expect(hexToRgb('#aadd55')).toEqual([170, 221, 85]);
		expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
	});
});

describe('getContrastColorFrom', () => {
	it('should find a color with best contrast using OKLCH color space', () => {
		const rgbDarkBlue = [11, 1, 57];
		const rgbLightBlue = [36, 3, 185];
		const rgbGammeRgbEdgeCase = [0, 163, 143];

		expect(getContrastColorFrom(undefined)).toBeNull();
		expect(getContrastColorFrom(null)).toBeNull();
		expect(getContrastColorFrom(Rgb_Black)).toEqual([140, 140, 140]);
		expect(getContrastColorFrom(Rgb_Red)).toEqual([31, 0, 0]);
		expect(getContrastColorFrom(Rgb_Yellow)).toEqual([79, 69, 0]);
		expect(getContrastColorFrom(rgbDarkBlue)).toEqual([156, 179, 237]);
		expect(getContrastColorFrom(rgbLightBlue)).toEqual([183, 236, 255]);
		expect(getContrastColorFrom(rgbGammeRgbEdgeCase)).toEqual([0, 5, 0]);
	});
});
