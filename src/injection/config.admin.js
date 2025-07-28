import { $injector } from '.';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { BvvHttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';

$injector

	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('TranslationService', new TranslationService())

	.ready();

export const init = true;
