/**
 * @module domain/wcEvents
 */
/**
 * Enum which holds all events triggered by the public web component.
 * @readonly
 * @enum {String}
 */
export const WcEvents = Object.freeze({
	/**
	 * Public web component loaded.
	 */
	LOAD: 'ba-load',
	/**
	 * Geometry loaded.
	 */
	GEOMETRY_CREATE: 'ba-geometry-create',
	/**
	 * Feature loaded.
	 */
	FEATURE_SELECT: 'ba-feature-select'
});
