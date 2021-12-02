export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iconSelect_icon_hint: 'Click to select as icon'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iconSelect_icon_hint: 'Klicken, um es als Symbol auswählen'
			};

		default:
			return {};
	}
};
