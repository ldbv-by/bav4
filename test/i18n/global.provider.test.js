import { provide } from '../../src/i18n/global.provider';


describe('global i18n', () => {

	it('provides translation for en', () => {

		const map = provide('en');

		expect(map.exportMfpPlugin_mfpService_init_exception).toBe('PDF export currently not available.');
		expect(map.exportMfpPlugin_mfpService_createJob_exception).toBe('PDF generation was not successful.');
		expect(map.featureInfoPlugin_featureInfoService_exception).toBe('FeatureInfo could not be retrieved');
		expect(map.geolocationPlugin_store_geolocation_denied).toBe('The acquisition of the position failed because your browser settings does not allow it. Allow your browser / this website to use your location. Deactivate the "private" mode of your browser.');
		expect(map.geolocationPlugin_store_geolocation_not_available).toBe('The acquisition of the position failed.');
		expect(map.importPlugin_url_failed).toBe('URL-Import failed');
		expect(map.importPlugin_data_failed).toBe('Importing data failed');
		expect(map.importPlugin_unsupported_sourceType).toBe('Source type could not be detected or is not supported');
		expect(map.importPlugin_authenticationModal_title).toBe('Authentication required');
		expect(map.layersPlugin_store_layer_default_layer_name_vector).toBe('Data');
	});

	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.exportMfpPlugin_mfpService_init_exception).toBe('PDF Export derzeit leider nicht möglich.');
		expect(map.exportMfpPlugin_mfpService_createJob_exception).toBe('PDF konnte nicht erstellt werden.');
		expect(map.featureInfoPlugin_featureInfoService_exception).toBe('FeatureInfo Abfrage schlug fehl');
		expect(map.geolocationPlugin_store_geolocation_denied).toBe('Es ist keine Positionsbestimmung möglich, da ihre Browsereinstellungen dies nicht zulassen. Erlauben sie die Positionsbestimmung und deaktivieren Sie den "Privat" Modus des Browsers.');
		expect(map.geolocationPlugin_store_geolocation_not_available).toBe('Es ist keine Positionsbestimmung möglich.');
		expect(map.importPlugin_url_failed).toBe('URL-Import schlug fehl');
		expect(map.importPlugin_data_failed).toBe('Import der Daten schlug fehl');
		expect(map.importPlugin_unsupported_sourceType).toBe('Daten-Typ konnte nicht erkannt werden oder wird nicht unterstützt');
		expect(map.importPlugin_authenticationModal_title).toBe('Anmeldung erforderlich');
		expect(map.layersPlugin_store_layer_default_layer_name_vector).toBe('Daten');
	});

	it('have the expected amount of translations', () => {

		const expectedSize = 10;
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
