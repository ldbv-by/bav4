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
				mapFeedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.',
				mapFeedback_geometry_missing: 'Please draw at least one Point to mark the location of your feedback',
				feedback_toggleFeedback_header: 'Choose Feedback Type',
				feedback_toggleFeedback_mapButton: 'Map - Feedback',
				feedback_toggleFeedback_mapButton_sub: 'Wrong address, missing place, road not shown correctly, etc.',
				feedback_toggleFeedback_generalButton: 'General - Feedback',
				feedback_toggleFeedback_generalButton_sub: 'Make suggestions for changes or improvements, or report errors.',
				mapFeedback_text_before: 'Please draw your change on the',
				mapFeedback_text_map: 'Map',
				mapFeedback_text_after: ' and fill in the fields. When the change is added to BayernAtlas, it will appear publicly.'
			};

		case 'de':
			return {
				mapFeedback_header: 'Feedback zur Karte',
				mapFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				mapFeedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				mapFeedback_markChangeNotice: 'Bitte markieren: Auf welche Stelle in der Karte bezieht sich ihr Feedback?',
				mapFeedback_categorySelection: 'Kategorie',
				mapFeedback_changeDescription: 'Ihre Nachricht',
				mapFeedback_eMail: 'Ihre E-Mail-Adresse',
				mapFeedback_privacyPolicy: 'Hinweis zum Datenschutz',
				mapFeedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.',
				mapFeedback_geometry_missing: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.',
				feedback_toggleFeedback_header: 'Feedback Typ',
				feedback_toggleFeedback_mapButton: 'Kartenfeedback',
				feedback_toggleFeedback_mapButton_sub: 'Falsche Adresse, fehlender Ort, nicht korrekt dargestellter Straßenverlauf usw.',
				feedback_toggleFeedback_generalButton: 'Allgemeiner Feedback',
				feedback_toggleFeedback_generalButton_sub: 'Machen Sie Änderungs- oder Verbesserungsvorschläge oder melden Sie Fehler.',
				mapFeedback_text_before: 'Bitte zeichnen Sie Ihrer Änderung in die',
				mapFeedback_text_map: 'Karte',
				mapFeedback_text_after: ' und füllen die Feldere aus. Wenn die Änderung im BayernAtlas ergänzt wird, erscheint sie öffentlich.'
			};

		default:
			return {};
	}
};
