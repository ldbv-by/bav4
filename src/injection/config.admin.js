/**
 * @module injection/config_admin
 */
import { $injector } from '.';

import { AuthService } from '../services/AuthService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { BvvHttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { adminModule } from '../modules/admin/injection';
import { SecurityService } from '../services/SecurityService';
import { ShareService } from '../services/ShareService';

$injector
	.registerSingleton('AuthService', new AuthService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.register('ShareService', ShareService)
	.registerSingleton('TranslationService', new TranslationService())
	.registerSingleton('SecurityService', new SecurityService())
	.registerModule(adminModule)
	.ready();

export const init = true;
