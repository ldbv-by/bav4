/**
 * @module utils/urlUtils
 */
/**
 * Returns a URL's origin and pathname, omitting the root pathname (`/`).
 * @param {string} url An absolute URL accepted by the {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|URL} constructor
 * @returns {string} The origin followed by the pathname, if it is not `/`
 * @throws {TypeError} If `url` cannot be parsed as an absolute URL
 */
export const getOriginAndPathname = (url) => {
	const urlInstance = new URL(url);
	return `${urlInstance.origin}${urlInstance.pathname.length > 1 ? urlInstance.pathname : ''}`;
};

/**
 * Returns a URL's origin (scheme, host, and port, when present).
 * @param {string} url An absolute URL accepted by the {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|URL} constructor
 * @returns {string} The URL origin
 * @throws {TypeError} If `url` cannot be parsed as an absolute URL
 */
export const getOrigin = (url) => {
	const urlInstance = new URL(url);
	return `${urlInstance.origin}`;
};

/**
 * Returns the non-empty path segments of a URL's pathname.
 * @param {string} url An absolute URL accepted by the {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|URL} constructor
 * @returns {string[]} The pathname segments, with leading, trailing, and repeated slashes excluded
 * @throws {TypeError} If `url` cannot be parsed as an absolute URL
 */
export const getPathParams = (url) => {
	const urlInstance = new URL(url);
	return urlInstance.pathname.split('/').filter((pp) => pp.length > 0);
};

/**
 * Appends query parameters to a URL without removing or replacing existing parameters.
 * Values are converted to strings using `URLSearchParams` semantics.
 * @param {string} url An absolute URL accepted by the {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|URL} constructor
 * @param {Object<string, *>} [params={}] Query parameter names and values to append
 * @returns {string} The URL with the appended query parameters
 * @throws {TypeError} If `url` cannot be parsed as an absolute URL
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
 * Sets query parameters on a URL. Existing values for each supplied key are replaced,
 * including duplicate occurrences of that key.
 *
 * A `null` value removes all occurrences of its key. Other values are converted to strings
 * using `URLSearchParams` semantics.
 * @param {string} url An absolute URL accepted by the {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|URL} constructor
 * @param {Object<string, *>} [params={}] Query parameter names and values to set or remove
 * @returns {string} The URL with the updated query parameters
 * @throws {TypeError} If `url` cannot be parsed as an absolute URL
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
 * Therefore, this method encodes each entry of the given query parameters by calling `encodeURIComponent`.
 *
 * @param {Object<string, *>} queryParameters Query parameter names and values; each entry is converted to a string before encoding
 * @returns {string} The encoded query string without a leading `?`
 */
export const queryParamsToString = (queryParameters) => {
	return Object.entries(queryParameters)
		.map((pair) => pair.map(encodeURIComponent).join('='))
		.join('&');
};

/**
 * Parses a boolean from the case-insensitive strings `"true"` or `"false"`.
 * Returns `null` for any other value, including non-strings.
 * @param {*} possibleBooleanAsString The value to parse
 * @returns {boolean|null} The parsed boolean, or `null` if the value is not a boolean string
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
