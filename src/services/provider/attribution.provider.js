/**
 * @module services/provider/attribution_provider
 */

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { GeoResourceTypes } from '../../domain/geoResources';

/**
 * Provides BVV specific determined attributions.
 * @function
 * @type {module:domain/geoResources~attributionProvider}
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
 * @type {module:domain/geoResources~attributionProvider}
 */
export const getDefaultAttribution = (georesource) => {
	return georesource.attribution
		? isString(georesource.attribution)
			? getMinimalAttribution(georesource.attribution)
			: georesource.attribution
		: getMinimalAttribution('');
};

/**
 * Provider function for a locally imported or created GeoResource.
 * @function
 * @type {module:domain/geoResources~attributionProvider}
 */
export const getAttributionForLocallyImportedOrCreatedGeoResource = (georesource) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	return {
		description: georesource.label,
		copyright: { label: translationService.translate('global_locally_imported_dataset_copyright_label') }
	};
};

/**
 * BVV provider function for a routing result.
 * @function
 * @type {module:domain/geoResources~attributionProvider}
 */
export const getBvvAttributionForRoutingResult = (georesource) => {
	return {
		description: georesource.label,
		copyright: [{ label: 'Bayerische Vermessungsverwaltung' }, { label: 'Powered by Graphhopper', url: 'https://www.graphhopper.com/' }]
	};
};

/**
 * Returns a `function` returning the actual {@link module:domain/geoResources~attributionProvider} for an URL based GeoResource imported by the user.
 * @function
 * @param {String} url the URL as `string`
 * @returns a `function` which returns an {@link module:domain/geoResources~attributionProvider}
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
