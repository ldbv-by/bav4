export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				uiTheme_toggle_tooltip_dark: 'Disable contrast mode',
				uiTheme_toggle_tooltip_light: 'Enable contrast mode'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				uiTheme_toggle_tooltip_dark: 'Kontrastmodus deaktivieren',
				uiTheme_toggle_tooltip_light: 'Kontrastmodus aktivieren'
			};

		default:
			return {};
	}
};
