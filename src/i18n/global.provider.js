export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_generic_exception: 'Something got wrong. See the console output for more information...',
				global_mfpService_init_exception: 'PDF export currently not available',
				global_mfpService_createJob_exception: 'PDF generation was not successful',
				global_featureInfoService_exception: 'FeatureInfo could not be retrieved',
				global_geolocation_denied:
					'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.',
				global_geolocation_not_available: 'The acquisition of the position failed',
				global_import_url_failed: 'URL-Import failed',
				global_import_data_failed: 'Importing data failed',
				global_import_unsupported_sourceType: 'Source type could not be detected or is not supported',
				global_import_authenticationModal_title: 'Authentication',
				global_locally_imported_dataset_copyright_label: 'Dataset and/or style provided by third party',
				global_share_unsupported_geoResource_warning: "The following layers won't be shared:",
				global_privacy_policy_url: 'https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html',
				global_marker_symbol_label: 'Marker',
				global_featureInfo_not_available: 'FeatureInfo is not available',
				global_routingService_init_exception: 'Routing currently not available',
				global_geoResource_not_available: (params) => `Failed to add a layer for the GeoResource "${params[0]}"${params[1] ? ` (${params[1]})` : ``}`,
				global_geoResource_unauthorized: '401 - Unauthorized',
				global_geoResource_forbidden: '403 - Forbidden',
				global_signOut_success: 'Signed out successfully'
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_generic_exception: 'Leider ist etwas schiefgegangen. Weitere Informationen sind in der Konsole des Browsers zu finden...',
				global_mfpService_init_exception: 'PDF Export derzeit leider nicht möglich',
				global_mfpService_createJob_exception: 'PDF konnte nicht erstellt werden',
				global_featureInfoService_exception: 'FeatureInfo Abfrage schlug fehl',
				global_geolocation_denied:
					'Es ist keine Positionsbestimmung möglich, da Ihre Browsereinstellungen dies nicht zulassen. Erlauben Sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.',
				global_geolocation_not_available: 'Es ist keine Positionsbestimmung möglich',
				global_import_url_failed: 'URL-Import schlug fehl',
				global_import_data_failed: 'Import der Daten schlug fehl',
				global_import_unsupported_sourceType: 'Daten-Typ konnte nicht erkannt werden oder wird nicht unterstützt',
				global_import_authenticationModal_title: 'Anmeldung',
				global_locally_imported_dataset_copyright_label: 'Mit Darstellung durch den Anwender',
				global_share_unsupported_geoResource_warning: 'Folgende Ebenen werden nicht geteilt:',
				global_privacy_policy_url: 'https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html',
				global_marker_symbol_label: 'Markierung',
				global_featureInfo_not_available: 'FeatureInfo ist nicht verfügbar',
				global_routingService_init_exception: 'Die Routing-Funktion steht derzeit leider nicht zur Verfügung',
				global_geoResource_not_available: (params) =>
					`Es konnte keine Ebene für die GeoRessource "${params[0]}" geladen werden${params[1] ? ` (${params[1]})` : ``}`,
				global_geoResource_unauthorized: '401 - Fehlende Berechtigung',
				global_geoResource_forbidden: '403 - Zugriff nicht erlaubt',
				global_signOut_success: 'Sie haben sich erfolgreich abgemeldet'
			};

		default:
			return {};
	}
};
