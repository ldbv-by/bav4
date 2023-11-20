export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_contextContent_start: 'Start here',
				routing_contextContent_destination: 'Finish here',
				routing_contextContent_intermediate: 'Insert Waypoint',
				routing_contextContent_remove_waypoint: 'Remove Waypoint'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_contextContent_start: 'Hier starten',
				routing_contextContent_destination: 'Als Ziel',
				routing_contextContent_intermediate: 'Wegpunkt hinzufügen',
				routing_contextContent_remove_waypoint: 'Wegpunkt entfernen'
			};

		default:
			return {};
	}
};
