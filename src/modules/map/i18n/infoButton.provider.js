export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_infoButton_title: 'Information',
				map_infoButton_help: 'Help',
				map_infoButton_contact: 'Contact',
				map_infoButton_about: 'About us'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				map_infoButton_title: 'Information',
				map_infoButton_help: 'Hilfe',
				map_infoButton_contact: 'Kontakt',
				map_infoButton_about: 'Impressum'
			};

		default:
			return {};
	}
};
