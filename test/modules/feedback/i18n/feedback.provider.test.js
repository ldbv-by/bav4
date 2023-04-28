import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.mapFeedback_header).toBe('Feedback zur Karte');
		expect(map.mapFeedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.mapFeedback_saved_successfully).toBe('Ihr Feedback wurde gespeichert');
		expect(map.mapFeedback_markChangeNotice).toBe('Bitte markieren: Auf welche Stelle in der Karte bezieht sich ihr Feedback?');
		expect(map.mapFeedback_categorySelection).toBe('Kategorie');
		expect(map.mapFeedback_changeDescription).toBe('Ihre Nachricht');
		expect(map.mapFeedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.mapFeedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.mapFeedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
		expect(map.mapFeedback_geometry_missing).toBe('Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.');

		expect(map.feedback_toggleFeedback_header).toBe('Feedback Typ');
		expect(map.feedback_toggleFeedback_mapButton).toBe('Kartenfeedback');
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Falsche Adresse, fehlender Ort, nicht korrekt dargestellter Straßenverlauf usw.');
		expect(map.feedback_toggleFeedback_generalButton).toBe('Allgemeiner Feedback');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe('Machen Sie Änderungs- oder Verbesserungsvorschläge oder melden Sie Fehler.');
		expect(map.mapFeedback_text_before).toBe('Bitte zeichnen Sie Ihrer Änderung in die');
		expect(map.mapFeedback_text_map).toBe('Karte');
		expect(map.mapFeedback_text_after).toBe(' und füllen die Feldere aus. Wenn die Änderung im BayernAtlas ergänzt wird, erscheint sie öffentlich.');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.mapFeedback_header).toBe('Send Feedback');
		expect(map.mapFeedback_could_not_save).toBe('Your feedback could not be saved');
		expect(map.mapFeedback_saved_successfully).toBe('Your feedback was successfully submitted');
		expect(map.mapFeedback_markChangeNotice).toBe('Edit the map');
		expect(map.mapFeedback_categorySelection).toBe('Please choose your category');
		expect(map.mapFeedback_changeDescription).toBe('Your message');
		expect(map.mapFeedback_eMail).toBe('Your email address');
		expect(map.mapFeedback_privacyPolicy).toBe('Privacy Policy');
		expect(map.mapFeedback_disclaimer).toBe(
			'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
		);
		expect(map.mapFeedback_geometry_missing).toBe('Please draw at least one Point to mark the location of your feedback');

		expect(map.feedback_toggleFeedback_header).toBe('Choose Feedback Type');
		expect(map.feedback_toggleFeedback_mapButton).toBe('Map - Feedback');
		expect(map.feedback_toggleFeedback_mapButton_sub).toBe('Wrong address, missing place, road not shown correctly, etc.');
		expect(map.feedback_toggleFeedback_generalButton).toBe('General - Feedback');
		expect(map.feedback_toggleFeedback_generalButton_sub).toBe('Make suggestions for changes or improvements, or report errors.');
		expect(map.mapFeedback_text_before).toBe('Please draw your change on the');
		expect(map.mapFeedback_text_map).toBe('Map');
		expect(map.mapFeedback_text_after).toBe(' and fill in the fields. When the change is added to BayernAtlas, it will appear publicly.');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 18;
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
