/**
 * @module utils/colors
 */
import { isString } from './checks';

const Min_Color_Components_Count = 3;
const isRGBColor = (rgbCandidate) => {
	const rgb_min = 0;
	const rgb_max = 255;
	return Array.isArray(rgbCandidate) && Min_Color_Components_Count <= rgbCandidate.filter((c) => rgb_min <= c && c <= rgb_max).length;
};

const isHSVColor = (hsvCandidate) => {
	const hsv_min = 0;
	const h_max = 360;
	const sv_max = 1;

	const isInMax = () => hsvCandidate[0] <= h_max && hsvCandidate[1] <= sv_max && hsvCandidate[2] <= sv_max;

	return Array.isArray(hsvCandidate) && Min_Color_Components_Count <= hsvCandidate.filter((c) => hsv_min <= c).length && isInMax();
};

/**
 * Converts an array of numeric RGB values to a hexadecimal String representation or NULL.
 * @param {Array<Number>} rgb
 * @returns {String|null}
 */
export const rgbToHex = (rgb) => {
	if (!isRGBColor(rgb)) {
		return null;
	}

	const componentToHex = (c) => {
		const hex = c.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};

/**
 * Converts the hexadecimal String representation of color to an array of numeric RGB values or NULL
 * (based on https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb).
 * @param {string} rgb
 * @returns {Array<Number>|null}
 */
export const hexToRgb = (hex) => {
	if (!isString(hex)) {
		return null;
	}

	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

/**
 * Converts a color from RGB to HSV colorspace (based on the accepted answer from
 * https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript/54070620#54070620).
 * @param {Array<number>} rgb the rgb-color array with numbers expect to be 0 <= r, g, b <= 255
 * @returns {Array<number>} the return hsv-color array with numbers (0 <= h, s, v <= 1)
 */
export const rgbToHsv = (rgb) => {
	if (!isRGBColor(rgb)) {
		return null;
	}
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const c = v - Math.min(r, g, b);
	const h = c && (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
	return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

/**
 * Converts a color from HSV to RGB colorspace (based on the accepted answer from
 * https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately).
 * @param {Array<number>} hsv the hsv-color array with numbers expect to be 0 <= h <= 360 and 0 <= s, v <= 1
 * @returns {Array<number>} the return rgb-color array with numbers(rounded) 0 <= r, g, b <= 255
 */
export const hsvToRgb = (hsv) => {
	if (!isHSVColor(hsv)) {
		return null;
	}
	const h = hsv[0] / 360;
	const s = hsv[1];
	const v = hsv[2];

	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const calculateNormalizedRgb = () => {
		switch (i % 6) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	const normalizedRgb = calculateNormalizedRgb();
	return [Math.round(normalizedRgb[0] * 255), Math.round(normalizedRgb[1] * 255), Math.round(normalizedRgb[2] * 255)];
};

/**
 * Creates a lighter or darker version of the specified base color.
 * @param {Array<Number>} baseColor the baseColor as rgb-color-array
 * @returns {Array<Number>} the rgb-color-array, which is lighter or darker as contrast to the basecolor
 */
export const getContrastColorFrom = (baseColor) => {
	const HSV_Brightness_Limit = 0.7;
	const isDark = (hsv) => hsv[2] < HSV_Brightness_Limit;

	if (!isRGBColor(baseColor)) {
		return null;
	}

	const hsv = rgbToHsv(baseColor);

	if (hsv[1] === 1 && hsv[2] === 1) {
		const complementaryHsv = [(hsv[0] + 180) % 360, hsv[1], hsv[2]];
		const complementaryRgb = hsvToRgb(complementaryHsv);
		const grayValue = 0.299 * complementaryRgb[0] + 0.587 * complementaryRgb[1] + 0.114 * complementaryRgb[2];

		return [grayValue, grayValue, grayValue];
	}

	// only Black & White
	const lighter = (hsv) => [hsv[0], 0, 1];
	const darker = (hsv) => [hsv[0], 0, 0];

	const contrastHsv = isDark(hsv) ? lighter(hsv) : darker(hsv);

	return hsvToRgb(contrastHsv);
};
