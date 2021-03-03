import { provide } from '../../../../src/modules/map/i18n/store.provider';


describe('i18n for store', () => {

	it('provides translation for en', () => {

		const map = provide('en');
		
		expect(map.map_store_geolocation_denied).toBe('The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.');		
	});


	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_store_geolocation_denied).toBe('Es ist keine Positionsbestimmung möglich, da ihre Browsereinstellungen dies nicht zulassen. Erlauben sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.');		
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