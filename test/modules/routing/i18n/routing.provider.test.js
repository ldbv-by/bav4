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
		expect(map.routing_category_label_bvv_hike).toBe('Wandern');
		expect(map.routing_category_label_bvv_bike).toBe('Fahrrad');
		expect(map.routing_category_label_bvv_mtb).toBe('Mountainbike');
		expect(map.routing_category_label_racingbike).toBe('Rennrad');
		expect(map.routing_waypoints_start).toBe('Start');
		expect(map.routing_waypoints_waypoint).toBe('Wegpunkt');
		expect(map.routing_waypoints_destination).toBe('Ziel');
		expect(map.routing_waypoints_as_start).toBe('als Start verwenden...');
		expect(map.routing_waypoints_as_destination).toBe('als Ziel verwenden...');
		expect(map.routing_waypoints_title).toBe('Wegpunkte');
		expect(map.routing_waypoints_remove_all).toBe('Alle entfernen');
		expect(map.routing_waypoints_reverse).toBe('Reihenfolge umkehren');
		expect(map.routing_waypoint_move_down).toBe('nach hinten');
		expect(map.routing_waypoint_move_up).toBe('nach vorne');
		expect(map.routing_waypoint_move_remove).toBe('entfernen');
		expect(map.routing_warnings_title).toBe('Hinweise zur Route');
		expect(map.routing_warnings_zoom).toBe('Zu den Segmenten zoomen');
		expect(map.routing_details_surface).toBe('Oberfläche');
		expect(map.routing_details_road_type).toBe('Weg-Typ');
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
		expect(map.routing_category_label_bvv_hike).toBe('Hiking');
		expect(map.routing_category_label_bvv_bike).toBe('Bike');
		expect(map.routing_category_label_bvv_mtb).toBe('Mountainbike');
		expect(map.routing_category_label_racingbike).toBe('Racingbike');
		expect(map.routing_waypoints_start).toBe('Start');
		expect(map.routing_waypoints_waypoint).toBe('Waypoint');
		expect(map.routing_waypoints_destination).toBe('Destination');
		expect(map.routing_waypoints_as_start).toBe('use as start...');
		expect(map.routing_waypoints_as_destination).toBe('use as destination...');
		expect(map.routing_waypoints_title).toBe('Waypoints');
		expect(map.routing_waypoints_remove_all).toBe('Remove all');
		expect(map.routing_waypoints_reverse).toBe('Reverse');
		expect(map.routing_waypoint_move_down).toBe('move forward');
		expect(map.routing_waypoint_move_up).toBe('move backward');
		expect(map.routing_waypoint_move_remove).toBe('remove');
		expect(map.routing_warnings_title).toBe('Route notes');
		expect(map.routing_warnings_zoom).toBe('Zoom to segments');
		expect(map.routing_details_surface).toBe('Surface');
		expect(map.routing_details_road_type).toBe('Road type');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 26;
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
