export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				admin_georesource_refresh: 'Refresh',
				admin_georesource_save_draft: 'Save draft',
				admin_georesource_publish: 'Publish'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				admin_georesource_refresh: 'Aktualisieren',
				admin_georesource_save_draft: 'Entwurf speichern',
				admin_georesource_publish: 'Veröffentlichen'
			};

		default:
			return {};
	}
};
