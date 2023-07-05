/**
 * @module services/provider/iconColor_provider
 */

/**
 * Bvv specific implementation of {@link module:services/IconService~iconColorProvider}
 * @function
 * @type {module:services/IconService~iconColorProvider}
 */
export const getBvvIconColor = (iconUrl) => {
	const regEx = /([0-9]{0,3}),([0-9]{0,3}),([0-9]{0,3})+/g;
	const colorComponents = iconUrl.match(regEx);
	if (colorComponents) {
		return colorComponents[0].split(',').map((c) => parseInt(c));
	}
	return null;
};
