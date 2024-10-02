export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'Time travel',
				timeTravel_data: 'Data',
				timeTravel_increase: 'Increase year',
				timeTravel_decrease: 'Previous year',
				timeTravel_start: 'Start',
				timeTravel_stop: 'Stop',
				timeTravel_reset: 'Reset'
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
