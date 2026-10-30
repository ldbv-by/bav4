/**
 * @module services/provider/iconColor_provider
 */

/**
 * BVV specific implementation of {@link module:services/IconService~iconColorProvider}
 * @function
 * @type {module:services/IconService~iconColorProvider}
 */
export const getBvvIconColor = (iconUrl) => {
	const regEx = /([0-9]{0,3})(?:,|%2C)([0-9]{0,3})(?:,|%2C)([0-9]{0,3})+/g;
	const colorComponents = iconUrl.match(regEx);
	if (colorComponents && colorComponents[0].includes(',')) {
		return colorComponents[0].split(',').map((c) => parseInt(c));
	}
	if (colorComponents && colorComponents[0].includes('%2C')) {
		return colorComponents[0].split('%2C').map((c) => parseInt(c));
	}
	return null;
};
