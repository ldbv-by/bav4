import { $injector } from '.';
import { StoreService } from '../store/StoreService';
import { OlCoordinateService } from '../utils/OlCoordinateService';
import { EnvironmentService } from '../utils/EnvironmentService';
import { BvvSearchService } from '../components/toolbox/search/autocomplete/service/BvvSearchService';
import { ProcessEnvConfigService } from '../utils/ProcessEnvConfigService';

const http = { get: 'I\'m a http service.' };
const router = { get: 'I\'m a router.' };

$injector
	.registerSingleton('HttpService', http)
	.registerSingleton('RouterService', router)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('EnvironmentService', new EnvironmentService(window))
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('SearchService', new BvvSearchService());


export let init = true;