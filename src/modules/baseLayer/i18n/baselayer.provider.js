export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				baselayer_switcher_header: 'Base maps'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				baselayer_switcher_header: 'Basiskarten'
			};

		default:
			return {};
	}
};
