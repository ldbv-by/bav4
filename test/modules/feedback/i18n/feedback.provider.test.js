import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.feedback_categorySelection).toBe('Kategorie');
		expect(map.feedback_categorySelection_helper).toBe('Bitte auswählen,');
		expect(map.feedback_categorySelection_error).toBe('Pflichtfeld');
		expect(map.feedback_changeDescription).toBe('Ihre Nachricht');
		expect(map.feedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
		expect(map.feedback_eMail_error).toBe('Keine gültige E-Mail-Adresse');
		expect(map.feedback_eMail_helper).toBe('Optional');
		expect(map.feedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.feedback_required_field_error).toBe('Pflichtfeld');
		expect(map.feedback_required_field_helper).toBe('Pflichtfeld');
		expect(map.feedback_saved_successfully).toBe('Ihr Feedback wurde gespeichert');
		expect(map.feedback_submit).toBe('Senden');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe(
			'Machen Sie Änderungs- oder Verbesserungsvorschläge oder teilen Sie uns Ihre Meinung mit.'
		);
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Melden Sie uns Korrekturvorschläge zu den Karteninhalten.');
		expect(map.feedback_generalFeedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.feedback_generalFeedback_rating).toBe('Würden Sie den BayernAtlas weiterempfehlen?');
		expect(map.feedback_generalFeedback_rating_scale_0).toBe('Sehr wahrscheinlich');
		expect(map.feedback_generalFeedback_rating_scale_5).toBe('Sehr unwahrscheinlich');
		expect(map.feedback_generalFeedback).toBe('Allgemeines Feedback');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.');
		expect(map.feedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_mapFeedback_text_after).toBe(
			' und füllen das Formular aus. Ihre Meldung wird zeitnah öffentlich im Feedback-Fenster angezeigt.'
		);
		expect(map.feedback_mapFeedback_text_before).toBe('Markieren Sie bitte die Stelle, an der Sie einen Korrekturvorschlag machen möchten, in der');
		expect(map.feedback_mapFeedback_text_map).toBe('Karte');
		expect(map.feedback_mapFeedback).toBe('Feedback zur Karte');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.feedback_categorySelection).toBe('Category');
		expect(map.feedback_categorySelection_helper).toBe('Please choose,');
		expect(map.feedback_categorySelection_error).toBe('required field');
		expect(map.feedback_changeDescription).toBe('Your message');
		expect(map.feedback_disclaimer).toBe(
			'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
		);
		expect(map.feedback_eMail_error).toBe('No valid e-mail address');
		expect(map.feedback_eMail_helper).toBe('Optional');
		expect(map.feedback_eMail).toBe('Your email address');
		expect(map.feedback_required_field_error).toBe('Required field');
		expect(map.feedback_required_field_helper).toBe('Required field');
		expect(map.feedback_saved_successfully).toBe('Your feedback was successfully submitted');
		expect(map.feedback_submit).toBe('Submit');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe('Make suggestions for changes or improvements, or report errors.');
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Send us suggestions for corrections to the map content.');
		expect(map.feedback_generalFeedback_could_not_save).toBe('Your feedback could not be saved');
		expect(map.feedback_generalFeedback_rating).toBe('Would you recommend the BayernAtlas?');
		expect(map.feedback_generalFeedback_rating_scale_0).toBe('Very unlikely');
		expect(map.feedback_generalFeedback_rating_scale_5).toBe('Very likely');
		expect(map.feedback_generalFeedback).toBe('General - Feedback');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Your feedback could not be saved');
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Please draw at least one Point to mark the location of your feedback');
		expect(map.feedback_privacyPolicy).toBe('Privacy Policy');
		expect(map.feedback_mapFeedback_text_after).toBe(
			' and fill out the form. Your message will be displayed publicly in the feedback window in a timely manner.'
		);
		expect(map.feedback_mapFeedback_text_before).toBe('Please mark the place where you would like to make a correction suggestion in the');
		expect(map.feedback_mapFeedback_text_map).toBe('map');
		expect(map.feedback_mapFeedback).toBe('Map - Feedback');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 26;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
