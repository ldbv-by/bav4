import { provide } from '../../../../src/modules/featureInfo/i18n/featureInfo.provider';

describe('i18n for featureInfo module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.featureInfo_close_button).toBe('Schließen');
		expect(map.featureInfo_header).toBe('Objekt-Info');
		expect(map.featureInfo_info).toBe('Keine Informationen verfügbar.<br>Bitte in die <b>Karte</b> klicken.');
		expect(map.featureInfo_featureCollection_add_feature).toBe('Zur Sammlung hinzufügen');
		expect(map.featureInfo_featureCollection_remove_feature).toBe('Aus Sammlung entfernen');
		expect(map.featureInfo_featureCollection_add_feature_title).toBe('Dieses Objekt zu "Meine temporäre Sammlung" hinzufügen');
		expect(map.featureInfo_featureCollection_remove_feature_title).toBe('Dieses Objekt aus "Meine temporäre Sammlung" entfernen');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.featureInfo_close_button).toBe('Close');
		expect(map.featureInfo_header).toBe('Object Information');
		expect(map.featureInfo_info).toBe('No information available.<br>Please click into the <b>map</b>.');
		expect(map.featureInfo_featureCollection_add_feature).toBe('Add to collection');
		expect(map.featureInfo_featureCollection_remove_feature).toBe('Remove from collection');
		expect(map.featureInfo_featureCollection_add_feature_title).toBe('Add this object to “My temporary collection”');
		expect(map.featureInfo_featureCollection_remove_feature_title).toBe('Remove this object from “My temporary collection”');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 7;
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
