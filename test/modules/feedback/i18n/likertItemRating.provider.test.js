import { provide } from '../../../../src/modules/feedback/i18n/likertItemRating.provider';

describe('i18n for starsRatingPanel', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.fiveButtonRating_very_unlikely).toBe('Sehr unwahrscheinlich');
		expect(map.fiveButtonRating_unlikely).toBe('Unwahrscheinlich');
		expect(map.fiveButtonRating_neutral).toBe('Neutral');
		expect(map.fiveButtonRating_likely).toBe('Wahrscheinlich');
		expect(map.fiveButtonRating_very_likely).toBe('Sehr wahrscheinlich');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.fiveButtonRating_very_unlikely).toBe('Very unlikely');
		expect(map.fiveButtonRating_unlikely).toBe('Unlikely');
		expect(map.fiveButtonRating_neutral).toBe('Neutral');
		expect(map.fiveButtonRating_likely).toBe('Likely');
		expect(map.fiveButtonRating_very_likely).toBe('Very likely');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 5;
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
