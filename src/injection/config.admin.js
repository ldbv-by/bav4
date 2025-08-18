/**
 * @module injection/config_admin
 */
import { $injector } from '.';

import { AuthService } from '../services/AuthService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { BvvHttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { GlobalErrorPlugin } from '../plugins/GlobalErrorPlugin';

$injector
	.registerSingleton('AuthService', new AuthService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('TranslationService', new TranslationService())
	.registerSingleton('StoreService', {})
	.registerSingleton('GeoResourceService', {})
	.registerSingleton('GlobalErrorPlugin', new GlobalErrorPlugin())
	.ready();

export const init = true;
