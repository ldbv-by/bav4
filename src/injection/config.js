import { $injector } from '.';
import { StoreService } from '../services/StoreService';
import { OlCoordinateService } from '../services/OlCoordinateService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { NetworkStateSyncHttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { ShareService } from '../services/ShareService';
import { UnitsService } from '../services/UnitsService';
import { GeoResourceService } from '../services/GeoResourceService';
import { AltitudeService } from '../services/AltitudeService';
import { UrlService } from '../services/UrlService';
import { IconService } from '../services/IconService';
import { MapService } from '../services/MapService';
import { mapModule } from '../modules/olMap/injection';
import { AdministrationService } from '../services/AdministrationService';
import { TopicsService } from '../services/TopicsService';
import { topicsModule } from '../modules/topics/injection';
import { BvvFileStorageService } from '../services/FileStorageService';
import { LayersPlugin } from '../plugins/LayersPlugin';
import { PositionPlugin } from '../plugins/PositionPlugin';
import { TopicsPlugin } from '../plugins/TopicsPlugin';
import { HighlightPlugin } from '../plugins/HighlightPlugin';
import { SearchResultService } from '../modules/search/services/SearchResultService';
import { MediaPlugin } from '../plugins/MediaPlugin';
import { DrawPlugin } from '../plugins/DrawPlugin';
import { MeasurementPlugin } from '../plugins/MeasurementPlugin';
import { ContextClickPlugin } from '../plugins/ContextClickPlugin';
import { GeolocationPlugin } from '../plugins/GeolocationPlugin';
import { FeatureInfoPlugin } from '../plugins/FeatureInfoPlugin';
import { MainMenuPlugin } from '../plugins/MainMenuPlugin';
import { FeatureInfoService } from '../services/FeatureInfoService';
import { GeoResourceInfoService } from '../modules/geoResourceInfo/services/GeoResourceInfoService';
import { ImportVectorDataService } from '../services/ImportVectorDataService';
import { SourceTypeService } from '../services/SourceTypeService';
import { ImportPlugin } from '../plugins/ImportPlugin';
import { SecurityService } from '../services/SecurityService';
import { ImportWmsService } from '../services/ImportWmsService';
import { BaaCredentialService } from '../services/BaaCredentialService';
import { SearchPlugin } from '../plugins/SearchPlugin';
import { HistoryStatePlugin } from '../plugins/HistoryStatePlugin';
import { BvvMfpService } from '../services/MfpService';
import { ExportMfpPlugin } from '../plugins/ExportMfpPlugin';
import { Proj4JsService } from '../services/Proj4JsService';
import { BvvMfp3Encoder } from '../modules/olMap/services/Mfp3Encoder';


$injector
	.registerSingleton('Proj4JsService', new Proj4JsService())
	.register('HttpService', NetworkStateSyncHttpService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.register('CoordinateService', OlCoordinateService)
	.register('EnvironmentService', EnvironmentService)
	.register('MapService', MapService)
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('TopicsService', new TopicsService())
	.register('AltitudeService', AltitudeService)
	.register('SearchResultService', SearchResultService)
	.register('ShareService', ShareService)
	.register('UnitsService', UnitsService)
	.register('FileStorageService', BvvFileStorageService)
	.register('UrlService', UrlService)
	.registerSingleton('IconService', new IconService())
	.register('AdministrationService', AdministrationService)
	.register('FeatureInfoService', FeatureInfoService)
	.registerSingleton('GeoResourceInfoService', new GeoResourceInfoService())
	.register('ImportVectorDataService', ImportVectorDataService)
	.register('ImportWmsService', ImportWmsService)
	.register('SourceTypeService', SourceTypeService)
	.register('Mfp3Encoder', BvvMfp3Encoder)
	.registerSingleton('SecurityService', new SecurityService())
	.registerSingleton('BaaCredentialService', new BaaCredentialService())
	.registerSingleton('MfpService', new BvvMfpService())

	.registerSingleton('DrawPlugin', new DrawPlugin())
	.registerSingleton('TopicsPlugin', new TopicsPlugin())
	.registerSingleton('LayersPlugin', new LayersPlugin())
	.registerSingleton('PositionPlugin', new PositionPlugin())
	.registerSingleton('HighlightPlugin', new HighlightPlugin())
	.registerSingleton('MediaPlugin', new MediaPlugin())
	.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
	.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
	.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
	.registerSingleton('FeatureInfoPlugin', new FeatureInfoPlugin())
	.registerSingleton('MainMenuPlugin', new MainMenuPlugin())
	.registerSingleton('ImportPlugin', new ImportPlugin())
	.registerSingleton('SearchPlugin', new SearchPlugin())
	.registerSingleton('ExportMfpPlugin', new ExportMfpPlugin())
	.registerSingleton('HistoryStatePlugin', new HistoryStatePlugin())
	.registerModule(mapModule)
	.registerModule(topicsModule)
	.ready();



export const init = true;
