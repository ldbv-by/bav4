import { provide } from '../../../../src/modules/timeTravel/i18n/timeTravel.provider';

describe('i18n for timetravel module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.timeTravel_title).toBe('Zeitreise');
		expect(map.timeTravel_slider_increase).toBe('nächstes Jahr');
		expect(map.timeTravel_slider_decrease).toBe('vorheriges Jahr');
		expect(map.timeTravel_slider_start).toBe('Start');
		expect(map.timeTravel_slider_stop).toBe('Stop');
		expect(map.timeTravel_slider_reset).toBe('Zurücksetzten');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.timeTravel_title).toBe('Time travel');
		expect(map.timeTravel_slider_increase).toBe('Increase year');
		expect(map.timeTravel_slider_decrease).toBe('Previous year');
		expect(map.timeTravel_slider_start).toBe('Start');
		expect(map.timeTravel_slider_stop).toBe('Stop');
		expect(map.timeTravel_slider_reset).toBe('Reset');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 6;
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
