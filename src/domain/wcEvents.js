/**
 * @module domain/wcEvents
 */
/**
 * Enum which holds all events triggered by the public Web Component
 * @readonly
 * @enum {String}
 */
export const WcEvents = Object.freeze({
	/**
	 * Web Component loaded. Technically this means the wrapped iframe was loaded successful.
	 */
	LOAD: 'ba-load',
	/**
	 * Geometry loaded.
	 */
	GEOMETRY_CHANGE: 'ba-geometry-change',
	/**
	 * Feature loaded.
	 */
	FEATURE_SELECT: 'ba-feature-select'
});
