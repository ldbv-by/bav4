export const surveyProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				survey_button: 'Survey',
				survey_notification_header: 'Survey',
				survey_notification_text: 'Some Text make you participate',
				survey_notification_close: 'no Thanks',
				survey_notification_open: 'Sure',
				survey_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				survey_button: 'Umfrage',
				survey_notification_header: 'Umfrage',
				survey_notification_text: 'Weleche Funktionen wünschen Sie sich für den neuen Bayernatlas?',
				survey_notification_close: 'Nein Danke',
				survey_notification_open: 'Mitmachen',
				survey_link: 'https://github.com/ldbv-by/bav4-nomigration'
			};

		default:
			return {};
	}
};
