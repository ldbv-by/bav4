import { $injector } from '.';
import { StoreService } from '../services/StoreService';
import { OlCoordinateService } from '../services/OlCoordinateService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { HttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { ShareService } from '../services/ShareService';
import { GeoResourceService } from '../services/GeoResourceService';
import { AltitudeService } from '../services/AltitudeService'; 
import { UrlService } from '../services/UrlService';
import { SearchResultProviderService } from '../modules/search/services/SearchResultProviderService';
import { MapService } from '../services/MapService';
import { mapModule } from '../modules/map/injection';
import { topicsModule } from '../modules/topics/injection';
import { AdministrationService } from  '../services/AdministrationService'; 
import { TopicsService } from '../services/TopicsService';
import { BvvFileStorageService } from '../services/FileStorageService';


$injector
	.register('HttpService', HttpService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.registerSingleton('CoordinateService', new OlCoordinateService())
	.registerSingleton('EnvironmentService', new EnvironmentService())
	.registerSingleton('MapService', new MapService())
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('TopicsService', new TopicsService())
	.registerSingleton('AltitudeService', new AltitudeService())
	.registerSingleton('SearchResultProviderService', new SearchResultProviderService())
	.registerSingleton('ShareService', new ShareService())
	.register('FileStorageService', BvvFileStorageService)
	.register('UrlService', UrlService)
	.registerSingleton('AdministrationService', new AdministrationService())
	.registerModule(topicsModule)
	.registerModule(mapModule)
	.ready();
	


export const init = true;
