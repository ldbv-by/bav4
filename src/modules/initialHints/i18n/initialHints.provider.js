export const initialHintsProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				initialHints_button: 'Help',
				initialHints_notification_header: 'First steps',
				initialHints_notification_text: 'Need help recording?',
				initialHints_notification_close: 'No thanks',
				initialHints_notification_first_steps: 'First steps',
				initialHints_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				initialHints_button: 'Hilfe',
				initialHints_notification_header: 'Erste Schritte',
				initialHints_notification_text: 'Sie brauchen Hilfe bei der Erfassung?',
				initialHints_notification_close: 'Nein Danke',
				initialHints_notification_first_steps: 'Erste Schritte',
				initialHints_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		default:
			return {};
	}
};
