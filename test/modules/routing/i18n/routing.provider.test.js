import { provide } from '../../../../src/modules/routing/i18n/routing.provider';

describe('i18n for dynamically loaded parts of the routing module', () => {
	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.routing_feedback_900).toBe('<b>Start</b> bzw. <b>Ziel</b> durch Klicken in die Karte angeben');
		expect(map.routing_feedback_901).toBe('<b>Ziel</b> durch Klicken in die Karte angeben');
		expect(map.routing_feedback_902).toBe('<b>Start</b> durch Klicken in die Karte angeben');
		expect(map.routing_info_duration).toBe('Dauer');
		expect(map.routing_info_distance).toBe('Distanz');
		expect(map.routing_info_uphill).toBe('Bergauf');
		expect(map.routing_info_downhill).toBe('Bergab');
		expect(map.routing_waypoints_start).toBe('Start');
		expect(map.routing_waypoints_waypoint).toBe('WP');
		expect(map.routing_waypoints_destination).toBe('Ziel');
		expect(map.routing_waypoints_as_start).toBe('Start');
		expect(map.routing_waypoints_as_destination).toBe('Ziel');
		expect(map.routing_waypoints_title).toBe('Wegpunkte');
		expect(map.routing_waypoints_remove_all).toBe('Alle entfernen');
		expect(map.routing_waypoints_reverse).toBe('Reihenfolge umkehren');
		expect(map.routing_waypoints_hide).toBe('Wegpunkte verbergen');
		expect(map.routing_waypoint_move_down).toBe('nach hinten');
		expect(map.routing_waypoint_move_up).toBe('nach vorne');
		expect(map.routing_waypoint_remove).toBe('entfernen');
		expect(map.routing_warnings_title).toBe('Hinweise zur Route');
		expect(map.routing_warnings_zoom).toBe('Zu den Segmenten zoomen');
		expect(map.routing_details_surface).toBe('Oberfläche');
		expect(map.routing_details_road_type).toBe('Weg-Typ');
	});

	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.routing_feedback_900).toBe('Specify <b>start</b> or <b>destination</b> by clicking in the map');
		expect(map.routing_feedback_901).toBe('Specify <b>destination</b> by clicking in the map');
		expect(map.routing_feedback_902).toBe('Specify <b>start</b> by clicking in the map');
		expect(map.routing_info_duration).toBe('Duration');
		expect(map.routing_info_distance).toBe('Distance');
		expect(map.routing_info_uphill).toBe('Uphill');
		expect(map.routing_info_downhill).toBe('Downhill');
		expect(map.routing_waypoints_start).toBe('Start');
		expect(map.routing_waypoints_waypoint).toBe('WP');
		expect(map.routing_waypoints_destination).toBe('Destination');
		expect(map.routing_waypoints_as_start).toBe('start');
		expect(map.routing_waypoints_as_destination).toBe('destination');
		expect(map.routing_waypoints_title).toBe('Waypoints');
		expect(map.routing_waypoints_remove_all).toBe('Remove all');
		expect(map.routing_waypoints_reverse).toBe('Reverse');
		expect(map.routing_waypoints_hide).toBe('Hide waypoints');
		expect(map.routing_waypoint_move_down).toBe('move forward');
		expect(map.routing_waypoint_move_up).toBe('move backward');
		expect(map.routing_waypoint_remove).toBe('remove');
		expect(map.routing_warnings_title).toBe('Route notes');
		expect(map.routing_warnings_zoom).toBe('Zoom to segments');
		expect(map.routing_details_surface).toBe('Surface');
		expect(map.routing_details_road_type).toBe('Road type');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 28;
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
