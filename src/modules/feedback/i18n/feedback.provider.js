export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				feedback_categorySelection: 'Category',
				feedback_categorySelection_helper: 'Please choose,',
				feedback_categorySelection_error: 'required field',
				feedback_changeDescription: 'Your message',
				feedback_disclaimer:
					'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.',
				feedback_eMail_error: 'No valid e-mail address',
				feedback_eMail_helper: 'Optional',
				feedback_eMail: 'Your email address',
				feedback_privacyPolicy: 'Privacy Policy',
				feedback_required_field_error: 'Required field',
				feedback_required_field_helper: 'Required field',
				feedback_saved_successfully: 'Your feedback was successfully submitted',
				feedback_submit: 'Submit',
				feedback_toggleFeedback_generalButton_sub: 'Make suggestions for changes or improvements, or report errors.',
				feedback_toggleFeedback_mapButton_sub: 'Send us suggestions for corrections to the map content.',
				feedback_generalFeedback_could_not_save: 'Your feedback could not be saved',
				feedback_generalFeedback_rating: 'Would you recommend the BayernAtlas?',
				feedback_generalFeedback_rating_scale_0: 'Very unlikely',
				feedback_generalFeedback_rating_scale_5: 'Very likely',
				feedback_generalFeedback: 'General - Feedback',
				feedback_mapFeedback_could_not_save: 'Your feedback could not be saved',
				feedback_mapFeedback_geometry_missing: 'Please draw at least one Point to mark the location of your feedback',
				feedback_mapFeedback_text_after: ' and fill out the form. Your message will be displayed publicly in the feedback window in a timely manner.',
				feedback_mapFeedback_text_before: 'Please mark the place where you would like to make a correction suggestion in the',
				feedback_mapFeedback_text_map: 'map',
				feedback_mapFeedback: 'Map - Feedback'
			};

		case 'de':
			return {
				feedback_categorySelection: 'Kategorie',
				feedback_categorySelection_helper: 'Bitte auswählen,',
				feedback_categorySelection_error: 'Pflichtfeld',
				feedback_changeDescription: 'Ihre Nachricht',
				feedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.',
				feedback_eMail_error: 'Keine gültige E-Mail-Adresse',
				feedback_eMail_helper: 'Optional',
				feedback_eMail: 'Ihre E-Mail-Adresse',
				feedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_required_field_error: 'Pflichtfeld',
				feedback_required_field_helper: 'Pflichtfeld',
				feedback_saved_successfully: 'Ihr Feedback wurde gespeichert',
				feedback_submit: 'Senden',
				feedback_toggleFeedback_generalButton_sub: 'Machen Sie Änderungs- oder Verbesserungsvorschläge oder teilen Sie uns Ihre Meinung mit.',
				feedback_toggleFeedback_mapButton_sub: 'Melden Sie uns Korrekturvorschläge zu den Karteninhalten.',
				feedback_generalFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_generalFeedback_rating: 'Würden Sie den BayernAtlas weiterempfehlen?',
				feedback_generalFeedback_rating_scale_0: 'Sehr wahrscheinlich',
				feedback_generalFeedback_rating_scale_5: 'Sehr unwahrscheinlich',
				feedback_generalFeedback: 'Allgemeines Feedback',
				feedback_mapFeedback_could_not_save: 'Ihr Feedback konnte nicht gespeichert werden',
				feedback_mapFeedback_geometry_missing: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für Ihre Meldung.',
				feedback_mapFeedback_text_after: ' und füllen das Formular aus. Ihre Meldung wird zeitnah öffentlich im Feedback-Fenster angezeigt.',
				feedback_mapFeedback_text_before: 'Markieren Sie bitte die Stelle, an der Sie einen Korrekturvorschlag machen möchten, in der',
				feedback_mapFeedback_text_map: 'Karte',
				feedback_mapFeedback: 'Feedback zur Karte'
			};

		default:
			return {};
	}
};
