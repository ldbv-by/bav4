/**
 * @module domain/catalogTypeDef
 */
/**
 * @typedef {Object} CatalogNode
 * @property {string} label The label of this CatalogNode
 * @property {string} id The id of this CatalogNode
 * @property {boolean} [open] `true` if this entry should be displayed opened
 * @property {Array<module:domain/catalogTypeDef~GeoResourceRef|module:domain/catalogTypeDef~CatalogNode>} children The elements of this CatalogNode
 */

/**
 * @typedef {Object} GeoResourceRef
 * @property {string} geoResourceId The id of a {@link GeoResource}
 */
