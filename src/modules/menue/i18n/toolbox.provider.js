export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				menue_toolbox_draw_button: 'Draw',
				menue_toolbox_share_button: 'Share'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				menue_toolbox_draw_button: 'Zeichnen',
				menue_toolbox_share_button: 'Teilen'
			};

		default:
			return {};
	}
};