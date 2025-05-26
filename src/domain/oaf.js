/**
 * @module domain/oaf
 */
/**
 * Capabilities of a {@link OafGeoResource}
 * @typedef OafFilterCapabilities
 * @property {number} totalNumberOfItems Total number of features available in the database
 * @property {boolean} sampled Indicates whether these OafFilterCapabilities are based on a sample
 * @property {Array<OafQueryable>} queryables List of possible `OafQueryable`
 */

/**
 * A queryable property of a {@link OafGeoResource}
 * @typedef OafQueryable
 * @property {string} name The name of this queryable property
 * @property {OafQueryableType} type The type of this queryable property
 * @property {boolean} finalized The list of values of this queryable property is final (is an enumeration)
 * @property {Array<Object>} values The values of this queryable property. If the property `finalized` is `true`, these values represent an enumeration. Otherwise, a list with example entries.
 * @property {number} [minValue] The min. value of all values
 * @property {number} [maxValue] The max. values of all values
 */

/**
 * Enum of all supported data types.
 * @readonly
 * @enum {String}
 */
export const OafQueryableType = Object.freeze({
	STRING: 'string',
	INTEGER: 'integer',
	FLOAT: 'float',
	BOOLEAN: 'boolean',
	DATE: 'date',
	DATETIME: 'datetime'
});
