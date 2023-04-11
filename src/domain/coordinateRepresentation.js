/**
 * Defines how a coordinate should be represented within the UI.
 * @typedef {Object} CoordinateRepresentation
 * @property {string} label label
 * @property {number} [code] the SRID or `null` which means consumer should use the particular suitable UTM zone
 * @property {number} digits decimal places for rounding
 */

/**
 * Predefined global coordinate representations.
 * @enum
 */
export const CoordinateRepresentations = Object.freeze({
	WGS84: { label: 'WGS84', code: 4326, digits: 5 },
	UTM: { label: 'UTM', code: null, digits: 0 },
	MGRS: { label: 'MGRS', code: null, digits: 0 }
});
