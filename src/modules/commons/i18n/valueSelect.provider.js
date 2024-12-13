export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				commons_valueSelect_icon_hint: 'Click to select value'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				commons_valueSelect_icon_hint: 'Klicken zum Auswählen'
			};

		default:
			return {};
	}
};
