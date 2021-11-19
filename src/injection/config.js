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
import { MapService } from '../services/MapService';
import { mapModule } from '../modules/map/injection';
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
import { NotificationPlugin } from '../plugins/NotificationPlugin';
import { FeatureInfoPlugin } from '../plugins/FeatureInfoPlugin';
import { MainMenuPlugin } from '../plugins/MainMenuPlugin';
import { FeatureInfoService } from '../services/FeatureInfoService';
import { LayerInfoService } from '../modules/layerInfo/services/LayerInfoService';


$injector
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
	.register('AdministrationService', AdministrationService)
	.register('FeatureInfoService', FeatureInfoService)
	.registerSingleton('LayerInfoService', new LayerInfoService())

	.registerSingleton('DrawPlugin', new DrawPlugin())
	.registerSingleton('TopicsPlugin', new TopicsPlugin())
	.registerSingleton('LayersPlugin', new LayersPlugin())
	.registerSingleton('PositionPlugin', new PositionPlugin())
	.registerSingleton('HighlightPlugin', new HighlightPlugin())
	.registerSingleton('MediaPlugin', new MediaPlugin())
	.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
	.registerSingleton('NotificationPlugin', new NotificationPlugin())
	.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
	.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
	.registerSingleton('FeatureInfoPlugin', new FeatureInfoPlugin())
	.registerSingleton('MainMenuPlugin', new MainMenuPlugin())
	.registerModule(mapModule)
	.registerModule(topicsModule)
	.ready();



export const init = true;
