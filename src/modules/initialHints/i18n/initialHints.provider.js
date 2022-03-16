export const initialHintsProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				initialHints_button: 'Survey',
				initialHints_notification_header: 'Survey',
				initialHints_notification_text: 'What functions would you like to see in the new BayernAtlas',
				initialHints_notification_close: 'No thanks',
				initialHints_notification_open: 'Sure',
				initialHints_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				initialHints_button: 'Umfrage',
				initialHints_notification_header: 'Umfrage',
				initialHints_notification_text: 'Welche Funktionen wünschen Sie sich für den neuen BayernAtlas?',
				initialHints_notification_close: 'Nein Danke',
				initialHints_notification_open: 'Mitmachen',
				initialHints_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		default:
			return {};
	}
};
