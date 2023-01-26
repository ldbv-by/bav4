import { XyzGeoResource } from '../../src/domain/geoResources';
import { getMinimalAttribution } from '../../src/services/provider/attribution.provider';
import { getUniqueCopyrights } from '../../src/utils/attributionUtils';

describe('attributionUtils', () => {

	describe('getUniqueCopyrightList', () => {

		const getGeoResources = () => {
			return [
				new XyzGeoResource('geoResourceId0', '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`foo_${zoomLevel}`)),
				//array of copyright
				new XyzGeoResource('geoResourceId1', '', '').setAttributionProvider((geoResourceId, zoomLevel) => ({
					copyright: [
						{ label: `foo_${zoomLevel}` },
						{ label: `bar_${zoomLevel}` }
					]
				})),
				// array of attribution
				new XyzGeoResource('geoResourceId2', '', '').setAttributionProvider((geoResourceId, zoomLevel) => [getMinimalAttribution(`foo_${zoomLevel}`), getMinimalAttribution(`foo_${zoomLevel}`)]),
				// attribution is null
				new XyzGeoResource('geoResourceId3', '', '').setAttributionProvider(() => null),
				// copyright is null
				new XyzGeoResource('geoResourceId4', '', '').setAttributionProvider(() => ({ copyright: null })),
				new XyzGeoResource('geoResourceId5', '', '').setAttributionProvider((geoResourceId, zoomLevel) => getMinimalAttribution(`bar_${zoomLevel}`))
			];
		};

		it('should return an unique array of copyright objects', () => {
			const copyrights = getUniqueCopyrights(getGeoResources(), 5);

			expect(copyrights).toHaveSize(2);
			expect(copyrights[0].label).toBe('bar_5');
			expect(copyrights[1].label).toBe('foo_5');
		});

		it('should return an unique array of copyright objects when no zoomLevel is provided', () => {
			const copyrights = getUniqueCopyrights(getGeoResources());

			expect(copyrights).toHaveSize(2);
			expect(copyrights[0].label).toBe('bar_0');
			expect(copyrights[1].label).toBe('foo_0');
		});

		it('should return an empy array when no GeoResouces are provided', () => {
			expect(getUniqueCopyrights()).toHaveSize(0);
		});
	});
});
