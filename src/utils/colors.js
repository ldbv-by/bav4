/**
 * @module utils/colors
 */
import { isString } from './checks';
import { multiplyMatrices } from './multiplyMatrices';

const Min_Color_Components_Count = 3;
const isRGBColor = (rgbCandidate) => {
	const rgb_min = 0;
	const rgb_max = 255;
	return Array.isArray(rgbCandidate) && Min_Color_Components_Count <= rgbCandidate.filter((c) => rgb_min <= c && c <= rgb_max).length;
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
 * @param {string} hex
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

export const DEFAULT_CONTRAST_LIMIT = 50;
/**
 * Creates a lighter or darker version in the oklch color space for the specified baseColor.
 *
 * @param {Array<Number>} baseColor the baseColor as rgb-color-array
 * @param {Number} [contrastLimit=DEFAULT_CONTRAST_LIMIT] The contrast limit defines the difference in luminance between the contrastColor and the baseColor. The luminance of the baseColor determines whether the contrastColor is lightened or darkened by the value of the contrastLimit.
 * @returns {Array<Number>} the rgb-color-array, which is lighter or darker as contrast to the baseColor.
 */
export const getContrastColorFrom = (baseColor, contrastLimit = DEFAULT_CONTRAST_LIMIT) => {
	const isDark = (/* eslint-disable-line no-unused-vars*/ [l, c, h]) => l < contrastLimit; // contrastLimit as luminance value
	if (!isRGBColor(baseColor)) {
		return null;
	}

	const okLch = rgbToOklch(baseColor);

	const lighter = ([l, c, h]) => [l + contrastLimit, c, h];
	const darker = ([l, c, h]) => [l - contrastLimit, c, h];

	const contrastOklch = isDark(okLch) ? lighter(okLch) : darker(okLch);

	return oklchToRgb(contrastOklch);
};

/**
 * Converts given RGB to OKLCH
 * @param {Array<Number>} rgb
 * @returns {Array<Number>}
 */
const rgbToOklch = (rgb) => {
	const linarRGB = lin_sRGB(rgb);
	const xyz = lin_sRGB_to_XYZ(linarRGB);

	const okLab = XYZ_to_OKLab(xyz);
	return OKLab_to_OKLCH(okLab);
};

/**
 * Converts given OKLCH to sRGB
 * @param {Array<Number>} oklch
 * @returns {Array<Number>}
 */
const oklchToRgb = (oklch) => {
	const oklab = OKLCH_to_OKLab(oklch);
	const xyz = OKLab_to_XYZ(oklab);
	const linearsRgb = XYZ_to_lin_sRGB(xyz);

	const gammaCorrectedsRgb = gam_sRGB(linearsRgb);
	return gammaCorrectedsRgb.map((comp) => (comp > 0 ? Math.min(Math.floor(comp), 255) : 0));
};

/**
 * convert an array of sRGB values
 * where in-gamut values are in the range [0 - 1]
 * to linear light (un-companded) form.
 *
 * https://en.wikipedia.org/wiki/SRGB
 *
 * Extended transfer function:
 * 	for negative values,  linear portion is extended on reflection of axis,
 *  then reflected power function is used.
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} RGB the rgb array
 * @returns {Array<Number>}
 */
const lin_sRGB = (RGB) => {
	return RGB.map((val) => {
		// HINT:reflection axis is removed for RGB-only use-case
		// const sign = val < 0 ? -1 : 1;
		const sign = 1;
		const abs = Math.abs(val);

		if (abs <= 0.04045) {
			return val / 12.92;
		}

		return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
	});
};

/**
 * convert an array of linear-light sRGB values to CIE XYZ
 * using sRGB's own white, D65 (no chromatic adaptation)
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} rgb
 * @returns {Array<Array<Number>>|Array<Number>}
 */
const lin_sRGB_to_XYZ = (rgb) => {
	const M = [
		[506752 / 1228815, 87881 / 245763, 12673 / 70218],
		[87098 / 409605, 175762 / 245763, 12673 / 175545],
		[7918 / 409605, 87881 / 737289, 1001167 / 1053270]
	];
	return multiplyMatrices(M, rgb);
};

/**
 * Given XYZ relative to D65, convert to OKLab
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Array<Number>>|Array<Number>} XYZ
 * @returns {Array<Array<Number>>|Array<Number>}
 */
const XYZ_to_OKLab = (XYZ) => {
	const XYZtoLMS = [
		[0.819022437996703, 0.3619062600528904, -0.1288737815209879],
		[0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
		[0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
	];
	const LMStoOKLab = [
		[0.210454268309314, 0.7936177747023054, -0.0040720430116193],
		[1.9779985324311684, -2.4285922420485799, 0.450593709617411],
		[0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
	];

	const LMS = multiplyMatrices(XYZtoLMS, XYZ);
	// JavaScript Math.cbrt returns a sign-matched cube root
	// beware if porting to other languages
	// especially if tempted to use a general power function
	return multiplyMatrices(
		LMStoOKLab,
		LMS.map((c) => Math.cbrt(c))
	);
	// L in range [0,1]. For use in CSS, multiply by 100 and add a percent
};

/**
 * converts OKLab to OKLCH
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} OKLab
 * @returns {Array<Number>}
 */
const OKLab_to_OKLCH = ([l, a, b]) => {
	const epsilon = 0.000004;
	let hue = (Math.atan2(b, a) * 180) / Math.PI;
	const chroma = Math.sqrt(a ** 2 + b ** 2);
	if (hue < 0) {
		hue = hue + 360;
	}
	if (chroma <= epsilon) {
		hue = NaN;
	}
	return [
		l, // L is still L
		chroma,
		hue
	];
};

/**
 * Given OKLCH, convert to OKLab
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} OKLCH
 * @returns {Array<Number>}
 */
const OKLCH_to_OKLab = ([l, c, h]) => {
	return [
		l, // L is still L
		c * Math.cos((h * Math.PI) / 180), // a
		c * Math.sin((h * Math.PI) / 180) // b
	];
};

/**
 * Given OKLab, convert to XYZ relative to D65
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} OKLab
 * @returns {Array<Array<Number>>|Array<Number>}
 */
const OKLab_to_XYZ = (OKLab) => {
	const LMStoXYZ = [
		[1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
		[-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
		[-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
	];
	const OKLabtoLMS = [
		[1.0, 0.3963377773761749, 0.2158037573099136],
		[1.0, -0.1055613458156586, -0.0638541728258133],
		[1.0, -0.0894841775298119, -1.2914855480194092]
	];

	const LMSnl = multiplyMatrices(OKLabtoLMS, OKLab);
	return multiplyMatrices(
		LMStoXYZ,
		LMSnl.map((c) => c ** 3)
	);
};

/**
 * convert XYZ to linear-light sRGB
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Array<Number>>|Array<Number>} XYZ
 * @returns {Array<Number>}
 */
const XYZ_to_lin_sRGB = (XYZ) => {
	const M = [
		[12831 / 3959, -329 / 214, -1974 / 3959],
		[-851781 / 878810, 1648619 / 878810, 36519 / 878810],
		[705 / 12673, -2585 / 12673, 705 / 667]
	];

	return multiplyMatrices(M, XYZ);
};

/**
 * convert an array of linear-light sRGB values in the range 0.0-1.0
 * to gamma corrected form
 *
 * https://en.wikipedia.org/wiki/SRGB
 *
 * Extended transfer function:
 * For negative values, linear portion extends on reflection of axis, then uses reflected pow below that
 *
 * based on code from https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @param {Array<Number>} RGB
 * @returns {Array<Number>}
 */
const gam_sRGB = (RGB) => {
	return RGB.map(function (val) {
		const sign = val < 0 ? -1 : 1;
		const abs = Math.abs(val);

		if (abs > 0.0031308) {
			return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
		}
		return 12.92 * val;
	});
};
