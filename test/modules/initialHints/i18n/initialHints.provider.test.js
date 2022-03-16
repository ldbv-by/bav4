import { initialHintsProvide } from '../../../../src/modules/initialHints/i18n/initialHints.provider';


describe('i18n for coordinate select', () => {

	it('provides translation for en', () => {

		const map = initialHintsProvide('en');

		expect(map.initialHints_button).toBe('Survey');
		expect(map.initialHints_notification_header).toBe('Survey');
		expect(map.initialHints_notification_text).toBe('What functions would you like to see in the new BayernAtlas');
		expect(map.initialHints_notification_close).toBe('No thanks');
		expect(map.initialHints_notification_open).toBe('Sure');
		expect(map.initialHints_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('provides translation for de', () => {

		const map = initialHintsProvide('de');

		expect(map.initialHints_button).toBe('Umfrage');
		expect(map.initialHints_notification_header).toBe('Umfrage');
		expect(map.initialHints_notification_text).toBe('Welche Funktionen wünschen Sie sich für den neuen BayernAtlas?');
		expect(map.initialHints_notification_close).toBe('Nein Danke');
		expect(map.initialHints_notification_open).toBe('Mitmachen');
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
