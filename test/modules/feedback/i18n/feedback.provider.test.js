import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.feedback_mapFeedback_header).toBe('Feedback zur Karte');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.feedback_mapFeedback_saved_successfully).toBe('Ihr Feedback wurde gespeichert');
		expect(map.feedback_mapFeedback_categorySelection).toBe('Bitte wählen: Zu welcher Kategorie passt ihr Feedback an Besten?');
		expect(map.feedback_mapFeedback_changeDescription).toBe('Ihre Nachricht');
		expect(map.feedback_mapFeedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.feedback_mapFeedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_mapFeedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.');

		expect(map.feedback_toggleFeedback_header).toBe('Feedback Typ');
		expect(map.feedback_toggleFeedback_mapButton).toBe('Kartenfeedback');
		expect(map.feedback_toggleFeedback_generalButton).toBe('Allgemeiner Feedback');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.feedback_mapFeedback_header).toBe('Send Feedback');
		expect(map.feedback_mapFeedback_could_not_save).toBe('Your feedback could not be saved');
		expect(map.feedback_mapFeedback_saved_successfully).toBe('Your feedback was successfully submitted');
		expect(map.feedback_mapFeedback_categorySelection).toBe('Please choose your category');
		expect(map.feedback_mapFeedback_changeDescription).toBe('Your message');
		expect(map.feedback_mapFeedback_eMail).toBe('Your email address');
		expect(map.feedback_mapFeedback_privacyPolicy).toBe('Privacy Policy');
		expect(map.feedback_mapFeedback_disclaimer).toBe(
			'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
		);
		expect(map.feedback_mapFeedback_geometry_missing).toBe('Please draw at least one Point to mark the location of your feedback');

		expect(map.feedback_toggleFeedback_header).toBe('Choose Feedback Type');
		expect(map.feedback_toggleFeedback_mapButton).toBe('Map - Feedpack');
		expect(map.feedback_toggleFeedback_generalButton).toBe('General - Feedpack');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 12;
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
