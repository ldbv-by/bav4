import { provide } from '../../../../src/modules/stackables/i18n/notifications.provider';

describe('i18n for search module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.notifications_item_info).toBe('Info');
		expect(map.notifications_item_warn).toBe('Warnung');
		expect(map.notifications_item_error).toBe('Fehler');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.notifications_item_info).toBe('Info');
		expect(map.notifications_item_warn).toBe('Warning');
		expect(map.notifications_item_error).toBe('Error');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 3;
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
