import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.feedback_header).toBe('Feedback zur Karte');
		expect(map.feedback_could_not_save).toBe('Ihr Feedback konnte nicht gespeichert werden');
		expect(map.feedback_saved_successfully).toBe('Ihr Feedback wurde gespeichert');
		expect(map.feedback_markChangeNotice).toBe('Auf welche Stelle in der Karte bezieht sich ihr Feedback (bitte markieren)?');
		expect(map.feedback_categorySelection).toBe('Zu welcher Kategorie passt ihr Feedback am Besten (bitte wählen)?');
		expect(map.feedback_changeDescription).toBe('Ihre Nachricht');
		expect(map.feedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.feedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_pleaseSelect).toBe('Bitte digitalisieren Sie mindestens einen Punkt als Ortsangabe für ihre Meldung.');
		expect(map.feedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.feedback_header).toBe('Send Feedback');
		expect(map.feedback_could_not_save).toBe('Feedback could not be saved');
		expect(map.feedback_saved_successfully).toBe('Feedback was successfully submitted');
		expect(map.feedback_markChangeNotice).toBe('Edit the map');
		expect(map.feedback_categorySelection).toBe('Choose your category');
		expect(map.feedback_changeDescription).toBe('Your message');
		expect(map.feedback_eMail).toBe('eMail');
		expect(map.feedback_privacyPolicy).toBe('Privacy Policy');
		expect(map.feedback_pleaseSelect).toBe('Please draw at least one Point to mark the location of your feedback');
		expect(map.feedback_disclaimer).toBe(
			'In some cases, the LDBV cannot adopt your feedback. For questions relating to your feedback and to keep you informed about the work in progress we recommend submitting your email address as well.'
		);
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 10;
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
