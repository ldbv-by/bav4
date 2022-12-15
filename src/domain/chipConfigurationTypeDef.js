/**
 * Configuration of a Chip.
 * @typedef {Object} ChipConfiguration
 * @property {string} id The id of this chip
 * @property {string} title The title of this chip
 * @property {string} href The url pointing to the content
 * @property {boolean} permanent Chip should be always visible
 * @property {string} target One of `["modal", "external"]`
 * @property {object} style The style of this chip
 * @property {object} [observer] Optional observer for this chip

/**
* @typedef {Object} ChipObserver
* @property {Array<String>} geoResources
* @property {Array<String>} topics
*/

/**
* @typedef {Object} ChipStyle
* @property {String} colorLight
* @property {String} backgroundColorLight
* @property {String} colorDark
* @property {String} backgroundColorDark
* @property {String} [icon]
*/
