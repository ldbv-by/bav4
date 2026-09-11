/**
 * @module utils/base64
 */
/**
 * Encodes a string as Base64 using UTF-8.
 *
 * Safely supports umlauts and other Unicode characters, such as `ä`, `ö`, `ü`,
 * and `ß`.
 *
 * @param {string} str - The string to encode.
 * @returns {string} The Base64-encoded string.
 */
export const encodeBase64 = (str) => {
	return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
};

/**
 * Decodes a UTF-8 Base64 string.
 *
 * Safely restores umlauts and other Unicode characters to their original form.
 *
 * @param {string} base64 - The Base64-encoded string.
 * @returns {string} The decoded string.
 */
export const decodeBase64 = (base64) => {
	return new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
};
