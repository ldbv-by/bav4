export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_feedback_400: 'No route could be created based on the given points',
				routing_feedback_500: 'Due to a technical error no route could be created',
				routing_feedback_900: 'Specify <b>start</b> or <b>destination</b> by clicking in the map'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				routing_feedback_400: 'Anhand der angegebenen Punkte konnte keine Route erstellt werden',
				routing_feedback_500: 'Aufgrund eines technischen Fehlers konnte keine Route erstellt werden',
				routing_feedback_900: '<b>Start</b> bzw. <b>Ziel</b> durch Klicken in die Karte angeben'
			};

		default:
			return {};
	}
};
