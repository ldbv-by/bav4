export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				notifications_item_close: 'Close',			
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				notifications_item_close: 'Schliessen',
			};

		default:
			return {};
	}
};