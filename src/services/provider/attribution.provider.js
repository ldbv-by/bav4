/**
 * A function that returns an attribution (or an array of them).
 * @typedef {Function} attributionProvider
 * @param {GeoResource} geoResource
 * @param {number} [level] level (index-like value, can be a zoom level of a map)
 * @returns {Attribution|Array<Attribution>}
 */

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { GeoResourceTypes } from '../domain/geoResources';

/**
 * Provides BVV specific determined attributions.
 * @function
 * @returns {Attribution}
 */
export const getBvvAttribution = (georesource, level = 0) => {

	const { GeoResourceService: georesourceService } = $injector.inject('GeoResourceService');

	// aggregated geoResources
	if (georesource.getType() === GeoResourceTypes.AGGREGATE) {
		return [...new Set(
			georesource.geoResourceIds
				.map(id => {
					const grs = georesourceService.byId(id);
					return grs ? grs.getAttribution(level) : null;
				})
				.filter(attr => !!attr)
				.flatMap(attr => attr)
		)];
	}

	//all other
	const attribution = georesource.attribution;
	if (!attribution || level < 0) {
		return null;
	}
	if (Array.isArray(attribution)) {
		const index = Math.round(level);
		if (index > attribution.length - 1) {
			return attribution[attribution.length - 1];
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
	return georesource.attribution
		? (isString(georesource.attribution) ? getMinimalAttribution(georesource.attribution) : georesource.attribution)
		: getMinimalAttribution('');
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
