export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				feedback_header: 'Send Feedback',
				feedback_error: 'Error',
				feedback_could_not_save: 'Feedback could not be saved',
				feedback_saved_successfully: 'Feedback was successfully submitted',
				feedback_markChangeNotice: 'Edit the map',
				feedback_categorySelection: 'Choose your category',
				feedback_changeDescription: 'Your message',
				feedback_eMail: 'eMail',
				feedback_privacyPolicy: 'Privacy Policy',
				feedback_pleaseSelect: 'Please select at least one Point',
				feedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
			};

		case 'de':
			return {
				feedback_header: 'Feedback zur Karte',
				feedback_error: 'Fehler',
				feedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				feedback_markChangeNotice: 'Auf welche Stelle in der Karte bezieht sich ihr Feedback (bitte markieren)?',
				feedback_categorySelection: 'Zu welcher Kategorie passt ihr Feedback am Besten (bitte wählen)?',
				feedback_changeDescription: 'Ihre Nachricht',
				feedback_eMail: 'Ihre E-Mail-Adresse',
				feedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_pleaseSelect: 'Please draw at least one Point to mark the location of your feedback',
				feedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
			};

		default:
			return {};
	}
};
