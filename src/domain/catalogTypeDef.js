/**
 * @module domain/catalogTypeDef
 */
/**
 * @typedef {Object} CatalogEntry
 * @property {string} label The label of this CatalogEntry
 * @property {boolean} [open] `true` if this entry should be displayed opened
 * @property {Array<module:domain/catalogTypeDef~GeoResourceRef|module:domain/catalogTypeDef~CatalogEntry>} children The elements of this CatalogEntry
 */

/**
 * @typedef {Object} GeoResourceRef
 * @property {string} geoResourceId The id of a {@link GeoResource}
 */
