export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				mapFeedback_header: 'Send Feedback',
				mapFeedback_could_not_save: 'Your feedback could not be saved',
				mapFeedback_saved_successfully: 'Your feedback was successfully submitted',
				mapFeedback_markChangeNotice: 'Edit the map',
				mapFeedback_categorySelection: 'Please choose your category',
				mapFeedback_changeDescription: 'Your message',
				mapFeedback_eMail: 'Your email address',
				mapFeedback_privacyPolicy: 'Privacy Policy',
				mapFeedback_pleaseSelect: 'Please draw at least one Point to mark the location of your feedback',
				mapFeedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
			};

		case 'de':
			return {
				mapFeedback_header: 'Feedback zur Karte',
				mapFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				mapFeedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				mapFeedback_markChangeNotice: 'Bitte markieren: Auf welche Stelle in der Karte bezieht sich ihr Feedback?',
				mapFeedback_categorySelection: 'Bitte wählen: Zu welcher Kategorie passt ihr Feedback an Besten?',
				mapFeedback_changeDescription: 'Ihre Nachricht',
				mapFeedback_eMail: 'Ihre E-Mail-Adresse',
				mapFeedback_privacyPolicy: 'Hinweis zum Datenschutz',
				mapFeedback_pleaseSelect: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.',
				mapFeedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
			};

		default:
			return {};
	}
};
