
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'Import failed',
				importPlugin_url_not_supported: 'This import-type is currently not supported',
				importPlugin_data_failed: 'Importing data failed'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'Import schlug fehl',
				importPlugin_url_not_supported: 'Dieser Import-Typ wird aktuell nicht unterstützt',
				importPlugin_data_failed: 'Import der Daten schlug fehl'
			};

		default:
			return {};
	}
};
