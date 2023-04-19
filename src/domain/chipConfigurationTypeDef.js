/**
 * @module domain/chipConfigurationTypeDef
 */
/**
 * Configuration of a Chip.
 * @typedef ChipConfiguration
 * @property {string} id The id of this chip
 * @property {string} title The title of this chip
 * @property {string} href The url pointing to the content
 * @property {boolean} permanent Chip should be always visible
 * @property {'modal' | 'external'} target Whether the content is shown in the modal component or a new browser tab
 * @property {ChipStyle} style The style of this chip
 * @property {Array<ChipObserver>} [observer] Optional observer for this chip
 */

/**
 * @typedef ChipObserver
 * @property {Array<String>} geoResources
 * @property {Array<String>} topics
 */

/**
 * @typedef ChipStyle
 * @property {String} colorLight
 * @property {String} backgroundColorLight
 * @property {String} colorDark
 * @property {String} backgroundColorDark
 * @property {String} [icon]
 */
