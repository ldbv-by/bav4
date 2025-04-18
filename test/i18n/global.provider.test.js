import { provide } from '../../src/i18n/global.provider';

describe('global i18n', () => {
	it('provides translation for en', () => {
		const map = provide('en');

		expect(map.global_app_name).toBe('BayernAtlas');
		expect(map.global_generic_exception).toBe('Something got wrong. See the console output for more information...');
		expect(map.global_mfpService_init_exception).toBe('PDF export currently not available');
		expect(map.global_mfpService_createJob_exception).toBe('PDF generation was not successful');
		expect(map.global_featureInfoService_exception).toBe('FeatureInfo could not be retrieved');
		expect(map.global_geolocation_denied).toBe(
			'The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.'
		);
		expect(map.global_geolocation_not_available).toBe('The acquisition of the position failed');
		expect(map.global_import_data_failed).toBe('Importing data failed');
		expect(map.global_import_unsupported_sourceType).toBe('Source type could not be detected or is not supported');
		expect(map.global_import_authenticationModal_title).toBe('Authentication');
		expect(map.global_locally_imported_dataset_copyright_label).toBe('Dataset and/or style provided by third party');
		expect(map.global_share_unsupported_geoResource_warning).toBe("The following layers won't be shared:");
		expect(map.global_privacy_policy_url).toBe('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
		expect(map.global_marker_symbol_label).toBe('Marker');
		expect(map.global_featureInfo_not_available).toBe('FeatureInfo is not available');
		expect(map.global_routingService_init_exception).toBe('Routing currently not available');
		expect(map.global_geoResource_not_available(['id'])).toBe('Failed to add a layer for the GeoResource "id"');
		expect(map.global_geoResource_not_available(['id', 'Reason...'])).toBe('Failed to add a layer for the GeoResource "id" (Reason...)');
		expect(map.global_geoResource_unauthorized).toBe('401 - Unauthorized');
		expect(map.global_geoResource_forbidden).toBe('403 - Forbidden');
		expect(map.global_signOut_success).toBe('Signed out successfully');
		expect(map.global_fileStorageService_exception).toBe('The data could not be stored');
		expect(map.global_cr_global_wgs84).toBe('Lat, Lon');
		expect(map.global_terms_of_use).toBe('https://www.ldbv.bayern.de/mam/ldbv/dateien/nutzungsbedingungen_geoportal_bayernatlas_bayernatlasplus.pdf');
		expect(map.global_featureCollection_layer_label).toBe('My temporary collection');
		expect(map.global_featureCollection_add_feature_notification).toBe('Object was added to “My temporary collection”');
		expect(map.global_featureCollection_remove_feature_notification).toBe('Object has been removed from “My temporary collection”');
		expect(map.global_featureCollection_add_feature).toBe('Add to collection');
		expect(map.global_featureCollection_remove_feature).toBe('Remove from collection');
		expect(map.global_featureCollection_add_feature_title).toBe('Add this object to “My temporary collection”');
		expect(map.global_featureCollection_remove_feature_title).toBe('Remove this object from “My temporary collection”');
	});

	it('provides translation for de', () => {
		const map = provide('de');

		expect(map.global_app_name).toBe('BayernAtlas');
		expect(map.global_generic_exception).toBe('Leider ist etwas schiefgegangen. Weitere Informationen sind in der Konsole des Browsers zu finden...');
		expect(map.global_mfpService_init_exception).toBe('PDF Export derzeit leider nicht möglich');
		expect(map.global_mfpService_createJob_exception).toBe('PDF konnte nicht erstellt werden');
		expect(map.global_featureInfoService_exception).toBe('FeatureInfo Abfrage schlug fehl');
		expect(map.global_geolocation_denied).toBe(
			'Es ist keine Standortanzeige möglich, da Ihre Browsereinstellungen dies nicht zulassen. Erlauben Sie die Standortbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.'
		);
		expect(map.global_geolocation_not_available).toBe('Es ist keine Standortanzeige möglich');
		expect(map.global_import_data_failed).toBe('Import der Daten schlug fehl');
		expect(map.global_import_unsupported_sourceType).toBe('Daten-Typ konnte nicht erkannt werden oder wird nicht unterstützt');
		expect(map.global_import_authenticationModal_title).toBe('Anmeldung');
		expect(map.global_locally_imported_dataset_copyright_label).toBe('Mit Darstellung durch den Anwender');
		expect(map.global_share_unsupported_geoResource_warning).toBe('Folgende Ebenen werden nicht geteilt:');
		expect(map.global_privacy_policy_url).toBe('https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html');
		expect(map.global_marker_symbol_label).toBe('Markierung');
		expect(map.global_featureInfo_not_available).toBe('FeatureInfo ist nicht verfügbar');
		expect(map.global_routingService_init_exception).toBe('Die Routing-Funktion steht derzeit leider nicht zur Verfügung');
		expect(map.global_geoResource_not_available(['id'])).toBe('Es konnte keine Ebene für die GeoRessource "id" geladen werden');
		expect(map.global_geoResource_not_available(['id', 'Grund...'])).toBe(
			'Es konnte keine Ebene für die GeoRessource "id" geladen werden (Grund...)'
		);
		expect(map.global_geoResource_unauthorized).toBe('401 - Fehlende Berechtigung');
		expect(map.global_geoResource_forbidden).toBe('403 - Zugriff nicht erlaubt');
		expect(map.global_signOut_success).toBe('Sie haben sich erfolgreich abgemeldet');
		expect(map.global_fileStorageService_exception).toBe('Die Daten konnten nicht gespeichert werden');
		expect(map.global_cr_global_wgs84).toBe('Breite, Länge');
		expect(map.global_terms_of_use).toBe('https://www.ldbv.bayern.de/mam/ldbv/dateien/nutzungsbedingungen_geoportal_bayernatlas_bayernatlasplus.pdf');
		expect(map.global_featureCollection_layer_label).toBe('Meine temporäre Sammlung');
		expect(map.global_featureCollection_add_feature_notification).toBe('Objekt wurde zu "Meine temporäre Sammlung" hinzugefügt');
		expect(map.global_featureCollection_remove_feature_notification).toBe('Objekt wurde aus "Meine temporäre Sammlung" entfernt');
		expect(map.global_featureCollection_add_feature).toBe('Zur Sammlung hinzufügen');
		expect(map.global_featureCollection_remove_feature).toBe('Aus Sammlung entfernen');
		expect(map.global_featureCollection_add_feature_title).toBe('Dieses Objekt zu "Meine temporäre Sammlung" hinzufügen');
		expect(map.global_featureCollection_remove_feature_title).toBe('Dieses Objekt aus "Meine temporäre Sammlung" entfernen');
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 30;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);
	});

	it('provides an empty map for a unknown lang', () => {
		const map = provide('unknown');

		expect(map).toEqual({});
	});
});
