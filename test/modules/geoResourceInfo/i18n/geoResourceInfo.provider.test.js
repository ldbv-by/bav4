import { provide } from '../../../../src/modules/geoResourceInfo/i18n/geoResourceInfo.provider';

describe('i18n for georesourceinfo', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.geoResourceInfo_empty_geoResourceInfo).toBe('No Layer Information available');
		expect(map.geoResourceInfo_geoResourceInfo_response_error).toBe('The Layer Information could not be loaded');
		expect(map.geoResourceInfo_last_modified_description).toBe('This GeoResource was created with the draw or measure function.');
		expect(map.geoResourceInfo_last_modified_description_copy).toBe(
			'If this drawing was shared with you via a link, editing it with the draw or measure function will create a new drawing. The original drawing remains unchanged.'
		);
		expect(map.geoResourceInfo_last_modified_description_collaborative).toBe(
			'If this drawing was shared with you via a link, editing it with the draw or measure function will modify the original drawing.'
		);
		expect(map.geoResourceInfo_last_modified).toBe('Last modified');
		expect(map.geoResourceInfo_infographic_collaboration_original).toBe('Original');
		expect(map.geoResourceInfo_infographic_collaboration_copy).toBe('Copy');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.geoResourceInfo_empty_geoResourceInfo).toBe('Keine Ebenen-Information verfügbar');
		expect(map.geoResourceInfo_geoResourceInfo_response_error).toBe('Die Ebenen-Information konnte nicht geladen werden');
		expect(map.geoResourceInfo_last_modified_description).toBe('Diese GeoResource wurde mit der Zeichen- oder Messfunktion erstellt.');
		expect(map.geoResourceInfo_last_modified_description_copy).toBe(
			'Wenn diese Zeichnung über einen Link mit ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichen- oder Messfunktion eine neue Zeichnung entstehen. Die ursprüngliche Zeichnung bleibt unverändert.'
		);
		expect(map.geoResourceInfo_last_modified_description_collaborative).toBe(
			'Wenn diese Zeichnung über einen Link mit ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichen- oder Messfunktion die ursprüngliche Zeichnung verändert.'
		);
		expect(map.geoResourceInfo_last_modified).toBe('Letzte Änderung');
		expect(map.geoResourceInfo_infographic_collaboration_original).toBe('Original');
		expect(map.geoResourceInfo_infographic_collaboration_copy).toBe('Kopie');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 8;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
