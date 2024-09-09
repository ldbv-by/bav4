import { $injector } from '.';
import { StoreService } from '../services/StoreService';
import { OlCoordinateService } from '../services/OlCoordinateService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { BvvHttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { ShareService } from '../services/ShareService';
import { UnitsService } from '../services/UnitsService';
import { FileSaveService } from '../services/FileSaveService';
import { GeoResourceService } from '../services/GeoResourceService';
import { UrlService } from '../services/UrlService';
import { IconService } from '../services/IconService';
import { MapService } from '../services/MapService';
import { mapModule } from '../modules/olMap/injection';
import { AdministrationService } from '../services/AdministrationService';
import { TopicsService } from '../services/TopicsService';
import { topicsModule } from '../modules/topics/injection';
import { LayersPlugin } from '../plugins/LayersPlugin';
import { PositionPlugin } from '../plugins/PositionPlugin';
import { TopicsPlugin } from '../plugins/TopicsPlugin';
import { ChipsPlugin } from '../plugins/ChipsPlugin';
import { HighlightPlugin } from '../plugins/HighlightPlugin';
import { SearchResultService } from '../modules/search/services/SearchResultService';
import { MediaPlugin } from '../plugins/MediaPlugin';
import { DrawPlugin } from '../plugins/DrawPlugin';
import { MeasurementPlugin } from '../plugins/MeasurementPlugin';
import { ContextClickPlugin } from '../plugins/ContextClickPlugin';
import { GeolocationPlugin } from '../plugins/GeolocationPlugin';
import { FeatureInfoPlugin } from '../plugins/FeatureInfoPlugin';
import { MainMenuPlugin } from '../plugins/MainMenuPlugin';
import { NavigationRailPlugin } from '../plugins/NavigationRailPlugin';
import { FeatureInfoService } from '../services/FeatureInfoService';
import { GeoResourceInfoService } from '../modules/geoResourceInfo/services/GeoResourceInfoService';
import { ImportVectorDataService } from '../services/ImportVectorDataService';
import { OlExportVectorDataService } from '../services/ExportVectorDataService';
import { SourceTypeService } from '../services/SourceTypeService';
import { ImportPlugin } from '../plugins/ImportPlugin';
import { SecurityService } from '../services/SecurityService';
import { ImportWmsService } from '../services/ImportWmsService';
import { BaaCredentialService } from '../services/BaaCredentialService';
import { SearchPlugin } from '../plugins/SearchPlugin';
import { EncodeStatePlugin } from '../plugins/EncodeStatePlugin';
import { BvvMfpService } from '../services/MfpService';
import { ChipsConfigurationService } from '../services/ChipsConfigurationService';
import { TimeTravelService } from '../services/TimeTravelService';
import { ExportMfpPlugin } from '../plugins/ExportMfpPlugin';
import { Proj4JsService } from '../services/Proj4JsService';
import { BvvMfp3Encoder } from '../modules/olMap/services/Mfp3Encoder';
import { ElevationProfilePlugin } from '../plugins/ElevationProfilePlugin';
import { ElevationService } from '../services/ElevationService';
import { IframeStatePlugin } from '../plugins/IframeStatePlugin';
import { ObserveStateForEncodingPlugin } from '../plugins/ObserveStateForEncodingPlugin';
import { SharePlugin } from '../plugins/SharePlugin';
import { FeedbackService } from '../services/FeedbackService';
import { IframeContainerPlugin } from '../plugins/IframeContainerPlugin';
import { ToolsPlugin } from '../plugins/ToolsPlugin';
import { IframeGeometryIdPlugin } from '../plugins/IframeGeometryIdPlugin';
import { BeforeUnloadPlugin } from '../plugins/BeforeUnloadPlugin';
import { BvvRoutingService } from '../services/RoutingService';
import { RoutingPlugin } from '../plugins/RoutingPlugin';
import { AuthService } from '../services/AuthService';
import { GlobalErrorPlugin } from '../plugins/GlobalErrorPlugin';
import { AuthPlugin } from '../plugins/AuthPlugin';
import { ObserveWcAttributesPlugin } from '../plugins/ObserveWcAttributesPlugin';
import { fileStorageServiceFactory } from './factories';
import { FileStoragePlugin } from '../plugins/FileStoragePlugin';

