export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				feedback_mapFeedback_header: 'Send Feedback',
				feedback_mapFeedback_could_not_save: 'Your feedback could not be saved',
				feedback_mapFeedback_saved_successfully: 'Your feedback was successfully submitted',
				feedback_mapFeedback_categorySelection: 'Please choose your category',
				feedback_mapFeedback_changeDescription: 'Your message',
				feedback_mapFeedback_eMail: 'Your email address',
				feedback_mapFeedback_privacyPolicy: 'Privacy Policy',
				feedback_mapFeedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.',
				feedback_mapFeedback_geometry_missing: 'Please draw at least one Point to mark the location of your feedback',
				feedback_toggleFeedback_header: 'Choose Feedback Type',
				feedback_toggleFeedback_mapButton: 'Map - Feedpack',
				feedback_toggleFeedback_generalButton: 'General - Feedpack'
			};

		case 'de':
			return {
				feedback_mapFeedback_header: 'Feedback zur Karte',
				feedback_mapFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_mapFeedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				feedback_mapFeedback_categorySelection: 'Bitte wählen: Zu welcher Kategorie passt ihr Feedback an Besten?',
				feedback_mapFeedback_changeDescription: 'Ihre Nachricht',
				feedback_mapFeedback_eMail: 'Ihre E-Mail-Adresse',
				feedback_mapFeedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_mapFeedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.',
				feedback_mapFeedback_geometry_missing: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.',
				feedback_toggleFeedback_header: 'Feedback Typ',
				feedback_toggleFeedback_mapButton: 'Kartenfeedback',
				feedback_toggleFeedback_generalButton: 'Allgemeiner Feedback'
			};

		default:
			return {};
	}
};
