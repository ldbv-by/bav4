/**
 * A function that returns an attribution.
 * @typedef {Function} attributionProvider
 * @param {GeoResource} geoResource
 * @param {number} [level] level (index-like, can be a zoom level of a map)
 * @returns {Attribution}
 */

/**
 * Provides BVV specific determined attributions.
 * @function
 * @returns {Attribution}
 */
export const getBvvAttribution = (georesource, level = 0) => {

	const attribution = georesource.attribution;
	if (!attribution) {
		return null;
	}
	if (Array.isArray(attribution)) {
		const index = Math.round(level);
		if (index > attribution.length - 1) {
			return null;
		}
		return attribution[index];
	}
	return attribution;
};

/**
 * Default provider function for attributions.
 * @function
 * @returns {Attribution}
 */
export const getDefaultAttribution = (georesource) => {
	const attribution = georesource.attribution || '';
	return getMinimalAttribution(attribution.toString());
};

/**
 * Returns a minimal attribution containing only a copyright label
 * @param {string} copyrightLabel 
 * @returns {Attribution}
 */
export const getMinimalAttribution = (copyrightLabel) => {
	return {
		copyright: {
			label: copyrightLabel
		}
	};
};
