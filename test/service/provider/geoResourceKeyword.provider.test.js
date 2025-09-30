import { $injector } from '../../../src/injection';
import { VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../../src/domain/geoResources';
import { getKeywordsForGeoResource } from '../../../src/services/provider/geoResourceKeyword.provider';

describe('getKeywordsForGeoResource', () => {
	beforeEach(() => {
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
	});

	it('returns keywords for GeoResources', () => {
		expect(getKeywordsForGeoResource()).toEqual([]);

		expect(getKeywordsForGeoResource(new WmsGeoResource('id', 'label', 'url', 'layers', 'format'))).toEqual([]);

		expect(getKeywordsForGeoResource(new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setAuthRoles(['FOO', 'BAR']))).toEqual([
			'FOO',
			'BAR'
		]);

		expect(
			getKeywordsForGeoResource(new VectorGeoResource('id', 'label', VectorSourceType.EWKT).markAsLocalData(true).setAuthRoles(['FOO', 'BAR']))
		).toEqual(['FOO', 'BAR', 'global_georesource_keyword_local']);

		const externalGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format').setAuthRoles(['FOO', 'BAR']);
		spyOn(externalGeoResource, 'isExternal').and.returnValue(true);
		expect(getKeywordsForGeoResource(externalGeoResource)).toEqual(['FOO', 'BAR', 'global_georesource_keyword_external']);
	});
});
