/**
 * @module utils/urlUtils
 */
/**
 * Extracts the origin of a URL following by its pathname.
 * If the URL has no pathname the result is the same like it would be calling {@link UrlService#origin}
 * @function
 * @param {string} url
 * @returns {string} origin and pathname
 * @throws TypeError
 */
export const getOriginAndPathname = (url) => {
	const urlInstance = new URL(url);
	return `${urlInstance.origin}${urlInstance.pathname.length > 1 ? urlInstance.pathname : ''}`;
};

/**
 * Extracts the origin of a URL.
 * @function
 * @param {string} url
 * @returns {string} origin
 * @throws TypeError
 */
export const getOrigin = (url) => {
	const urlInstance = new URL(url);
	return `${urlInstance.origin}`;
};

/**
 * Extracts the path parameters of a URL.
 * @function
 * @param {string} url
 * @returns {string[]} path parameters
 * @throws TypeError
 */
export const getPathParams = (url) => {
	const urlInstance = new URL(url);
	return urlInstance.pathname.split('/').filter((pp) => pp.length > 0);
};

/**
 * Appends query parameters to a given URL. Existing parameters will leave untouched.
 * @function
 * @param {string} url The URL
 * @param {object} params The query parameters that should be appended
 * @returns the complemented URL
 * @throws TypeError
 */
export const appendQueryParams = (url, params = {}) => {
	const originalUrl = new URL(url);
	const urlWithoutQP = originalUrl.toString().replace(originalUrl.search, '');
	const searchParams = new URLSearchParams(originalUrl.search);

	for (const [key, value] of Object.entries(params)) {
		searchParams.append(key, value);
	}

	return `${urlWithoutQP}?${searchParams.toString()}`;
};

/**
 * Sets query parameters to a given URL. Existing parameters containing the same key will be removed.
 *
 * If the value for a query parameter is `null`, existing parameters containing the same key will be removed.
 * @function
 * @param {string} url The URL
 * @param {object} params The query parameters that should be appended
 * @returns the complemented URL
 * @throws TypeError
 */
export const setQueryParams = (url, params = {}) => {
	const originalUrl = new URL(url);
	const urlWithoutQP = originalUrl.toString().replace(originalUrl.search, '');
	const searchParams = new URLSearchParams(originalUrl.search);

	for (const [key, value] of Object.entries(params)) {
		if (value === null) {
			searchParams.delete(key);
		} else {
			searchParams.set(key, value);
		}
	}

	return `${urlWithoutQP}?${searchParams.toString()}`;
};

/**
 * Returns a query parameter string without a leading "?".
 *
 * Note:
 * It provides an alternative for `URLSearchParams`.
 *
 * While URLSearchParams is suitable for decoding URL queries, for encoding it can lead to unexpected results such as spaces being encoded as `+` and extra characters such as `~` being percent-encoded (it uses `application/x-www-form-urlencoded`).
 * Therefore, this method encodes each entry of the the given query parameters by calling `encodeURIComponent`.
 *
 * @function
 * @param {object} queryParameters The query parameters for that query string
 * @returns {string} the query parameters string
 */
export const queryParamsToString = (queryParameters) => {
	return Object.entries(queryParameters)
		.map((pair) => pair.map(encodeURIComponent).join('='))
		.join('&');
};

/**
 * Parses a boolean value (`'true'` or `'false'`) from a String.
 * If the string does not represent a boolean value or the values is not a `String`
 * `null` is returned
 * @function
 * @param {string} possibleBooleanAsString The string that should be parsed
 * @returns {boolean|null}
 */
export const parseBoolean = (possibleBooleanAsString) => {
	switch (possibleBooleanAsString?.toLowerCase?.()) {
		case 'false':
			return false;
		case 'true':
			return true;
		default:
			return null;
	}
};
