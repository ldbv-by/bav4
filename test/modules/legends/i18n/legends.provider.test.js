import { provide } from '@src/modules/legends/i18n/legends.provider';

describe('i18n for menu module', () => {
	it('provides translation for de', () => {
		const map = provide('de');
		expect(map.legends_panel_header).toBe('Legende');
		expect(map.legends_choose_option).toBe('Legende auswählen...');
		expect(map.legends_entry_close_button).toBe('Legende entfernen');
		expect(map.legends_close_button).toBe('Schließen');
		expect(map.legends_at_zoomlevel_not_available).toBe('Die derzeitige Zoomstufe enthält keine Legende.');
		expect(map.legends_expand_legend_entry).toBe('Inhalt einblenden');
		expect(map.legends_collapse_legend_entry).toBe('Inhalt ausblenden');
		expect(map.legends_panel_add_all_legends_label).toBe('Alle Legenden hinzufügen');
		expect(map.legends_panel_add_all_legends_title).toBe('Zeigt alle verfügbaren Legenden an');
		expect(map.legends_panel_remove_all_legends_label).toBe('Alle Legenden entfernen');
		expect(map.legends_panel_remove_all_legends_title).toBe('Entfernt alle aktiven Legenden');
		expect(map.legends_panel_button_expand_label).toBe('Alle Legenden aufklappen');
		expect(map.legends_panel_button_collapse_label).toBe('Alle Legenden einklappen');
		expect(map.legends_panel_button_expand_title).toBe('Alle Legenden werden aufgeklappt');
		expect(map.legends_panel_button_collapse_title).toBe('Alle Legenden werden eingeklappt');
		expect(map.legends_panel_no_legends_selected).toBe(
			'Keine aktive Legende ausgewählt.<br>Bitte wählen Sie eine <b>Legende</b> im <b>Auswahl‑Menü</b> aus.'
		);
		expect(map.legends_panel_no_legends_available).toBe(
			'Keine Legenden verfügbar.<br>Bitte fügen Sie im <b>Ebenen‑Menü</b> Ebenen mit Legenden hinzu.'
		);
	});

	it('provides translation for en', () => {
		const map = provide('en');
		expect(map.legends_panel_header).toBe('Legend');
		expect(map.legends_choose_option).toBe('Select Legend...');
		expect(map.legends_entry_close_button).toBe('Remove legend');
		expect(map.legends_close_button).toBe('Close');
		expect(map.legends_at_zoomlevel_not_available).toBe('The current zoom level does not contain a legend.');
		expect(map.legends_expand_legend_entry).toBe('Expand content');
		expect(map.legends_collapse_legend_entry).toBe('Collapse content');
		expect(map.legends_panel_add_all_legends_label).toBe('Add all legends');
		expect(map.legends_panel_add_all_legends_title).toBe('Shows all available legends');
		expect(map.legends_panel_remove_all_legends_label).toBe('Remove all legends');
		expect(map.legends_panel_remove_all_legends_title).toBe('Removes all active legends');
		expect(map.legends_panel_button_expand_label).toBe('Expand all legends');
		expect(map.legends_panel_button_collapse_label).toBe('Collapse all legends');
		expect(map.legends_panel_button_expand_title).toBe('All legends will be expanded');
		expect(map.legends_panel_button_collapse_title).toBe('All legends will be collapsed');
		expect(map.legends_panel_no_legends_selected).toBe('No active legends selected.<br>Please choose a <b>legend</b> from the <b>dropdown menu</b>.');
		expect(map.legends_panel_no_legends_available).toBe('No legends available.<br>Please add GeoResources with legends in the <b>layer menu</b>.');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 17;
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
