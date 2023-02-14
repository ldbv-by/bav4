import './mockWindowProcess.js';
import '../../src/injection/config';
import { $injector } from '../../src/injection';


describe('injector configuration', () => {

	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(57);

		expect($injector.getScope('ProjectionService')).toBe('Singleton');
		expect($injector.getScope('HttpService')).toBe('PerLookup');
		expect($injector.getScope('ConfigService')).toBe('Singleton');
		expect($injector.getScope('TranslationService')).toBe('Singleton');
		expect($injector.getScope('CoordinateService')).toBe('PerLookup');
		expect($injector.getScope('EnvironmentService')).toBe('PerLookup');
		expect($injector.getScope('MapService')).toBe('PerLookup');
		expect($injector.getScope('StoreService')).toBe('Singleton');
		expect($injector.getScope('GeoResourceService')).toBe('Singleton');
		expect($injector.getScope('TopicsService')).toBe('Singleton');
		expect($injector.getScope('ElevationService')).toBe('PerLookup');
		expect($injector.getScope('SearchResultService')).toBe('PerLookup');
		expect($injector.getScope('ShareService')).toBe('PerLookup');
		expect($injector.getScope('UnitsService')).toBe('PerLookup');
		expect($injector.getScope('FileStorageService')).toBe('PerLookup');
		expect($injector.getScope('UrlService')).toBe('PerLookup');
		expect($injector.getScope('IconService')).toBe('Singleton');
		expect($injector.getScope('AdministrationService')).toBe('PerLookup');
		expect($injector.getScope('FeatureInfoService')).toBe('PerLookup');
		expect($injector.getScope('GeoResourceInfoService')).toBe('Singleton');
		expect($injector.getScope('ImportVectorDataService')).toBe('PerLookup');
		expect($injector.getScope('ImportWmsService')).toBe('PerLookup');
		expect($injector.getScope('SourceTypeService')).toBe('PerLookup');
		expect($injector.getScope('Mfp3Encoder')).toBe('PerLookup');
		expect($injector.getScope('SecurityService')).toBe('Singleton');
		expect($injector.getScope('BaaCredentialService')).toBe('Singleton');
		expect($injector.getScope('MfpService')).toBe('Singleton');
		expect($injector.getScope('ChipsConfigurationService')).toBe('Singleton');
		expect($injector.getScope('DrawPlugin')).toBe('Singleton');
		expect($injector.getScope('TopicsPlugin')).toBe('Singleton');
		expect($injector.getScope('ChipsPlugin')).toBe('Singleton');
		expect($injector.getScope('LayersPlugin')).toBe('Singleton');
		expect($injector.getScope('PositionPlugin')).toBe('Singleton');
		expect($injector.getScope('HighlightPlugin')).toBe('Singleton');
		expect($injector.getScope('MediaPlugin')).toBe('Singleton');
		expect($injector.getScope('MeasurementPlugin')).toBe('Singleton');
		expect($injector.getScope('GeolocationPlugin')).toBe('Singleton');
		expect($injector.getScope('ContextClickPlugin')).toBe('Singleton');
		expect($injector.getScope('FeatureInfoPlugin')).toBe('Singleton');
		expect($injector.getScope('MainMenuPlugin')).toBe('Singleton');
		expect($injector.getScope('ImportPlugin')).toBe('Singleton');
		expect($injector.getScope('SearchPlugin')).toBe('Singleton');
		expect($injector.getScope('ExportMfpPlugin')).toBe('Singleton');
		expect($injector.getScope('ElevationProfilePlugin')).toBe('Singleton');
		expect($injector.getScope('HistoryStatePlugin')).toBe('Singleton');

		// map module
		expect($injector.getScope('StyleService')).toBe('Singleton');
		expect($injector.getScope('OlMeasurementHandler')).toBe('PerLookup');
		expect($injector.getScope('OlDrawHandler')).toBe('PerLookup');
		expect($injector.getScope('OlGeolocationHandler')).toBe('PerLookup');
		expect($injector.getScope('OlHighlightLayerHandler')).toBe('PerLookup');
		expect($injector.getScope('VectorLayerService')).toBe('PerLookup');
		expect($injector.getScope('LayerService')).toBe('PerLookup');
		expect($injector.getScope('InteractionStorageService')).toBe('PerLookup');
		expect($injector.getScope('OverlayService')).toBe('PerLookup');
		expect($injector.getScope('OlFeatureInfoHandler')).toBe('PerLookup');
		expect($injector.getScope('OlMfpHandler')).toBe('PerLookup');

		// topic module
		expect($injector.getScope('CatalogService')).toBe('Singleton');
	});

});
