export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				legends_title: 'Legend',
				legends_choose_option: 'Select Legend...',
				legends_entry_close_button: 'remove legend',
				legends_close_button: 'close'
			};

		case 'de':
			return {
				legends_title: 'Legende',
				legends_choose_option: 'Legende auswählen...',
				legends_entry_close_button: 'Legende entfernen',
				legends_close_button: 'Schließen'
			};

		default:
			return {};
	}
};
