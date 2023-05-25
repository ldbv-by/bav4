export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item: 'Anyone, who has this link, can edit this drawing'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				export_item: 'Jeder, der diesen Link hat, kann an dieser Zeichnung mitarbeiten'
			};

		default:
			return {};
	}
};
