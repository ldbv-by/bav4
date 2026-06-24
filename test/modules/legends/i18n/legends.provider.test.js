import { provide } from '@src/modules/legends/i18n/legends.provider';

describe('i18n for menu module', () => {
	it('provides translation for de', () => {
		const map = provide('de');
		expect(map.legends_title).toBe('Legende');
		expect(map.legends_choose_option).toBe('Legende auswählen...');
		expect(map.legends_entry_close_button).toBe('Legende entfernen');
		expect(map.legends_close_button).toBe('Schließen');
		expect(map.legends_at_zoomlevel_not_available).toBe('Die derzeitige Zoomstufe enthält keine Legende.');
		expect(map.legends_expand_legend_entry).toBe('Inhalt anzeigen');
		expect(map.legends_collapse_legend_entry).toBe('Inhalt ausblenden');
	});

	it('provides translation for en', () => {
		const map = provide('en');
		expect(map.legends_title).toBe('Legend');
		expect(map.legends_choose_option).toBe('Select Legend...');
		expect(map.legends_entry_close_button).toBe('Remove legend');
		expect(map.legends_close_button).toBe('Close');
		expect(map.legends_at_zoomlevel_not_available).toBe('The current zoom level does not contain a legend.');
		expect(map.legends_expand_legend_entry).toBe('Expand content');
		expect(map.legends_collapse_legend_entry).toBe('Collapse content');
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
