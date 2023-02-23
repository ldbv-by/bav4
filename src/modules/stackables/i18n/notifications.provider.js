export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				notifications_item_info: 'Info',
				notifications_item_warn: 'Warning',
				notifications_item_error: 'Error'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				notifications_item_info: 'Info',
				notifications_item_warn: 'Warnung',
				notifications_item_error: 'Fehler'
			};

		default:
			return {};
	}
};
