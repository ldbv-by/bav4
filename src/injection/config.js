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
import { LayersPlugin } from '../store/layers/LayersPlugin';
import { PositionPlugin } from '../store/position/PositionPlugin';
import { TopicsPlugin } from '../store/topics/TopicsPlugin';
import { HighlightPlugin } from '../store/highlight/HighlightPlugin';
import { SearchResultService } from '../modules/search/services/SearchResultService';
import { MediaPlugin } from '../store/media/MediaPlugin';
import { FeatureInfoPlugin } from '../store/featureInfo/FeatureInfoPlugin';


$injector
	.registerSingleton('HttpService', new NetworkStateSyncHttpService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.registerSingleton('CoordinateService', new OlCoordinateService())
	.registerSingleton('EnvironmentService', new EnvironmentService())
	.registerSingleton('MapService', new MapService())
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('TopicsService', new TopicsService())
	.registerSingleton('AltitudeService', new AltitudeService())
	.registerSingleton('SearchResultService', new SearchResultService())
	.registerSingleton('ShareService', new ShareService())
	.register('UnitsService', UnitsService)
	.register('FileStorageService', BvvFileStorageService)
	.register('UrlService', UrlService)
	.registerSingleton('AdministrationService', new AdministrationService())
	.registerSingleton('TopicsPlugin', new TopicsPlugin())
	.registerSingleton('LayersPlugin', new LayersPlugin())
	.registerSingleton('PositionPlugin', new PositionPlugin())
	.registerSingleton('HighlightPlugin', new HighlightPlugin())
	.registerSingleton('MediaPlugin', new MediaPlugin())
	.registerSingleton('FeatureInfoPlugin', new FeatureInfoPlugin())
	.registerModule(mapModule)
	.registerModule(topicsModule)
	.ready();



export const init = true;
