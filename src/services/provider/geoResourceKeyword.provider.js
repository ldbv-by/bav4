/**
 * @module services/provider/geoResourceKeyword_provider
 */
import { VTGeoResource } from '../../domain/geoResources';
import { $injector } from '../../injection/index';

/**
 * Implementation of {@link module:services/GeoResourceService~keywordProvider}.
 * @function
 * @type {module:services/GeoResourceService~keywordProvider}
 */
export const getKeywordsForGeoResource = (geoResource) => {
	const { TranslationService: translationService } = $injector.inject('TranslationService');
	const translate = (key, params) => translationService.translate(key, params);

	if (geoResource) {
		const keywords = [...geoResource.authRoles].map((roleKeyword) => ({
			name: roleKeyword,
			description: translate('global_georesource_keyword_role_desc', [roleKeyword])
		}));
		if (geoResource.hasLocalData?.()) {
			keywords.push({
				name: translate('global_georesource_keyword_local'),
				description: translate('global_georesource_keyword_local_desc')
			});
		}
		if (geoResource.isExternal()) {
			keywords.push({
				name: translate('global_georesource_keyword_external'),
				description: translate('global_georesource_keyword_external_desc')
			});
		}
		if (geoResource instanceof VTGeoResource) {
			keywords.push({
				name: translate('global_georesource_keyword_hd'),
				description: translate('global_georesource_keyword_hd_desc')
			});
		}
		return keywords;
	}
	return [];
};
