import { $injector } from '.';
import { StoreService } from '../store/StoreService';
import { OlCoordinateService } from '../utils/OlCoordinateService';
import { EnvironmentService } from '../utils/EnvironmentService';
import { BvvSearchService } from '../components/toolbox/search/autocomplete/service/BvvSearchService';
import { ProcessEnvConfigService } from '../utils/ProcessEnvConfigService';
import { HttpService } from '../utils/HttpService';

const router = { get: 'I\'m a router.' };

$injector
	.register('HttpService', HttpService)
	.registerSingleton('RouterService', router)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('EnvironmentService', new EnvironmentService(window))
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('SearchService', new BvvSearchService());


export let init = true;