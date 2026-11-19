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
		expect(map.geoResourceInfo_typeBadge_desc_aggregate).toBe('A layer composed of several map layers');
		expect(map.geoResourceInfo_typeBadge_label_wms).toBe('WMS');
		expect(map.geoResourceInfo_typeBadge_desc_wms).toBe('The layer is provided via an OGC-compliant Web Map Service');
		expect(map.geoResourceInfo_typeBadge_label_xyz).toBe('XYZ-Tiles');
		expect(map.geoResourceInfo_typeBadge_desc_xyz).toBe('The layer is provided via a Web Map Tile Service in XYZ format');
		expect(map.geoResourceInfo_typeBadge_label_vector).toBe('Vector');
		expect(map.geoResourceInfo_typeBadge_desc_vector).toBe('The layer is based on a KML, GPX, EWKT, or GeoJSON file, or on a drawing');
		expect(map.geoResourceInfo_typeBadge_label_oaf).toBe('OAF');
		expect(map.geoResourceInfo_typeBadge_desc_oaf).toBe('The layer is based on the OGC API - Features standard');
		expect(map.geoResourceInfo_typeBadge_label_sta).toBe('STA');
		expect(map.geoResourceInfo_typeBadge_desc_sta).toBe('The layer is based on the OGC SensorThings API standard');
		expect(map.geoResourceInfo_typeBadge_label_rtvector).toBe('RT');
		expect(map.geoResourceInfo_typeBadge_desc_rtvector).toBe('The layer is updated in real time');
		expect(map.geoResourceInfo_typeBadge_label_vt).toBe('VT');
		expect(map.geoResourceInfo_typeBadge_desc_vt).toBe('The layer is provided by a vector tiles service');
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
		expect(map.geoResourceInfo_typeBadge_desc_aggregate).toBe('Eine Ebene, die sich aus mehreren Kartenebenen zusammensetzt');
		expect(map.geoResourceInfo_typeBadge_label_wms).toBe('WMS');
		expect(map.geoResourceInfo_typeBadge_desc_wms).toBe('Die Ebene wird durch einen OGC-konformen Web Map Service bereitgestellt');
		expect(map.geoResourceInfo_typeBadge_label_xyz).toBe('XYZ-Kacheln');
		expect(map.geoResourceInfo_typeBadge_desc_xyz).toBe('Die Ebene wird durch einen Web Map Tile Service im Format XYZ bereitgestellt');
		expect(map.geoResourceInfo_typeBadge_label_vector).toBe('Vektor');
		expect(map.geoResourceInfo_typeBadge_desc_vector).toBe('Die Ebene basiert auf einer KML-, GPX-, EWKT- oder GeoJSON-Datei oder einer Zeichnung');
		expect(map.geoResourceInfo_typeBadge_label_oaf).toBe('OAF');
		expect(map.geoResourceInfo_typeBadge_desc_oaf).toBe('Die Ebene basiert auf dem Standard OGC API - Features');
		expect(map.geoResourceInfo_typeBadge_label_sta).toBe('STA');
		expect(map.geoResourceInfo_typeBadge_desc_sta).toBe('Die Ebene basiert auf dem OGC SensorThings API Standard');
		expect(map.geoResourceInfo_typeBadge_label_rtvector).toBe('RT');
		expect(map.geoResourceInfo_typeBadge_desc_rtvector).toBe('Die Ebene wird in Echtzeit (real time) aktualisiert');
		expect(map.geoResourceInfo_typeBadge_label_vt).toBe('VT');
		expect(map.geoResourceInfo_typeBadge_desc_vt).toBe('Die Ebene wird durch einen Vector-Tiles-Dienst bereitgestellt');
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
