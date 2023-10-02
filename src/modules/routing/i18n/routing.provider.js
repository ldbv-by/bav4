export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_feedback_400: 'No route could be created based on the given points',
				routing_feedback_500: 'Due to a technical error no route could be created',
				routing_feedback_900: 'Specify <b>start</b> or <b>destination</b> by clicking in the map',
				routing_info_duration: 'Duration',
				routing_info_distance: 'Distance',
				routing_info_uphill: 'Uphill',
				routing_info_downhill: 'Downhill',
				routing_category_label_bvv_hike: 'Hiking',
				routing_category_label_bvv_bike: 'Bike',
				routing_category_label_bvv_mtb: 'Mountainbike',
				routing_category_label_racingbike: 'Racingbike',
				routing_waypoints_start: 'Start',
				routing_waypoints_waypoint: 'Waypoint',
				routing_waypoints_destination: 'Destination',
				routing_waypoints_as_start: 'use as start...',
				routing_waypoints_as_destination: 'use as destination...',
				routing_waypoints_title: 'Waypoints',
				routing_waypoints_remove_all: 'Remove all',
				routing_waypoints_reverse: 'Reverse',
				routing_waypoint_move_down: 'move forward',
				routing_waypoint_move_up: 'move backward',
				routing_waypoint_move_remove: 'remove',
				routing_warnings_title: 'Route notes',
				routing_warnings_zoom: 'Zoom to segments',
				routing_details_surface: 'Surface',
				routing_details_road_type: 'Road type'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_feedback_400: 'Anhand der angegebenen Punkte konnte keine Route erstellt werden',
				routing_feedback_500: 'Aufgrund eines technischen Fehlers konnte keine Route erstellt werden',
				routing_feedback_900: '<b>Start</b> bzw. <b>Ziel</b> durch Klicken in die Karte angeben',
				routing_info_duration: 'Dauer',
				routing_info_distance: 'Distanz',
				routing_info_uphill: 'Bergauf',
				routing_info_downhill: 'Bergab',
				routing_category_label_bvv_hike: 'Wandern',
				routing_category_label_bvv_bike: 'Fahrrad',
				routing_category_label_bvv_mtb: 'Mountainbike',
				routing_category_label_racingbike: 'Rennrad',
				routing_waypoints_start: 'Start',
				routing_waypoints_waypoint: 'Wegpunkt',
				routing_waypoints_destination: 'Ziel',
				routing_waypoints_as_start: 'als Start verwenden...',
				routing_waypoints_as_destination: 'als Ziel verwenden...',
				routing_waypoints_title: 'Wegpunkte',
				routing_waypoints_remove_all: 'Alle entfernen',
				routing_waypoints_reverse: 'Reihenfolge umkehren',
				routing_waypoint_move_down: 'nach hinten',
				routing_waypoint_move_up: 'nach vorne',
				routing_waypoint_move_remove: 'entfernen',
				routing_warnings_title: 'Hinweise zur Route',
				routing_warnings_zoom: 'Zu den Segmenten zoomen',
				routing_details_surface: 'Oberfläche',
				routing_details_road_type: 'Weg-Typ'
			};

		default:
			return {};
	}
};