$injector
	.registerSingleton('ProjectionService', new Proj4JsService())
	.registerSingleton('AuthService', new AuthService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('TranslationService', new TranslationService())
	.register('CoordinateService', OlCoordinateService)
	.register('MapService', MapService)
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('TopicsService', new TopicsService())
	.registerSingleton('ElevationService', new ElevationService())
	.register('SearchResultService', SearchResultService)
	.register('ShareService', ShareService)
	.register('UnitsService', UnitsService)
	.register('FileSaveService', FileSaveService)
	.registerFactory('FileStorageService', fileStorageServiceFactory)
	.register('UrlService', UrlService)
	.registerSingleton('IconService', new IconService())
	.register('AdministrationService', AdministrationService)
	.register('FeatureInfoService', FeatureInfoService)
	.registerSingleton('GeoResourceInfoService', new GeoResourceInfoService())
	.register('ImportVectorDataService', ImportVectorDataService)
	.register('ExportVectorDataService', OlExportVectorDataService)
	.register('ImportWmsService', ImportWmsService)
	.registerSingleton('SourceTypeService', new SourceTypeService())
	.register('Mfp3Encoder', BvvMfp3Encoder)
	.registerSingleton('SecurityService', new SecurityService())
	.registerSingleton('BaaCredentialService', new BaaCredentialService())
	.registerSingleton('MfpService', new BvvMfpService())
	.registerSingleton('ChipsConfigurationService', new ChipsConfigurationService())
	.registerSingleton('TimeTravelService', new TimeTravelService())
	.registerSingleton('FeedbackService', new FeedbackService())
	.registerSingleton('RoutingService', new BvvRoutingService())

	.registerSingleton('GlobalErrorPlugin', new GlobalErrorPlugin())
	.registerSingleton('AuthPlugin', new AuthPlugin())
	.registerSingleton('DrawPlugin', new DrawPlugin())
	.registerSingleton('RoutingPlugin', new RoutingPlugin())
	.registerSingleton('TopicsPlugin', new TopicsPlugin())
	.registerSingleton('ChipsPlugin', new ChipsPlugin())
	.registerSingleton('LayersPlugin', new LayersPlugin())
	.registerSingleton('PositionPlugin', new PositionPlugin())
	.registerSingleton('HighlightPlugin', new HighlightPlugin())
	.registerSingleton('MediaPlugin', new MediaPlugin())
	.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
	.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
	.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
	.registerSingleton('FeatureInfoPlugin', new FeatureInfoPlugin())
	.registerSingleton('MainMenuPlugin', new MainMenuPlugin())
	.registerSingleton('NavigationRailPlugin', new NavigationRailPlugin())
	.registerSingleton('ImportPlugin', new ImportPlugin())
	.registerSingleton('SearchPlugin', new SearchPlugin())
	.registerSingleton('ExportMfpPlugin', new ExportMfpPlugin())
	.registerSingleton('ElevationProfilePlugin', new ElevationProfilePlugin())
	.registerSingleton('IframeStatePlugin', new IframeStatePlugin())
	.registerSingleton('IframeContainerPlugin', new IframeContainerPlugin())
	.registerSingleton('SharePlugin', new SharePlugin())
	.registerSingleton('ToolsPlugin', new ToolsPlugin())
	.registerSingleton('FileStoragePlugin', new FileStoragePlugin())
	.registerSingleton('BeforeUnloadPlugin', new BeforeUnloadPlugin())
	.registerSingleton('IframeGeometryIdPlugin', new IframeGeometryIdPlugin())
	.registerSingleton('ObserveWcAttributesPlugin', new ObserveWcAttributesPlugin())
	.registerSingleton('EncodeStatePlugin', new EncodeStatePlugin())
	.registerSingleton('ObserveStateForEncodingPlugin', new ObserveStateForEncodingPlugin())
	.registerModule(mapModule)
	.registerModule(topicsModule)
	.ready();

export const init = true;
