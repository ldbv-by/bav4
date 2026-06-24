export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				legends_title: 'Legend',
				legends_choose_option: 'Select Legend...',
				legends_entry_close_button: 'Remove legend',
				legends_close_button: 'Close',
				legends_at_zoomlevel_not_available: 'The current zoom level does not contain a legend.',
				legends_expand_legend_entry: 'Expand content',
				legends_collapse_legend_entry: 'Collapse content'
			};

		case 'de':
			return {
				legends_title: 'Legende',
				legends_choose_option: 'Legende auswählen...',
				legends_entry_close_button: 'Legende entfernen',
				legends_close_button: 'Schließen',
				legends_at_zoomlevel_not_available: 'Die derzeitige Zoomstufe enthält keine Legende.',
				legends_expand_legend_entry: 'Inhalt anzeigen',
				legends_collapse_legend_entry: 'Inhalt ausblenden'
			};

		default:
			return {};
	}
};
