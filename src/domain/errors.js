/**
 * @module domain/errors
 */
/**
 * Error that will be caught globally.
 */
export class BaRuntimeError extends Error {
	constructor(message, options = {}) {
		super(message, options);
		this.name = this.constructor.name;
	}
}
/**
 * BaRuntimeError indicating that a `GeoResource` could not be loaded.
 * @extends BaRuntimeError
 * @class
 */
export class UnavailableGeoResourceError extends BaRuntimeError {
	constructor(message, geoResourceId, httpStatus = null, options = {}) {
		super(message, options);
		this.geoResourceId = geoResourceId;
		this.httpStatus = httpStatus;
	}
}
