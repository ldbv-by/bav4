/**
 * @module utils/propertyUtils
 */
import { isString } from './checks';

const INTERNAL_PROPERTY_PREFIX = '_ba_';

/**
 * Prepends a key with the internal-property prefix. Does nothing when the prefix is already present.
 * @param {string} propertyKey
 * @returns {string} the key prepended with the internal-property prefix or `null` if the given key is not a string
 */
export const markAsInternalProperty = (propertyKey) => {
	if (isString(propertyKey)) {
		return isInternalProperty(propertyKey) ? propertyKey : `${INTERNAL_PROPERTY_PREFIX}${propertyKey}`;
	}
	return null;
};

/**
 * Checks if a given property key denotes an internal property
 * @param {String} propertyKey A key of an property
 * @returns {boolean} `true` if the key denotes an internal property
 */
export const isInternalProperty = (propertyKey) => {
	if (isString(propertyKey)) {
		return propertyKey.startsWith(INTERNAL_PROPERTY_PREFIX);
	}
	return false;
};

/**
 * Defines a list of internally used legacy property keys for filtering that should not be displayed in an UI or exported
 */
export const LEGACY_INTERNAL_PROPERTY_KEYS = Object.freeze([
	'style',
	'styleHint',
	'showPointNames',
	'finishOnFirstPoint',
	'displayruler',
	'measurement',
	'area',
	'partitions',
	'partition_delta',
	'overlays',
	'manualPositioning',
	'dragging'
]);

/**
 * Defines a list of common properties that should not be displayed in an UI or exported
 */
export const COMMON_UNWANTED_PROPERTY_KEYS = Object.freeze(['geometry' /*ol*/, 'styleUrl' /*KML*/]);
