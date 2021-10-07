export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Open menu'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_main_open_button: 'Menü öffnen'
			};

		default:
			return {};
	}
};
