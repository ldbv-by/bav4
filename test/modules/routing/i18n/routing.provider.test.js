import { provide } from '../../../../src/modules/routing/i18n/routing.provider';

describe('i18n for feedback module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.routing_feedback_400).toBe('Anhand der angegebenen Punkte konnte keine Route erstellt werden');
		expect(map.routing_feedback_500).toBe('Aufgrund eines technischen Fehlers konnte keine Route erstellt werden');
		expect(map.routing_feedback_900).toBe('<b>Start</b> bzw. <b>Ziel</b> durch Klicken in die Karte angeben');
		expect(map.routing_info_duration).toBe('Dauer');
		expect(map.routing_info_distance).toBe('Distanz');
		expect(map.routing_info_uphill).toBe('Bergauf');
		expect(map.routing_info_downhill).toBe('Bergab');
		expect(map.routing_category_label_hike).toBe('Wandern');
		expect(map.routing_category_label_bayernnetz_bike).toBe('Mountainbike (Bayernnetz)');
		expect(map.routing_category_label_bike).toBe('Fahrrad');
		expect(map.routing_category_label_mtb).toBe('Mountainbike');
		expect(map.routing_category_label_racebike).toBe('Rennrad');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.routing_feedback_400).toBe('No route could be created based on the given points');
		expect(map.routing_feedback_500).toBe('Due to a technical error no route could be created');
		expect(map.routing_feedback_900).toBe('Specify <b>start</b> or <b>destination</b> by clicking in the map');
		expect(map.routing_info_duration).toBe('Duration');
		expect(map.routing_info_distance).toBe('Distance');
		expect(map.routing_info_uphill).toBe('Uphill');
		expect(map.routing_info_downhill).toBe('Downhill');
		expect(map.routing_category_label_hike).toBe('Hiking');
		expect(map.routing_category_label_bayernnetz_bike).toBe('Mountainbike (Bayernnetz)');
		expect(map.routing_category_label_bike).toBe('Bike');
		expect(map.routing_category_label_mtb).toBe('Mountainbike');
		expect(map.routing_category_label_racebike).toBe('Racebike');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 12;
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
