export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Topics'	
			
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				topics_menu_title: 'Themen'
			};

		default:
			return {};
	}
};