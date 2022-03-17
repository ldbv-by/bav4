import { initialHintsProvide } from '../../../../src/modules/initialHints/i18n/initialHints.provider';


describe('i18n for coordinate select', () => {

	it('provides translation for en', () => {

		const map = initialHintsProvide('en');

		expect(map.initialHints_button).toBe('Help');
		expect(map.initialHints_notification_header).toBe('First steps');
		expect(map.initialHints_notification_text).toBe('Need help recording?');
		expect(map.initialHints_notification_close).toBe('No thanks');
		expect(map.initialHints_notification_first_steps).toBe('First steps');
		expect(map.initialHints_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('provides translation for de', () => {

		const map = initialHintsProvide('de');

		expect(map.initialHints_button).toBe('Hilfe');
		expect(map.initialHints_notification_header).toBe('Erste Schritte');
		expect(map.initialHints_notification_text).toBe('Sie brauchen Hilfe bei der Erfassung?');
		expect(map.initialHints_notification_close).toBe('Nein Danke');
		expect(map.initialHints_notification_first_steps).toBe('Erste Schritte');
		expect(map.initialHints_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 6;
		const deMap = initialHintsProvide('de');
		const enMap = initialHintsProvide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = initialHintsProvide('unknown');

		expect(map).toEqual({});
	});

});
