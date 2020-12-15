import { $injector } from '.';
import { StoreService } from '../store/StoreService';
import { OlCoordinateService } from '../utils/OlCoordinateService';
import { EnvironmentService } from '../utils/EnvironmentService';
import { BvvSearchService } from '../components/toolbox/search/autocomplete/service/BvvSearchService';
import { ProcessEnvConfigService } from '../utils/ProcessEnvConfigService';
import { HttpService } from '../utils/HttpService';
import { TranslationService } from '../utils/TranslationService';


$injector
	.register('HttpService', HttpService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.register('CoordinateService', OlCoordinateService)
	.registerSingleton('EnvironmentService', new EnvironmentService(window))
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('SearchService', new BvvSearchService());


export let init = true;