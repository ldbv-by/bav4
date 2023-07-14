import { provide } from '../../../../src/modules/map/i18n/assistChips.provider';

describe('i18n for map assistChips', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.map_assistChips_share_position_label).toBe('Share position');
		expect(map.map_assistChips_share_position_api_failed).toBe('Sharing the position has failed');
		expect(map.map_assistChips_map_feedback_label).toBe('Improve map');
		expect(map.map_assistChips_map_feedback_title).toBe('Feedback');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.map_assistChips_share_position_label).toBe('Position teilen');
		expect(map.map_assistChips_share_position_api_failed).toBe('Teilen der Position ist fehlgeschlagen');
		expect(map.map_assistChips_map_feedback_label).toBe('Karte verbessern');
		expect(map.map_assistChips_map_feedback_title).toBe('Feedback');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 4;
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
