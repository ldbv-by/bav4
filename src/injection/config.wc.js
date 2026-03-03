/**
 * @module injection/config_wc
 */
import { $injector } from '.';

import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { wcModule } from '../modules/wc/components/injection/index';
import { EnvironmentService } from '../services/EnvironmentService';
import { MapService } from '../services/MapService';

const noopService = {};

$injector
	.registerModule(wcModule)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('ProjectionService', noopService)
	.registerSingleton('CoordinateService', noopService)
	.register('MapService', MapService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService(false))
	.ready();

export const init = true;
