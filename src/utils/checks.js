/**
 * @module utils/checks
 */
/**
 * Checks if a value is a Object.
 * @function
 * @param {*} val
 * @returns {boolean} true if it is a object
 */
export const isObject = (val) => {
	return Object.prototype.toString.call(val) === '[object Object]';
};

/**
 * Checks if a value is a string (primitive or object).
 * @function
 * @param {*} val
 * @returns {boolean} `true` if it is a string
 */
export const isString = (val) => {
	return typeof val === 'string' || val instanceof String;
};

/**
 * Checks if a value is a string (primitive or object).
 * @function
 * @param {*} val
 * @param {boolean} [strict=true] false if strings representing a number should be allowed
 * @returns {boolean} `true` if it is a number
 */
export const isNumber = (val, strict = true) => {
	if (strict) {
		return val != null && !isString(val) && !isNaN(val);
	}
	return val !== null && !Number.isNaN(Number(val)) && val.length !== 0;
};

/**
 * Checks if a value is a {@link Coordinate}.
 * @function
 * @param {*} val
 * @returns {boolean} true if it is a coordinate
 */
export const isCoordinate = (val) => {
	return Array.isArray(val) && val.length === 2 && isNumber(val[0]) && isNumber(val[1]);
};

/**
 * Checks if a value is a Promise.
 * @function
 * @param {*} val
 * @returns {boolean} `true` if it is a Promise
 */
export const isPromise = (val) => {
	// eslint-disable-next-line promise/prefer-await-to-then
	return Boolean(val && typeof val.then === 'function');
};

/**
 * Checks if a value is a lit-html TemplateResult.
 * @function
 * @param {*} val
 * @returns {boolean} `true` if it is a TemplateResult
 */
export const isTemplateResult = (val) => {
	return isObject(val) ? '_$litType$' in val : false;
};

/**
 * Checks if a value is a string and represents an HTTP URL.
 * based on https://stackoverflow.com/a/43467144
 * @function
 * @param {*} val
 * @returns {boolean} `true` if the value is a string and represents an HTTP URL
 */
export const isHttpUrl = (val) => {
	const getUrl = (string) => {
		try {
			return new URL(string);
		} catch (_) {
			return null;
		}
	};

	const url = isString(val) ? getUrl(val) : null;
	return url ? url.protocol === 'http:' || url.protocol === 'https:' : false;
};

/**
 * Checks if an object is a string and denotes an external GeoResource (URL-based ID).
 * An URL-based ID basically matches the following pattern:
 * `{url}||{extraParam1}||{extraParam2}`
 * @function
 * @param {*} id ID of a GeoResource
 * @returns  `true` if the id denotes an external GeoResource
 */
export const isExternalGeoResourceId = (id) => {
	if (isString(id)) {
		const parts = id.split('||');

		return parts.length && isHttpUrl(parts[0]);
	}
	return false;
};
