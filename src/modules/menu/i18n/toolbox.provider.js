export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbox_draw_button: 'Draw',
				menu_toolbox_share_button: 'Share'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbox_draw_button: 'Zeichnen',
				menu_toolbox_share_button: 'Teilen'
			};

		default:
			return {};
	}
};