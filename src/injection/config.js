import { $injector } from '.';
import { StoreService } from '../services/StoreService';
import { OlCoordinateService } from '../services/OlCoordinateService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { HttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { ShareService } from '../services/ShareService';
import { GeoResourceService } from '../services/GeoResourceService';
import { loadBvvGeoResources } from '../services/domain/geoResource.provider';
import { UrlService } from '../services/UrlService';
import { SearchResultProviderService } from '../modules/search/services/SearchResultProviderService';
import { loadBvvLocationSearchResults, loadBvvGeoResourceSearchResults } from '../modules/search/services/searchResult.provider';
import { getBvvMapDefinitions } from '../services/provider/mapDefinitions.provider';
import { MapService } from '../services/MapService';


$injector
	.register('HttpService', HttpService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('EnvironmentService', new EnvironmentService(window))
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService(loadBvvGeoResources))
	.registerSingleton('SearchResultProviderService', new SearchResultProviderService(loadBvvLocationSearchResults, loadBvvGeoResourceSearchResults))
	.registerSingleton('ShareService', new ShareService(navigator))
	.register('UrlService', UrlService)
	.register('MapService', new MapService(getBvvMapDefinitions));


export let init = true;