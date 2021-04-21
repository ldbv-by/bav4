export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbar_draw_button: 'Draw',
				menu_toolbar_share_button: 'Share',
				menu_toolbar_measure_button: 'Measure'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menu_toolbar_draw_button: 'Zeichnen',
				menu_toolbar_share_button: 'Teilen',
				menu_toolbar_measure_button: 'Messen'
			};

		default:
			return {};
	}
};