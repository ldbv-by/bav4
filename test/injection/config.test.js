import './mockWindowProcess.js';
import '../../src/injection/config';
import { $injector } from '../../src/injection';
import { Injector } from '../../src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(60);

		expect($injector.getScope('ProjectionService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HttpService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('TranslationService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('CoordinateService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('MapService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('StoreService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('GeoResourceService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('TopicsService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ElevationService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('SearchResultService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('ShareService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('UnitsService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('FileStorageService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('UrlService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('IconService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('AdministrationService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('FeatureInfoService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('GeoResourceInfoService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ImportVectorDataService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('ImportWmsService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('SourceTypeService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('Mfp3Encoder')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('SecurityService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('BaaCredentialService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('MfpService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ChipsConfigurationService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('DrawPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('TopicsPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ChipsPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('LayersPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('PositionPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HighlightPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('MediaPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('MeasurementPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('GeolocationPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ContextClickPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('FeatureInfoPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('MainMenuPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ImportPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('SearchPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ExportMfpPlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ElevationProfilePlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('IframeStatePlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HistoryStatePlugin')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ObserveStateForEncodingPlugin')).toBe(Injector.SCOPE_SINGLETON);

		// map module
		expect($injector.getScope('StyleService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('OlMeasurementHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlDrawHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlGeolocationHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlHighlightLayerHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('VectorLayerService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('LayerService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('InteractionStorageService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OverlayService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlFeatureInfoHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlFeatureInfoHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlElevationProfileHandler')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('OlMfpHandler')).toBe(Injector.SCOPE_PERLOOKUP);

		// topic module
		expect($injector.getScope('CatalogService')).toBe(Injector.SCOPE_SINGLETON);
	});
});
