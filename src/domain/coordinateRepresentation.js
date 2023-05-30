/**
 * @module domain/coordinateRepresentation
 */
/**
 * Defines the (target) representation for a coordinate.
 * @typedef {Object} CoordinateRepresentation
 * @property {string} label label
 * @property {number} code the SRID or `null`
 * @property {number} digits decimal places for rounding
 * @property {boolean} global suitable for global usage
 * @property {string} group group of this CoordinateRepresentation. CoordinateRepresentation of the same group are interchangeable for representation purposes (e.g. global and local CoordinateRepresentation of the same group)
 */

/**
 * Predefined global enum of CoordinateRepresentation.
 * @readonly
 * @enum {CoordinateRepresentation}
 */
export const GlobalCoordinateRepresentations = Object.freeze({
	WGS84: { label: 'WGS84', code: 4326, digits: 5, global: true, group: 'wgs84' },
	UTM: { label: 'UTM', code: null, digits: 0, global: true, group: 'utm' },
	MGRS: { label: 'MGRS', code: null, digits: 0, global: true, group: 'mgrs' },
	SphericalMercator: { label: '3857', code: 3857, digits: 6, global: true, group: 'sm' }
});
/**
 * BVV specific local projected enum of CoordinateRepresentations.
 * @readonly
 * @enum {CoordinateRepresentation}
 */
export const BvvCoordinateRepresentations = Object.freeze({
	UTM32: { label: 'UTM32', code: 25832, digits: 0, global: false, group: 'utm' },
	UTM33: { label: 'UTM33', code: 25833, digits: 0, global: false, group: 'utm' }
});
