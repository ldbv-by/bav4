export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_assistChips_share_position_label: 'Share position',
				map_assistChips_share_position_api_failed: 'Sharing the position has failed',
				map_assistChips_map_feedback_label: 'Improve map',
				map_assistChips_map_feedback_title: 'Feedback'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_assistChips_share_position_label: 'Position teilen',
				map_assistChips_share_position_api_failed: 'Teilen der Position ist fehlgeschlagen',
				map_assistChips_map_feedback_label: 'Karte verbessern',
				map_assistChips_map_feedback_title: 'Feedback'
			};

		default:
			return {};
	}
};
