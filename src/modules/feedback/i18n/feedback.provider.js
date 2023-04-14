export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				feedback_header: 'Map Feedback',
				feedback_markChangeNotice: 'Markierung Ihrer Änderungsmeldung',
				feedback_categorySelection: 'Auswahl der Kategorie',
				feedback_changeDescription: 'Beschreibung der Änderung',
				feedback_eMail: 'eMail',
				feedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_pleaseSelect: 'Please select at least one Point',
				feedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
			};

		case 'de':
			return {
				feedback_header: 'Feedback zur Karte',
				feedback_markChangeNotice: 'Markierung Ihrer Änderungsmeldung',
				feedback_categorySelection: 'Auswahl der Kategorie',
				feedback_changeDescription: 'Beschreibung der Änderung',
				feedback_eMail: 'Ihre E-Mail-Adresse',
				feedback_privacyPolicy: 'Hinweis zum Datenschutz',
				feedback_pleaseSelect: 'Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung. ',
				feedback_disclaimer:
					'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
			};

		default:
			return {};
	}
};
