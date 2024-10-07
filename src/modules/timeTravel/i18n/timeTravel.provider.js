export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'Time travel',
				timeTravel_slider_increase: 'Increase year',
				timeTravel_slider_decrease: 'Previous year',
				timeTravel_slider_start: 'Start',
				timeTravel_slider_stop: 'Stop',
				timeTravel_slider_reset: 'Reset'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'Zeitreise',
				timeTravel_slider_increase: 'nächstes Jahr',
				timeTravel_slider_decrease: 'vorheriges Jahr',
				timeTravel_slider_start: 'Start',
				timeTravel_slider_stop: 'Stop',
				timeTravel_slider_reset: 'Zurücksetzten'
			};

		default:
			return {};
	}
};
