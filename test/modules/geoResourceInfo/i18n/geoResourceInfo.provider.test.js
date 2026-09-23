import { provide } from '@src/modules/geoResourceInfo/i18n/geoResourceInfo.provider';

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

		expect(map.geoResourceInfo_typeBadge_label_aggregate).toBe('Composition');
		expect(map.geoResourceInfo_typeBadge_desc_aggregate).toBe('Description for Composition');
		expect(map.geoResourceInfo_typeBadge_label_wms).toBe('WMS');
		expect(map.geoResourceInfo_typeBadge_desc_wms).toBe('Description for WMS');
		expect(map.geoResourceInfo_typeBadge_label_xyz).toBe('XYZ');
		expect(map.geoResourceInfo_typeBadge_desc_xyz).toBe('Description for XYZ');
		expect(map.geoResourceInfo_typeBadge_label_vector).toBe('Vector');
		expect(map.geoResourceInfo_typeBadge_desc_vector).toBe('Description for Vector');
		expect(map.geoResourceInfo_typeBadge_label_oaf).toBe('OAF');
		expect(map.geoResourceInfo_typeBadge_desc_oaf).toBe('Description for OAF');
		expect(map.geoResourceInfo_typeBadge_label_sta).toBe('STA');
		expect(map.geoResourceInfo_typeBadge_desc_sta).toBe('Description for STA');
		expect(map.geoResourceInfo_typeBadge_label_rtvector).toBe('RT');
		expect(map.geoResourceInfo_typeBadge_desc_rtvector).toBe('Description for RT');
		expect(map.geoResourceInfo_typeBadge_label_vt).toBe('VT');
		expect(map.geoResourceInfo_typeBadge_desc_vt).toBe('Description for VT');
		expect(map.geoResourceInfo_typeBadge_label_future).toBe('?');
		expect(map.geoResourceInfo_typeBadge_desc_future).toBe('The type of the geo-resource is not yet known');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.geoResourceInfo_empty_geoResourceInfo).toBe('Keine Ebenen-Information verfügbar');
		expect(map.geoResourceInfo_geoResourceInfo_response_error).toBe('Die Ebenen-Information konnte nicht geladen werden');
		expect(map.geoResourceInfo_last_modified_description).toBe('Diese GeoResource wurde mit der Zeichen- oder Messfunktion erstellt.');
		expect(map.geoResourceInfo_last_modified_description_copy).toBe(
			'Wenn diese Zeichnung über einen Link mit Ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichnen- oder Messfunktion eine neue Zeichnung entstehen. Die ursprüngliche Zeichnung bleibt unverändert.'
		);
		expect(map.geoResourceInfo_last_modified_description_collaborative).toBe(
			'Wenn diese Zeichnung über einen Link mit Ihnen geteilt wurde, wird durch das Bearbeiten mit der Zeichnen- oder Messfunktion die ursprüngliche Zeichnung verändert.'
		);
		expect(map.geoResourceInfo_last_modified).toBe('Letzte Änderung');
		expect(map.geoResourceInfo_infographic_collaboration_original).toBe('Original');
		expect(map.geoResourceInfo_infographic_collaboration_copy).toBe('Kopie');

		expect(map.geoResourceInfo_typeBadge_label_aggregate).toBe('Komposition');
		expect(map.geoResourceInfo_typeBadge_desc_aggregate).toBe('Beschreibung des Typs Komposition');
		expect(map.geoResourceInfo_typeBadge_label_wms).toBe('WMS');
		expect(map.geoResourceInfo_typeBadge_desc_wms).toBe('Beschreibung des Typs WMS');
		expect(map.geoResourceInfo_typeBadge_label_xyz).toBe('XYZ');
		expect(map.geoResourceInfo_typeBadge_desc_xyz).toBe('Beschreibung des Typs XYZ');
		expect(map.geoResourceInfo_typeBadge_label_vector).toBe('Vector');
		expect(map.geoResourceInfo_typeBadge_desc_vector).toBe('Beschreibung des Typs Vector');
		expect(map.geoResourceInfo_typeBadge_label_oaf).toBe('OAF');
		expect(map.geoResourceInfo_typeBadge_desc_oaf).toBe('Beschreibung des Typs OAF');
		expect(map.geoResourceInfo_typeBadge_label_sta).toBe('STA');
		expect(map.geoResourceInfo_typeBadge_desc_sta).toBe('Beschreibung des Typs STA');
		expect(map.geoResourceInfo_typeBadge_label_rtvector).toBe('RT');
		expect(map.geoResourceInfo_typeBadge_desc_rtvector).toBe('Beschreibung des Typs RT');
		expect(map.geoResourceInfo_typeBadge_label_vt).toBe('VT');
		expect(map.geoResourceInfo_typeBadge_desc_vt).toBe('Beschreibung des Typs VT');
		expect(map.geoResourceInfo_typeBadge_label_future).toBe('?');
		expect(map.geoResourceInfo_typeBadge_desc_future).toBe('Der Typ der GeoRessource ist noch nicht bekannt');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 26;
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
