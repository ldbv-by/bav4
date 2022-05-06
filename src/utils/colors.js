/**
 * Converts an array of numeric RGB-values to a the hexadecimal String-Represenation or null.
 * @param {Array<Number>} rgb
 * @returns {String|null}
 */
export const rgbToHex = (rgb) => {
	const rgb_min = 0;
	const rgb_max = 255;
	const rgb_component_count = 3;

	if (!Array.isArray(rgb)) {
		return null;
	}

	if (rgb.filter(c => rgb_min <= c && c <= rgb_max).length < rgb_component_count) {
		return null;
	}

	const componentToHex = (c) => {
		const hex = c.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};

/**
 * Converts the hexadecimal String-Represenation of a color to an array of numeric RGB-values or null.
 * based on from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} rgb
 * @returns {Array<Number>|null}
 */
export const hexToRgb = (hex) => {
	if (hex == null) {
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
 * Converts a color from RGB- to HSV-colorspace
 * based on accepted answer from https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript/54070620#54070620
 * @param {Array<number>} rgb the rgb-color array with numbers expect to be 0 <= r, g, b <= 255
 * @returns {Array<number>} the return hsv-color array with numbers (0 <= h, s, v <= 1)
 */
export const rgbToHsv = (rgb) => {
	if (rgb == null) {
		return null;
	}
	if (rgb.length !== 3) {
		return null;
	}
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const c = v - Math.min(r, g, b);
	const h = c && ((v === r) ? (g - b) / c : ((v === g) ? 2 + (b - r) / c : 4 + (r - g) / c));
	return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

/**
 * Converts a color from HSV- to RGB-colorspace
 * based on accepted answer from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 * @param {Array<number>} hsv the hsv-color array with numbers expect to be 0 <= h <= 360 and 0 <= s, v <= 1
 * @returns {Array<number>} the return rgb-color array with numbers(rounded) 0 <= r, g, b <= 255
 */
export const hsvToRgb = (hsv) => {
	if (hsv == null) {
		return null;
	}
	if (hsv.length !== 3) {
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
	return [
		Math.round(normalizedRgb[0] * 255),
		Math.round(normalizedRgb[1] * 255),
		Math.round(normalizedRgb[2] * 255)
	];
};


/**
 * creates a ligther or darker version of the specified basecolor
 * @param {Array<Number>} rgbColor the basecolor as rgb-color-array
 * @returns {Array<Number>} the rgb-color-array, which is lighter or darker as contrast to the basecolor
 */
export const getContrastColorFrom = (baseColor) => {
	const HSV_Brightness_Limit = .7;
	const isDark = (hsv) => hsv[2] < HSV_Brightness_Limit;

	// only Black & White
	const lighter = (hsv) => [hsv[0], 0, 1];
	const darker = (hsv) => [hsv[0], 0, 0];

	const hsv = rgbToHsv(baseColor);
	const contrastHsv = isDark(hsv) ? lighter(hsv) : darker(hsv);

	return hsvToRgb(contrastHsv);
};

