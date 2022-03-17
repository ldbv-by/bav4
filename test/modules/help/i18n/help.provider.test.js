import { helpProvide } from '../../../../src/modules/help/i18n/help.provider';


describe('i18n for coordinate select', () => {

	it('provides translation for en', () => {

		const map = helpProvide('en');

		expect(map.help_button).toBe('Help');
		expect(map.help_notification_header).toBe('First steps');
		expect(map.help_notification_text).toBe('Need help recording?');
		expect(map.help_notification_close).toBe('No thanks');
		expect(map.help_notification_first_steps).toBe('First steps');
		expect(map.help_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('provides translation for de', () => {

		const map = helpProvide('de');

		expect(map.help_button).toBe('Hilfe');
		expect(map.help_notification_header).toBe('Erste Schritte');
		expect(map.help_notification_text).toBe('Sie brauchen Hilfe bei der Erfassung?');
		expect(map.help_notification_close).toBe('Nein Danke');
		expect(map.help_notification_first_steps).toBe('Erste Schritte');
		expect(map.help_link).toBe('https://github.com/ldbv-by/bav4-nomigration');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 6;
		const deMap = helpProvide('de');
		const enMap = helpProvide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {

		const map = helpProvide('unknown');

		expect(map).toEqual({});
	});

});
