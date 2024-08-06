export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'time travel',
				timeTravel_data: 'data',
				timeTravel_increase: 'increase year',
				timeTravel_decrease: 'previous year',
				timeTravel_start: 'start',
				timeTravel_stop: 'stop',
				timeTravel_reset: 'reset'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'Zeitreise',
				timeTravel_data: 'Daten',
				timeTravel_increase: 'nächstes Jahr',
				timeTravel_decrease: 'vorheriges Jahr',
				timeTravel_start: 'Start',
				timeTravel_stop: 'Stop',
				timeTravel_reset: 'Zurücksetzten'
			};

		default:
			return {};
	}
};
