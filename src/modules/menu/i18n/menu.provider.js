export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbox_draw_button: 'Draw',
				menu_toolbox_share_button: 'Share',
				menu_toolbox_measure_button: 'Measure'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbox_draw_button: 'Zeichnen',
				menu_toolbox_share_button: 'Teilen',
				menu_toolbox_measure_button: 'Messen'
			};

		default:
			return {};
	}
};