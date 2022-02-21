
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'URL-Import failed',
				importPlugin_data_failed: 'Importing data failed',
				importPlugin_unsupported_sourceType: 'Source type could not be detected or is not supported'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'URL-Import schlug fehl',
				importPlugin_data_failed: 'Import der Daten schlug fehl',
				importPlugin_unsupported_sourceType: 'Daten-Typ konnte nicht erkannt werden oder wird nicht unterstützt'
			};

		default:
			return {};
	}
};
