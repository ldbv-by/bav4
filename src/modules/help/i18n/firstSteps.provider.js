export const firstStepsProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				help_button: 'Help',
				help_notification_header: 'First steps',
				help_notification_text: 'Need help recording?',
				help_notification_close: 'No thanks',
				help_notification_first_steps: 'First steps',
				help_link: 'https://bayernatlas.de'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				help_button: 'Hilfe',
				help_notification_header: 'Erste Schritte',
				help_notification_text: 'Sie brauchen Hilfe bei der Erfassung?',
				help_notification_close: 'Nein Danke',
				help_notification_first_steps: 'Erste Schritte',
				help_link: 'https://bayernatlas.de'
			};

		default:
			return {};
	}
};
