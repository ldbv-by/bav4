/**
 * @module domain/coordinateRepresentation
 */
/**
 * Defines the (target) representation for a coordinate.
 * @typedef {Object} CoordinateRepresentation
 * @property {string} id the of this CoordinateRepresentation
 * @property {string} label label (may be an i18n key)
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
	WGS84: { id: 'cr_global_wgs84', label: 'global_cr_global_wgs84', code: 4326, digits: 5, global: true, group: 'wgs84' },
	UTM: { id: 'cr_global_utm', label: 'UTM', code: null, digits: 0, global: true, group: 'utm' },
	MGRS: { id: 'cr_global_mgrs', label: 'MGRS', code: null, digits: 0, global: true, group: 'mgrs' },
	SphericalMercator: { id: 'cr_global_3857', label: '3857', code: 3857, digits: 6, global: true, group: 'sm' }
});
/**
 * BVV specific local projected enum of CoordinateRepresentations.
 * @readonly
 * @enum {CoordinateRepresentation}
 */
export const BvvCoordinateRepresentations = Object.freeze({
	UTM32: { id: 'cr_local_utm32', label: 'UTM32', code: 25832, digits: 0, global: false, group: 'utm' },
	UTM33: { id: 'cr_local_utm33', label: 'UTM33', code: 25833, digits: 0, global: false, group: 'utm' },
	GK4: { id: 'cr_local_gk4', label: 'GK4', code: 31468, digits: 0, global: false, group: 'gk4' }
});
