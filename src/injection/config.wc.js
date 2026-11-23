/**
 * @module injection/config_wc
 */

import { ViewService } from '@src/services/ViewService';
import { wcModule } from '../modules/wc/components/injection/index';
import { EnvironmentService } from '../services/EnvironmentService';
import { MapService } from '../services/MapService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { $injector } from '.';

const noopService = {};

$injector
	.registerModule(wcModule)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('ProjectionService', noopService)
	.registerSingleton('CoordinateService', noopService)
	.register('MapService', MapService)
	.register('ViewService', ViewService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService(false))
	.ready();

export const init = true;
