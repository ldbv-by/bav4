export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'time travel'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				timeTravel_title: 'Zeitreise'
			};

		default:
			return {};
	}
};
