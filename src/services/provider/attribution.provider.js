/**
 * @module services/provider/attribution_provider
 */
/**
 * A function that returns an attribution (or an array of them).
 * @typedef {Function} attributionProvider
 * @param {GeoResource} geoResource
 * @param {number} [level] level (index-like value, can be a zoom level of a map)
 * @returns {Attribution|Array<Attribution>}
 */

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { GeoResourceTypes } from '../../domain/geoResources';

/**
 * Provides BVV specific determined attributions.
 * @function
 * @returns {Attribution}
 */
export const getBvvAttribution = (georesource, level = 0) => {
	const { GeoResourceService: georesourceService } = $injector.inject('GeoResourceService');

	// aggregated geoResources
	if (georesource.getType() === GeoResourceTypes.AGGREGATE) {
		return [
			...new Set(
				georesource.geoResourceIds
					.map((id) => {
						const grs = georesourceService.byId(id);
						return grs ? grs.getAttribution(level) : null;
					})
					.filter((attr) => !!attr)
					.flatMap((attr) => attr)
			)
		];
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
		? isString(georesource.attribution)
			? getMinimalAttribution(georesource.attribution)
			: georesource.attribution
		: getMinimalAttribution('');
};

/**
 * Provider function for a locally imported or created GeoResouce.
 * @function
 * @returns {Attribution}
 */
export const getAttributionForLocallyImportedOrCreatedGeoResource = (georesource) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	return {
		description: georesource.label,
		copyright: { label: translationService.translate('global_locally_imported_dataset_copyright_label') }
	};
};

/**
 * Returns a `function` returning the actual provider for an URL based GeoResource imported by the user.
 * @function
 * @param {String} url the URL as `string`
 * @returns a `function` which returns an attribution provider
 */
export const getAttributionProviderForGeoResourceImportedByUrl = (url) => {
	return (georesource) => {
		const getCopyright = (urlAsString) => {
			const url = new URL(urlAsString);
			return { label: url.hostname, url: `${url.protocol}//${url.hostname}` };
		};

		return {
			description: georesource.label,
			copyright: getCopyright(url)
		};
	};
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
