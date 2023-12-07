import { provide } from '../../../../src/modules/chips/i18n/chips.provider';

describe('i18n for chips module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.chips_assist_chip_elevation_profile).toBe('Geländeprofil');
		expect(map.chips_assist_chip_export).toBe('Export');
		expect(map.chips_assist_chip_start_routing_here).toBe('Route planen');
		expect(map.chips_assist_chip_share_stored_data).toBe('Daten teilen');
		expect(map.chips_assist_chip_share_position_label).toBe('Position teilen');
		expect(map.chips_assist_chip_share_position_api_failed).toBe('Teilen der Position ist fehlgeschlagen');
		expect(map.chips_assist_chip_map_feedback_label).toBe('Karte verbessern');
		expect(map.chips_assist_chip_map_feedback_title).toBe('Feedback');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.chips_assist_chip_elevation_profile).toBe('Elevation Profile');
		expect(map.chips_assist_chip_export).toBe('Export');
		expect(map.chips_assist_chip_start_routing_here).toBe('Plan a route');
		expect(map.chips_assist_chip_share_stored_data).toBe('Share data');
		expect(map.chips_assist_chip_share_position_label).toBe('Share position');
		expect(map.chips_assist_chip_share_position_api_failed).toBe('Sharing the position has failed');
		expect(map.chips_assist_chip_map_feedback_label).toBe('Improve map');
		expect(map.chips_assist_chip_map_feedback_title).toBe('Feedback');
	});

	it('have the expected amount of translations', () => {
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
