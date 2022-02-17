
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'Import failed',
				importPlugin_data_failed: 'Importing data failed'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'Import schlug fehl',
				importPlugin_data_failed: 'Import der Daten schlug fehl'
			};

		default:
			return {};
	}
};
