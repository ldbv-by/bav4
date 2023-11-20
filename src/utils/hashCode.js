/**
 * @module utils/hashCode
 */
import { isObject, isString } from './checks';

/**
 * Calculates a simple hash code of a string, object, array or number.
 *
 * @param {*} value
 * @returns a hash code (integer) value for the given value
 */
export const hashCode = (value) => {
	const toString = (value) => {
		const stringifyArray = (arr) => `[${arr.join(';')}]`;

		if (value === undefined) {
			return `undef:${value}`;
		} else if (value === null) {
			return `null:${value}`;
		} else if (isString(value)) {
			return value;
		} else if (isObject(value)) {
			return stringifyArray(Object.values(value));
		} else if (Array.isArray(value)) {
			return stringifyArray(value);
		}
		return `num:${value}`;
	};

	const s = toString(value);

	// see https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	}
	return h;
};
