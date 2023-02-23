export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'The BayernAtlas Iframe API must be used in an iframe.'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iframe_non_embedded_hint: 'Die BayernAtlas Iframe API muss über ein Inlineframe-Element eingebunden werden.'
			};

		default:
			return {};
	}
};
