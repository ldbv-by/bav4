export const firstStepsProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				help_firstSteps_button: 'Help',
				help_firstSteps_notification_header: 'First steps',
				help_firstSteps_notification_text: 'Need help recording?',
				help_firstSteps_notification_close: 'No thanks',
				help_firstSteps_notification_first_steps: 'First steps',
				help_firstSteps_link: 'https://bayernatlas.de'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				help_firstSteps_button: 'Hilfe',
				help_firstSteps_notification_header: 'Erste Schritte',
				help_firstSteps_notification_text: 'Sie brauchen Hilfe bei der Erfassung?',
				help_firstSteps_notification_close: 'Nein Danke',
				help_firstSteps_notification_first_steps: 'Erste Schritte',
				help_firstSteps_link: 'https://bayernatlas.de'
			};

		default:
			return {};
	}
};
