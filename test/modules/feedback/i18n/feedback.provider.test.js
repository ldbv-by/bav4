import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.feedback_mapFeedback_header).toBe('Feedback zur Karte');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.feedback_mapFeedback_saved_successfully).toBe('Ihr Feedback wurde gespeichert');
		expect(map.feedback_mapFeedback_categorySelection).toBe('Kategorie');
		expect(map.feedback_mapFeedback_categorySelection_helper).toBe('Bitte auswählen');
		expect(map.feedback_mapFeedback_changeDescription).toBe('Ihre Nachricht');
		expect(map.feedback_mapFeedback_changeDescription_helper).toBe('Pflichtfeld');
		expect(map.feedback_mapFeedback_changeDescription_error).toBe('Pflichtfeld');
		expect(map.feedback_mapFeedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.feedback_mapFeedback_eMail_helper).toBe('Optional');
		expect(map.feedback_mapFeedback_eMail_error).toBe('Keine gültige E-Mail-Aderesse');
		expect(map.feedback_mapFeedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_mapFeedback_text_before).toBe('Bitte zeichnen Sie Ihrer Änderung in die');
		expect(map.feedback_mapFeedback_text_map).toBe('Karte');
		expect(map.feedback_mapFeedback_text_after).toBe(
			' und füllen die Feldere aus. Wenn die Änderung im BayernAtlas ergänzt wird, erscheint sie öffentlich.'
		);
		expect(map.feedback_mapFeedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.');
		expect(map.feedback_mapFeedback_submit).toBe('Senden');

		expect(map.feedback_toggleFeedback_mapButton).toBe('Kartenfeedback');
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Falsche Adresse, fehlender Ort, nicht korrekt dargestellter Straßenverlauf usw.');
		expect(map.feedback_toggleFeedback_generalButton).toBe('Allgemeiner Feedback');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe('Machen Sie Änderungs- oder Verbesserungsvorschläge oder melden Sie Fehler.');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.feedback_mapFeedback_header).toBe('Send Feedback');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Your feedback could not be saved');
		expect(map.feedback_mapFeedback_saved_successfully).toBe('Your feedback was successfully submitted');
		expect(map.feedback_mapFeedback_categorySelection).toBe('Category');
		expect(map.feedback_mapFeedback_categorySelection_helper).toBe('Please choose');
		expect(map.feedback_mapFeedback_changeDescription).toBe('Your message');
		expect(map.feedback_mapFeedback_changeDescription_helper).toBe('Required field');
		expect(map.feedback_mapFeedback_changeDescription_error).toBe('Required field');
		expect(map.feedback_mapFeedback_eMail).toBe('Your email address');
		expect(map.feedback_mapFeedback_eMail_helper).toBe('Optional');
		expect(map.feedback_mapFeedback_eMail_error).toBe('No valid e-mail address');
		expect(map.feedback_mapFeedback_privacyPolicy).toBe('Privacy Policy');
		expect(map.feedback_mapFeedback_text_before).toBe('Please draw your change on the');
		expect(map.feedback_mapFeedback_text_map).toBe('Map');
		expect(map.feedback_mapFeedback_text_after).toBe(' and fill in the fields. When the change is added to BayernAtlas, it will appear publicly.');
		expect(map.feedback_mapFeedback_disclaimer).toBe(
			'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
		);
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Please draw at least one Point to mark the location of your feedback');
		expect(map.feedback_mapFeedback_submit).toBe('Submit');
		expect(map.feedback_toggleFeedback_mapButton).toBe('Map - Feedback');
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Wrong address, missing place, road not shown correctly, etc.');
		expect(map.feedback_toggleFeedback_generalButton).toBe('General - Feedback');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe('Make suggestions for changes or improvements, or report errors.');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 22;
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
