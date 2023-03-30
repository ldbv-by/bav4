import { provide } from '../../../../src/modules/feedback/i18n/feedback.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.feedback_header).toBe('Feedback zur Karte');
		expect(map.feedback_markChangeNotice).toBe('Markierung Ihrer Änderungsmeldung');
		expect(map.feedback_categorySelection).toBe('Auswahl der Kategorie');
		expect(map.feedback_changeDescription).toBe('Beschreibung der Änderung');
		expect(map.feedback_eMail).toBe('Ihre E-Mail-Adresse');
		expect(map.feedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.feedback_header).toBe('Map Feedback');
		expect(map.feedback_markChangeNotice).toBe('Markierung Ihrer Änderungsmeldung');
		expect(map.feedback_categorySelection).toBe('Auswahl der Kategorie');
		expect(map.feedback_changeDescription).toBe('Beschreibung der Änderung');
		expect(map.feedback_eMail).toBe('eMail');
		expect(map.feedback_privacyPolicy).toBe('Hinweis zum Datenschutz');
		expect(map.feedback_disclaimer).toBe(
			'Das LDBV behält sich grundsätzlich vor, Meldungen nicht zu übernehmen. Für evtl. Rückfragen, sowie zur Information über die weitere Bearbeitung, empfehlen wir die Angabe Ihrer E-Mail-Adresse.'
		);
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 7;
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
