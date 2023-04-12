/**
 * Defines how a coordinate should be represented within the UI.
 * @typedef {Object} CoordinateRepresentation
 * @property {string} label label
 * @property {number} [code] the SRID or `null`
 * @property {number} digits decimal places for rounding
 * @property {boolean} global suitable for global usage
 */

/**
 * Predefined global coordinate representations.
 * @enum
 */
export const CoordinateRepresentations = Object.freeze({
	WGS84: { label: 'WGS84', code: 4326, digits: 5, global: true },
	UTM: { label: 'UTM', code: null, digits: 0, global: true },
	MGRS: { label: 'MGRS', code: null, digits: 0, global: true }
});
