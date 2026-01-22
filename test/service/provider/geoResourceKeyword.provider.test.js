import { $injector } from '../../../src/injection';
import { VectorGeoResource, VectorSourceType, VTGeoResource, WmsGeoResource } from '../../../src/domain/geoResources';
import { getKeywordsForGeoResource } from '../../../src/services/provider/geoResourceKeyword.provider';

describe('getKeywordsForGeoResource', () => {
	beforeEach(() => {
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
	});

	it('returns keywords for GeoResources', () => {
		expect(getKeywordsForGeoResource()).toEqual([]);

		expect(getKeywordsForGeoResource(new WmsGeoResource('id', 'label', 'url', 'layers', 'format'))).toEqual([]);

		expect(getKeywordsForGeoResource(new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setAuthRoles(['FOO', 'BAR']))).toEqual([
			{ name: 'FOO', description: 'global_georesource_keyword_role_desc' },
			{ name: 'BAR', description: 'global_georesource_keyword_role_desc' }
		]);
		expect(getKeywordsForGeoResource(new VTGeoResource('id', 'label', 'styleUrl').setAuthRoles(['FOO', 'BAR']))).toEqual([
			{ name: 'FOO', description: 'global_georesource_keyword_role_desc' },
			{ name: 'BAR', description: 'global_georesource_keyword_role_desc' },
			{ name: 'global_georesource_keyword_hd', description: 'global_georesource_keyword_hd_desc' }
		]);

		expect(
			getKeywordsForGeoResource(new VectorGeoResource('id', 'label', VectorSourceType.EWKT).markAsLocalData(true).setAuthRoles(['FOO', 'BAR']))
		).toEqual([
			{ name: 'FOO', description: 'global_georesource_keyword_role_desc' },
			{ name: 'BAR', description: 'global_georesource_keyword_role_desc' },
			{ name: 'global_georesource_keyword_local', description: 'global_georesource_keyword_local_desc' }
		]);

		const externalGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setAuthRoles(['FOO', 'BAR']);
		spyOn(externalGeoResource, 'isExternal').and.returnValue(true);
		expect(getKeywordsForGeoResource(externalGeoResource)).toEqual([
			{ name: 'FOO', description: 'global_georesource_keyword_role_desc' },
			{ name: 'BAR', description: 'global_georesource_keyword_role_desc' },
			{ name: 'global_georesource_keyword_external', description: 'global_georesource_keyword_external_desc' }
		]);
	});
});
