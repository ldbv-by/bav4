export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				valueSelect_icon_hint: 'Select value'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				valueSelect_icon_hint: 'Auswählen'
			};

		default:
			return {};
	}
};
