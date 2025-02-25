import { provide } from '../../../../src/modules/chips/i18n/chips.provider';

describe('i18n for chips module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.chips_assist_chip_elevation_profile).toBe('Geländeprofil');
		expect(map.chips_assist_chip_export).toBe('Export');
		expect(map.chips_assist_chip_export_title).toBe('Vektordaten exportieren');
		expect(map.chips_assist_chip_start_routing_here).toBe('Route planen');
		expect(map.chips_assist_chip_start_routing_here_title).toBe('Route planen');
		expect(map.chips_assist_chip_share_stored_data).toBe('Daten teilen');
		expect(map.chips_assist_chip_share_stored_data_title).toBe('Daten mit anderen teilen');
		expect(map.chips_assist_chip_share_position_label).toBe('Position teilen');
		expect(map.chips_assist_chip_share_position_title).toBe('Position mit anderen teilen');
		expect(map.chips_assist_chip_share_position_api_failed).toBe('Teilen der Position ist fehlgeschlagen');
		expect(map.chips_assist_chip_share_state_label_default).toBe('Teilen');
		expect(map.chips_assist_chip_share_state_api_failed).toBe('Teilen der Seite ist fehlgeschlagen');
		expect(map.chips_assist_chip_map_feedback_label).toBe('Karte verbessern');
		expect(map.chips_assist_chip_map_feedback_title).toBe('Melden Sie uns Korrekturvorschläge zu den Karteninhalten');
		expect(map.chips_assist_chip_map_feedback_modal_title).toBe('Feedback');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.chips_assist_chip_elevation_profile).toBe('Elevation Profile');
		expect(map.chips_assist_chip_export).toBe('Export');
		expect(map.chips_assist_chip_export_title).toBe('Export vector data');
		expect(map.chips_assist_chip_start_routing_here).toBe('Plan a route');
		expect(map.chips_assist_chip_start_routing_here_title).toBe('Plan a route');
		expect(map.chips_assist_chip_share_stored_data).toBe('Share data');
		expect(map.chips_assist_chip_share_stored_data_title).toBe('Share the data with others');
		expect(map.chips_assist_chip_share_position_label).toBe('Share position');
		expect(map.chips_assist_chip_share_position_title).toBe('Share your position with others');
		expect(map.chips_assist_chip_share_position_api_failed).toBe('Sharing the position has failed');
		expect(map.chips_assist_chip_share_state_label_default).toBe('Share');
		expect(map.chips_assist_chip_share_state_api_failed).toBe('Sharing the website has failed');
		expect(map.chips_assist_chip_map_feedback_label).toBe('Improve map');
		expect(map.chips_assist_chip_map_feedback_title).toBe('Send us suggestions for corrections to the map content');
		expect(map.chips_assist_chip_map_feedback_modal_title).toBe('Feedback');
	});

	it('contains the expected amount of entries', () => {
		const expectedSize = 16;
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
