export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				uiTheme_toggle_tooltip_dark: 'Enable contrast mode',
				uiTheme_toggle_tooltip_light: 'Disable contrast mode'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				uiTheme_toggle_tooltip_dark: 'Kontrastmodus aktivieren',
				uiTheme_toggle_tooltip_light: 'Kontrastmodus deaktivieren'
			};

		default:
			return {};
	}
};