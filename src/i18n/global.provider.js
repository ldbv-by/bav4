export const provide = (lang) => {
	switch (lang) {

		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_mfpService_init_exception: 'PDF export currently not available.',
				global_mfpService_createJob_exception: 'PDF generation was not successful.',
				global_featureInfoService_exception: 'FeatureInfo could not be retrieved',
				global_geolocation_denied: 'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.',
				global_geolocation_not_available: 'The acquisition of the position failed.',
				global_import_url_failed: 'URL-Import failed',
				global_import_data_failed: 'Importing data failed',
				global_import_unsupported_sourceType: 'Source type could not be detected or is not supported',
				global_import_authenticationModal_title: 'Authentication required',
				layersPlugin_store_layer_default_layer_name_vector: 'Data'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_mfpService_init_exception: 'PDF Export derzeit leider nicht möglich.',
				global_mfpService_createJob_exception: 'PDF konnte nicht erstellt werden.',
				global_featureInfoService_exception: 'FeatureInfo Abfrage schlug fehl',
				global_geolocation_denied: 'Es ist keine Positionsbestimmung möglich, da ihre Browsereinstellungen dies nicht zulassen. Erlauben sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.',
				global_geolocation_not_available: 'Es ist keine Positionsbestimmung möglich.',
				global_import_url_failed: 'URL-Import schlug fehl',
				global_import_data_failed: 'Import der Daten schlug fehl',
				global_import_unsupported_sourceType: 'Daten-Typ konnte nicht erkannt werden oder wird nicht unterstützt',
				global_import_authenticationModal_title: 'Anmeldung erforderlich',
				layersPlugin_store_layer_default_layer_name_vector: 'Daten'
			};

		default:
			return {};
	}
};
