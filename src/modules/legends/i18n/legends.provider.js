export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				legends_panel_header: 'Legend',
				legends_choose_option: 'Select Legend...',
				legends_entry_close_button: 'Remove legend',
				legends_close_button: 'Close',
				legends_at_zoomlevel_not_available: 'The current zoom level does not contain a legend.',
				legends_expand_legend_entry: 'Expand content',
				legends_collapse_legend_entry: 'Collapse content',
				legends_panel_add_all_legends_label: 'Add all legends',
				legends_panel_add_all_legends_title: 'Shows all available legends',
				legends_panel_remove_all_legends_label: 'Remove all legends',
				legends_panel_remove_all_legends_title: 'Removes all active legends',
				legends_panel_button_expand_label: 'Expand all legends',
				legends_panel_button_collapse_label: 'Collapse all legends',
				legends_panel_button_expand_title: 'All legends will be expanded',
				legends_panel_button_collapse_title: 'All legends will be collapsed',
				legends_panel_no_legends_selected: 'No active legends selected.<br>Please choose a <b>legend</b> from the <b>dropdown menu</b>.',
				legends_panel_no_legends_available: 'No legends available.<br>Please add GeoResources with legends in the <b>layer menu</b>.'
			};

		case 'de':
			return {
				legends_panel_header: 'Legende',
				legends_choose_option: 'Legende auswählen...',
				legends_entry_close_button: 'Legende entfernen',
				legends_close_button: 'Schließen',
				legends_at_zoomlevel_not_available: 'Die derzeitige Zoomstufe enthält keine Legende.',
				legends_expand_legend_entry: 'Inhalt einblenden',
				legends_collapse_legend_entry: 'Inhalt ausblenden',
				legends_panel_add_all_legends_label: 'Alle Legenden hinzufügen',
				legends_panel_add_all_legends_title: 'Zeigt alle verfügbaren Legenden an',
				legends_panel_remove_all_legends_label: 'Alle Legenden entfernen',
				legends_panel_remove_all_legends_title: 'Entfernt alle aktiven Legenden',
				legends_panel_button_expand_label: 'Alle Legenden aufklappen',
				legends_panel_button_collapse_label: 'Alle Legenden einklappen',
				legends_panel_button_expand_title: 'Alle Legenden werden aufgeklappt',
				legends_panel_button_collapse_title: 'Alle Legenden werden eingeklappt',
				legends_panel_no_legends_selected: 'Keine aktive Legende ausgewählt.<br>Bitte wählen Sie eine <b>Legende</b> im <b>Auswahl‑Menü</b> aus.',
				legends_panel_no_legends_available: 'Keine Legenden verfügbar.<br>Bitte fügen Sie im <b>Ebenen‑Menü</b> Ebenen mit Legenden hinzu.'
			};

		default:
			return {};
	}
};
