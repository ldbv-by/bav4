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
 * Returns an object representation for an EWKT string
 * or `null` when the EWKT is not parsable.
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

/**
 * Returns an EWKT string for a SRID number and a WKT string.
 * No further checks are done.
 * @param {number} srid The SRID
 * @param {string} wkt The WKT string
 */
export const toEwkt = (srid, wkt) => {
	return `SRID=${srid};${wkt}`;
};
