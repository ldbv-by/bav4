export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				feedback_changeDescription: 'Your message',
				feedback_eMail_error: 'No valid e-mail address',
				feedback_eMail_helper: 'Optional',
				feedback_eMail: 'Your email address',
				feedback_required_field_error: 'Required field',
				feedback_required_field_helper: 'Required field',
				feedback_saved_successfully: 'Your feedback was successfully submitted',
				feedback_submit: 'Submit',
				feedback_toggleFeedback_generalButton_sub: 'Make suggestions for changes or improvements, or report errors.',
				feedback_toggleFeedback_mapButton_sub: 'Give us feedback about a wrong address, a missing place or a road not shown correctly, etc.',
				feedback_generalFeedback_could_not_save: 'Your feedback could not be saved',
				feedback_generalFeedback_rating: 'Your Vote',
				feedback_generalFeedback: 'General - Feedback',
				feedback_mapFeedback_categorySelection_helper: 'Please choose',
				feedback_mapFeedback_categorySelection: 'Category',
				feedback_mapFeedback_could_not_save: 'Your feedback could not be saved',
				feedback_mapFeedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.',
				feedback_mapFeedback_geometry_missing: 'Please draw at least one Point to mark the location of your feedback',
				feedback_mapFeedback_privacyPolicy: 'Privacy Policy',
				feedback_mapFeedback_text_after: ' and fill in the fields. When the change is added to BayernAtlas, it will appear publicly.',
				feedback_mapFeedback_text_before: 'Please draw your change on the',
				feedback_mapFeedback_text_map: 'Map',
				feedback_mapFeedback: 'Map - Feedback'
			};

		case 'de':
			return {
				feedback_changeDescription: 'Ihre Nachricht',
				feedback_eMail_error: 'Keine gültige E-Mail-Adresse',
				feedback_eMail_helper: 'Optional',
				feedback_eMail: 'Ihre E-Mail-Adresse',
				feedback_required_field_error: 'Pflichtfeld',
				feedback_required_field_helper: 'Pflichtfeld',
				feedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				feedback_submit: 'Senden',
				feedback_toggleFeedback_generalButton_sub: 'Machen Sie Änderungs- oder Verbesserungsvorschläge oder teilen Sie uns Ihre Meinug mit.',
				feedback_toggleFeedback_mapButton_sub:
					'Melden Sie uns eine falsche Adresse, einen fehlenden Ort, einen nicht korrekt dargestellten Straßenverlauf usw.',
				feedback_generalFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_generalFeedback_rating: 'Ihre Bewertung',
				feedback_generalFeedback: 'Allgemeines Feedback',
				feedback_mapFeedback_categorySelection_helper: 'Bitte auswählen',
				feedback_mapFeedback_categorySelection: 'Kategorie',
				feedback_mapFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_mapFeedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.',
				feedback_mapFeedback_geometry_missing: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.',
				feedback_mapFeedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_mapFeedback_text_after: ' und füllen die Felder aus. Wenn die Änderung im BayernAtlas ergänzt wird, erscheint sie öffentlich.',
				feedback_mapFeedback_text_before: 'Bitte zeichnen Sie Ihrer Änderung in die',
				feedback_mapFeedback_text_map: 'Karte',
				feedback_mapFeedback: 'Feedback zur Karte'
			};

		default:
			return {};
	}
};
