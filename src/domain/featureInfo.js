/**
 * @module domain/featureInfo
 */
/**
 * @typedef {Object} FeatureInfo
 * @property {string} title The title of this FeatureInfo
 * @property {string|TemplateResult} content The content of this FeatureInfo
 * @property {FeatureInfoGeometry} [geometry] Corresponding geometry of this FeatureInfo
 */

/**
 * Geometry data for a {@link FeatureInfo}
 * @typedef {Object} FeatureInfoGeometry
 * @property {object|string} data Geometry (e.g. geoJson, WKT)
 * @property {FeatureInfoGeometryTypes} geometryType The type of the geometry

/**
 * Type of a {@link FeatureInfoGeometry}
 * @readonly
 * @enum {Number}
 */
export const FeatureInfoGeometryTypes = Object.freeze({
	GEOJSON: 0
});
