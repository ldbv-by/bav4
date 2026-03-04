import { getContrastColorFrom, hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from '../../src/utils/colors';

const Rgb_White = [255, 255, 255];
const Rgb_Red = [255, 0, 0];
const Hsv_Red = [0, 1, 1];
const Rgb_Green = [0, 255, 0];
const Hsv_Green = [120, 1, 1];
const Rgb_Blue = [0, 0, 255];
const Hsv_Blue = [240, 1, 1];
const Rgb_Cyan = [0, 255, 255];
const Hsv_Cyan = [180, 1, 1];
const Rgb_Yellow = [255, 255, 0];
const Hsv_Yellow = [60, 1, 1];
const Rgb_Magenta = [255, 0, 255];
const Hsv_Magenta = [300, 1, 1];
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

describe('rgbToHsv', () => {
	it('should convert a rgb-color array to a hsv-color-array', () => {
		const tooShortArray = [0, 0];
		expect(rgbToHsv(undefined)).toBeNull();
		expect(rgbToHsv(null)).toBeNull();
		expect(rgbToHsv(tooShortArray)).toBeNull();
		expect(rgbToHsv(Rgb_Red)).toEqual(Hsv_Red);
		expect(rgbToHsv(Rgb_Green)).toEqual(Hsv_Green);
		expect(rgbToHsv(Rgb_Blue)).toEqual(Hsv_Blue);
		expect(rgbToHsv(Rgb_Cyan)).toEqual(Hsv_Cyan);
		expect(rgbToHsv(Rgb_Magenta)).toEqual(Hsv_Magenta);
		expect(rgbToHsv(Rgb_Yellow)).toEqual(Hsv_Yellow);
	});
});

describe('hsvToRgb', () => {
	it('should convert a hsv-color array to a rgb-color array', () => {
		const tooShortArray = [0, 0];
		expect(hsvToRgb(undefined)).toBeNull();
		expect(hsvToRgb(null)).toBeNull();
		expect(hsvToRgb(tooShortArray)).toBeNull();
		expect(hsvToRgb(Hsv_Red)).toEqual(Rgb_Red);
		expect(hsvToRgb(Hsv_Green)).toEqual(Rgb_Green);
		expect(hsvToRgb(Hsv_Blue)).toEqual(Rgb_Blue);
		expect(hsvToRgb(Hsv_Cyan)).toEqual(Rgb_Cyan);
		expect(hsvToRgb(Hsv_Magenta)).toEqual(Rgb_Magenta);
		expect(hsvToRgb(Hsv_Yellow)).toEqual(Rgb_Yellow);
	});
});

describe('getContrastColorFrom', () => {
	it('should find a color with best contrast', () => {
		const rgbDarkBlue = [11, 1, 57];
		const rgbLightBlue = [36, 3, 185];
		expect(getContrastColorFrom(undefined)).toBeNull();
		expect(getContrastColorFrom(null)).toBeNull();
		expect(getContrastColorFrom(Rgb_Red)).toEqual([178.755, 178.755, 178.755]);
		expect(getContrastColorFrom(Rgb_Yellow)).toEqual([29.07, 29.07, 29.07]);
		expect(getContrastColorFrom(rgbDarkBlue)).toEqual(Rgb_White);
		expect(getContrastColorFrom(rgbLightBlue)).toEqual(Rgb_Black);
	});
});
