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
				routing_category_label_racingbike: 'Racingbike'
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
				routing_category_label_racingbike: 'Rennrad'
			};

		default:
			return {};
	}
};
