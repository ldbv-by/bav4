export const provide = (lang) => {
	switch (lang) {
		case 'en':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_app_name: 'BayernAtlas',
				global_generic_exception: 'Something got wrong. See the console output for more information...',
				global_mfpService_init_exception: 'PDF export currently not available',
				global_mfpService_createJob_exception: 'PDF generation was not successful',
				global_featureInfoService_exception: 'FeatureInfo could not be retrieved',
				global_geolocation_denied:
					'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.',
				global_geolocation_not_available: 'The acquisition of the position failed',
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
				global_signOut_success: 'Signed out successfully',
				global_fileStorageService_exception: 'The data could not be stored',
				global_cr_global_wgs84: 'Lat, Lon',
				global_terms_of_use: 'https://www.ldbv.bayern.de/mam/ldbv/dateien/nutzungsbedingungen_geoportal_bayernatlas_bayernatlasplus.pdf',
				global_featureCollection_layer_label: 'My temporary collection',
				global_featureCollection_add_feature_notification: 'Object was added to “My temporary collection”',
				global_featureCollection_remove_feature_notification: 'Object has been removed from “My temporary collection”',
				global_featureCollection_add_feature: 'Add to collection',
				global_featureCollection_remove_feature: 'Remove from collection',
				global_featureCollection_add_feature_title: 'Add this object to “My temporary collection”',
				global_featureCollection_remove_feature_title: 'Remove this object from “My temporary collection”',
				global_georesource_keyword_local: 'Local',
				global_georesource_keyword_external: 'External',
				global_georesource_keyword_local_desc: 'Locally available data. These data are not considered when sharing the map.',
				global_georesource_keyword_external_desc:
					'External data source. When sharing the map, a link to this data source is created. Possibly not directly exportable (PDF).',
				global_georesource_keyword_role_desc: (params) => `Only authenticated "${params[0]}" users can use this data.`
			};

		case 'de':
			return {
				//the first part of the snake_case key should be the name of the related module
				global_app_name: 'BayernAtlas',
				global_generic_exception: 'Leider ist etwas schiefgegangen. Weitere Informationen sind in der Konsole des Browsers zu finden...',
				global_mfpService_init_exception: 'PDF Export derzeit leider nicht möglich',
				global_mfpService_createJob_exception: 'PDF konnte nicht erstellt werden',
				global_featureInfoService_exception: 'FeatureInfo Abfrage schlug fehl',
				global_geolocation_denied:
					'Es ist keine Standortanzeige möglich, da Ihre Browsereinstellungen dies nicht zulassen. Erlauben Sie die Standortbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.',
				global_geolocation_not_available: 'Es ist keine Standortanzeige möglich',
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
				global_signOut_success: 'Sie haben sich erfolgreich abgemeldet',
				global_fileStorageService_exception: 'Die Daten konnten nicht gespeichert werden',
				global_cr_global_wgs84: 'Breite, Länge',
				global_terms_of_use: 'https://www.ldbv.bayern.de/mam/ldbv/dateien/nutzungsbedingungen_geoportal_bayernatlas_bayernatlasplus.pdf',
				global_featureCollection_layer_label: 'Meine temporäre Sammlung',
				global_featureCollection_add_feature_notification: 'Objekt wurde zu "Meine temporäre Sammlung" hinzugefügt',
				global_featureCollection_remove_feature_notification: 'Objekt wurde aus "Meine temporäre Sammlung" entfernt',
				global_featureCollection_add_feature: 'Zur Sammlung hinzufügen',
				global_featureCollection_remove_feature: 'Aus Sammlung entfernen',
				global_featureCollection_add_feature_title: 'Dieses Objekt zu "Meine temporäre Sammlung" hinzufügen',
				global_featureCollection_remove_feature_title: 'Dieses Objekt aus "Meine temporäre Sammlung" entfernen',
				global_georesource_keyword_local: 'Lokal',
				global_georesource_keyword_external: 'Extern',
				global_georesource_keyword_local_desc: 'Lokal vorliegende Daten. Beim Teilen der Karte werden diese Daten nicht berücksichtigt.',
				global_georesource_keyword_external_desc:
					'Externe Datenquelle. Beim Teilen der Karte wird auf diese Datenquelle verlinkt. Ggfs. nicht direkt exportierbar (PDF).',
				global_georesource_keyword_role_desc: (params) => `Nur authentifizierte "${params[0]}"-Nutzer können diese Daten verwenden.`
			};

		default:
			return {};
	}
};
