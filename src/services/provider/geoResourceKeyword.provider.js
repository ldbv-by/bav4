/**
 * @module services/provider/geoResourceKeyword_provider
 */
import { $injector } from '../../injection/index';

/**
 * Implementation of {@link module:services/GeoResourceService~keywordProvider}.
 * @function
 * @type {module:services/GeoResourceService~keywordProvider}
 */
export const getKeywordsForGeoResource = (geoResource) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	const translate = (key) => translationService.translate(key);

	if (geoResource) {
		const keywords = [...geoResource.authRoles];
		if (geoResource.hasLocalData?.()) {
			keywords.push(translate('global_georesource_keyword_local'));
		}
		if (geoResource.isExternal()) {
			keywords.push(translate('global_georesource_keyword_external'));
		}
		return keywords;
	}
	return [];
};
