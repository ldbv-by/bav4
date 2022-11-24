export const firstStepsProvide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_dialog_close: 'No thanks'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				chips_dialog_close: 'Nein danke'
			};

		default:
			return {};
	}
};
