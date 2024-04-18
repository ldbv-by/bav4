/**
 * @module utils/urlUtils
 */
/**
 * Extracts the origin of a URL following by its pathname.
 * If the URL has no pathname the result is the same like it would be calling {@link UrlService#origin}
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
		searchParams.set(key, value);
	}

	return `${urlWithoutQP}?${searchParams.toString()}`;
};
