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

export const getOklchContrastColorFrom = (baseColor) => {
	const OKLCH_CONTRAST_LIMIT = 50;
	const isDark = (oklch) => oklch[0] < OKLCH_CONTRAST_LIMIT;
	if (!isRGBColor(baseColor)) {
		return null;
	}

	const okLch = rgbToOklch(baseColor);

	// only Black & White
	const lighter = (oklch) => [oklch[0] + OKLCH_CONTRAST_LIMIT, oklch[1], oklch[2]];
	const darker = (oklch) => [oklch[0] - OKLCH_CONTRAST_LIMIT, oklch[1], oklch[2]];

	// const contrastHsv = isDark(hsv) ? lighter(hsv) : darker(hsv);
	const contrastOklch = isDark(okLch) ? lighter(okLch) : darker(okLch);

	return oklchToRgb(contrastOklch);
};

const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];
const D65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329];
// sRGB-related functions

/**
 * Simple matrix (and vector) multiplication
 * Warning: No error handling for incompatible dimensions!
 * @author Lea Verou 2020 MIT License
 */
// A is m x n. B is n x p. product is m x p.
export const multiplyMatrices = (A, B) => {
	const m = A.length;

	if (!Array.isArray(A[0])) {
		// A is vector, convert to [[a, b, c, ...]]
		A = [A];
	}

	if (!Array.isArray(B[0])) {
		// B is vector, convert to [[a], [b], [c], ...]]
		B = B.map((x) => [x]);
	}

	const p = B[0].length;
	const B_cols = B[0].map((_, i) => B.map((x) => x[i])); // transpose B
	let product = A.map((row) =>
		B_cols.map((col) => {
			if (!Array.isArray(row)) {
				return col.reduce((a, c) => a + c * row, 0);
			}

			return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
		})
	);

	if (m === 1) {
		product = product[0]; // Avoid [[a, b, c, ...]]
	}

	if (p === 1) {
		return product.map((x) => x[0]); // Avoid [[a], [b], [c], ...]]
	}

	return product;
};

export const lin_sRGB = (RGB) => {
	// convert an array of sRGB values
	// where in-gamut values are in the range [0 - 1]
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// for negative values,  linear portion is extended on reflection of axis,
	// then reflected power function is used.
	return RGB.map((val) => {
		const sign = val < 0 ? -1 : 1;
		const abs = Math.abs(val);

		if (abs <= 0.04045) {
			return val / 12.92;
		}

		return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
	});
};

export const lin_sRGB_to_XYZ = (rgb) => {
	// convert an array of linear-light sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)

	const M = [
		[506752 / 1228815, 87881 / 245763, 12673 / 70218],
		[87098 / 409605, 175762 / 245763, 12673 / 175545],
		[7918 / 409605, 87881 / 737289, 1001167 / 1053270]
	];
	return multiplyMatrices(M, rgb);
};
// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
// recalculated for 64bit precision
// see https://github.com/color-js/color.js/pull/357

export const XYZ_to_OKLab = (XYZ) => {
	// Given XYZ relative to D65, convert to OKLab
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

export const OKLab_to_OKLCH = (OKLab) => {
	const epsilon = 0.000004;
	let hue = (Math.atan2(OKLab[2], OKLab[1]) * 180) / Math.PI;
	const chroma = Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2);
	if (hue < 0) {
		hue = hue + 360;
	}
	if (chroma <= epsilon) {
		hue = NaN;
	}
	return [
		OKLab[0], // L is still L
		chroma,
		hue
	];
};

export const rgbToOklch = (rgb) => {
	const linarRGB = lin_sRGB(rgb);
	const xyz = lin_sRGB_to_XYZ(linarRGB);

	const okLab = XYZ_to_OKLab(xyz);
	return OKLab_to_OKLCH(okLab);
};

export const OKLCH_to_OKLab = (OKLCH) => {
	return [
		OKLCH[0], // L is still L
		OKLCH[1] * Math.cos((OKLCH[2] * Math.PI) / 180), // a
		OKLCH[1] * Math.sin((OKLCH[2] * Math.PI) / 180) // b
	];
};

export const OKLab_to_XYZ = (OKLab) => {
	// Given OKLab, convert to XYZ relative to D65
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
export const XYZ_to_lin_sRGB = (XYZ) => {
	// convert XYZ to linear-light sRGB

	const M = [
		[12831 / 3959, -329 / 214, -1974 / 3959],
		[-851781 / 878810, 1648619 / 878810, 36519 / 878810],
		[705 / 12673, -2585 / 12673, 705 / 667]
	];

	return multiplyMatrices(M, XYZ);
};
export const gam_sRGB = (RGB) => {
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	// Extended transfer function:
	// For negative values, linear portion extends on reflection
	// of axis, then uses reflected pow below that
	return RGB.map(function (val) {
		const sign = val < 0 ? -1 : 1;
		const abs = Math.abs(val);

		if (abs > 0.0031308) {
			return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
		}

		return 12.92 * val;
	});
};
export const oklchToRgb = (oklch) => {
	const oklab = OKLCH_to_OKLab(oklch);
	const xyz = OKLab_to_XYZ(oklab);
	const linearsRgb = XYZ_to_lin_sRGB(xyz);

	const gammaCorrectedsRgb = gam_sRGB(linearsRgb);
	return gammaCorrectedsRgb.map((comp) => (comp > 0 ? Math.min(Math.floor(comp), 255) : 0));
};
