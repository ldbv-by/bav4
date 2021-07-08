import { provide } from '../../../../src/modules/notifications/i18n/notifications.provider';


describe('i18n for search module', () => {

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.notifications_item_close).toBe('Schliessen');		
	});

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.notifications_item_close).toBe('Close');		
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 1;
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