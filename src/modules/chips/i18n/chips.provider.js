export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Elevation Profile',
				chips_assist_chip_export: 'Export',
				chips_assist_chip_start_routing_here: 'Plan a route',
				chips_assist_chip_share_stored_data: 'Share data',
				chips_assist_chip_share_position_label: 'Share position',
				chips_assist_chip_share_position_api_failed: 'Sharing the position has failed',
				chips_assist_chip_map_feedback_label: 'Improve map',
				chips_assist_chip_map_feedback_title: 'Feedback'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Geländeprofil',
				chips_assist_chip_export: 'Export',
				chips_assist_chip_start_routing_here: 'Route planen',
				chips_assist_chip_share_stored_data: 'Daten teilen',
				chips_assist_chip_share_position_label: 'Position teilen',
				chips_assist_chip_share_position_api_failed: 'Teilen der Position ist fehlgeschlagen',
				chips_assist_chip_map_feedback_label: 'Karte verbessern',
				chips_assist_chip_map_feedback_title: 'Feedback'
			};

		default:
			return {};
	}
};
