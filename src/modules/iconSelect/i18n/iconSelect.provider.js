export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				iconSelect_icon_hint: 'Select a icon first'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				iconSelect_icon_hint: 'Zuerst Symbol auswählen'
			};

		default:
			return {};
	}
};
