import { provide } from '../../../../src/modules/timeTravel/i18n/timeTravel.provider';

describe('i18n for timetravel module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.timeTravel_title).toBe('Zeitreise');
		expect(map.timeTravel_data).toBe('Daten');
		expect(map.timeTravel_increase).toBe('nächstes Jahr');
		expect(map.timeTravel_decrease).toBe('vorheriges Jahr');
		expect(map.timeTravel_start).toBe('Start');
		expect(map.timeTravel_stop).toBe('Stop');
		expect(map.timeTravel_reset).toBe('Zurücksetzten');
		expect(map.timeTravel_map_series).toBe('map series');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.timeTravel_title).toBe('time travel');
		expect(map.timeTravel_data).toBe('data');
		expect(map.timeTravel_increase).toBe('increase year');
		expect(map.timeTravel_decrease).toBe('previous year');
		expect(map.timeTravel_start).toBe('start');
		expect(map.timeTravel_stop).toBe('stop');
		expect(map.timeTravel_reset).toBe('reset');
		expect(map.timeTravel_map_series).toBe('Kartenwerk');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 8;
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
