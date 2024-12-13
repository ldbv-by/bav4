export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				commons_spinner_text: 'Loading'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				commons_spinner_text: 'Wird geladen'
			};

		default:
			return {};
	}
};
