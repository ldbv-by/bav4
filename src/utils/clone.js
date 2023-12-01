/**
 * @module utils/clone
 */
/**
 *
 * Deep clones an object or an array by converting to a JSON string. Does not work for arrays or objects containing a function or Symbol properties.
 * @param {Object|Array} value
 * @returns deep clones object or array
 * @throws SyntaxError when the value could not be stringified as JSON
 */
export const deepClone = (value) => {
	return JSON.parse(JSON.stringify(value));
};
