export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Elevation Profile',
				chips_assist_chip_elevation_profile_title: 'Show Elevation Profile',
				chips_assist_chip_export: 'Export',
				chips_assist_chip_export_title: 'Export vector data',
				chips_assist_chip_start_routing_here: 'Plan a route',
				chips_assist_chip_start_routing_here_title: 'Plan a route',
				chips_assist_chip_share_stored_data: 'Share data',
				chips_assist_chip_share_stored_data_title: 'Share the data with others',
				chips_assist_chip_share_position_label: 'Share position',
				chips_assist_chip_share_position_title: 'Share your position with others',
				chips_assist_chip_share_position_api_failed: 'Sharing the position has failed',
				chips_assist_chip_share_state_label_default: 'Share',
				chips_assist_chip_share_state_api_failed: 'Sharing the website has failed',
				chips_assist_chip_map_feedback_label: 'Improve map',
				chips_assist_chip_map_feedback_title: 'Send us suggestions for corrections to the map content',
				chips_assist_chip_map_feedback_modal_title: 'Feedback'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_assist_chip_elevation_profile: 'Geländeprofil',
				chips_assist_chip_elevation_profile_title: 'Geländeprofil anzeigen',
				chips_assist_chip_export: 'Export',
				chips_assist_chip_export_title: 'Vektordaten exportieren',
				chips_assist_chip_start_routing_here: 'Route planen',
				chips_assist_chip_start_routing_here_title: 'Route planen',
				chips_assist_chip_share_stored_data: 'Daten teilen',
				chips_assist_chip_share_stored_data_title: 'Daten mit anderen teilen',
				chips_assist_chip_share_position_label: 'Position teilen',
				chips_assist_chip_share_position_title: 'Position mit anderen teilen',
				chips_assist_chip_share_position_api_failed: 'Teilen der Position ist fehlgeschlagen',
				chips_assist_chip_share_state_label_default: 'Teilen',
				chips_assist_chip_share_state_api_failed: 'Teilen der Seite ist fehlgeschlagen',
				chips_assist_chip_map_feedback_label: 'Karte verbessern',
				chips_assist_chip_map_feedback_title: 'Melden Sie uns Korrekturvorschläge zu den Karteninhalten',
				chips_assist_chip_map_feedback_modal_title: 'Feedback'
			};

		default:
			return {};
	}
};
