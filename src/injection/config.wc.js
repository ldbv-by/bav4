/**
 * @module injection/config_wc
 */
import { $injector } from '.';

import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { wcModule } from '../modules/wc/components/injection/index';
import { EnvironmentService } from '../services/EnvironmentService';

$injector
	.registerModule(wcModule)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.ready();

export const init = true;
