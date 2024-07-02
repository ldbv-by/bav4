/**
 * @module domain/errors
 */

/**
 * @typedef ErrorOption
 * @property {*} cause A value indicating the specific cause of the error, reflected in the cause property. When catching and re-throwing an error with a more-specific or useful error message, this property can be used to pass the original error.
 */
/**
 * `Error` that will be caught globally.
 */
export class BaRuntimeError extends Error {
	/**
	 *
	 * @param {string} message Specific message. Will be printed to the console.
	 * @param {module:domain/errors~ErrorOption} [options={}]
	 */
	constructor(message, options = {}) {
		super(message, options);
		this.name = this.constructor.name;
	}
}
/**
 * `BaRuntimeError` indicating that a `GeoResource` could not be loaded or processed.
 * @extends BaRuntimeError
 * @class
 */
export class UnavailableGeoResourceError extends BaRuntimeError {
	/**
	 *
	 * @param {string} message Specific message. Will be printed to the console.
	 * @param {string} geoResourceId The Id of the GeoResource which causes this error.
	 * @param {number} [httpStatus]
	 * @param {module:domain/errors~ErrorOption} [options={}]
	 */
	constructor(message, geoResourceId, httpStatus = null, options = {}) {
		super(message, options);
		this.geoResourceId = geoResourceId;
		this.httpStatus = httpStatus;
	}
}
