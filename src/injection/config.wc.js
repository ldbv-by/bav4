/**
 * @module injection/config_wc
 */
import { $injector } from '.';

import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { wcModule } from '../modules/wc/components/injection/index';
import { EnvironmentService } from '../services/EnvironmentService';
import { MapService } from '../services/MapService';

const noopServiceClass = {};

$injector
	.registerModule(wcModule)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('ProjectionService', noopServiceClass)
	.registerSingleton('CoordinateService', noopServiceClass)
	.register('MapService', MapService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.ready();

export const init = true;
