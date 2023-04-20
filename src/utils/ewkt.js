/**
 * @module utils/ewkt
 */
import { isString } from './checks';

/**
 * @typedef Ewkt
 * @property {number} srid
 * @property {string} wkt
 */

/**
 * Returns an object representation for an ewkt string
 * or `null` when ewkt is not parseable.
 * @param {string} ewkt
 * @returns {Ewkt|null}
 */
export const parse = (ewkt) => {
	if (isString(ewkt)) {
		const parts = ewkt.split(';').map((s) => s.trim());
		if (parts.length === 2 && parts[1].length > 0) {
			const srid = Number.parseInt(parts[0]?.split('=')[1]);
			if (Number.isInteger(srid)) {
				return { srid: srid, wkt: parts[1] };
			}
		}
	}
	return null;
};
