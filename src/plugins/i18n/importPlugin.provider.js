
export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'URL-Import failed',
				importPlugin_url_wms_not_supported: 'WMS-Import is currently not supported',
				importPlugin_data_failed: 'Importing data failed'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related plugin
				importPlugin_url_failed: 'URL-Import schlug fehl',
				importPlugin_url_wms_not_supported: 'WMS-Import wird aktuell nicht unterstützt',
				importPlugin_data_failed: 'Import der Daten schlug fehl'
			};

		default:
			return {};
	}
};
