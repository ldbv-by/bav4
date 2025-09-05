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
import { adminModule } from '../modules/admin/injection';

$injector
	.registerSingleton('AuthService', new AuthService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('TranslationService', new TranslationService())
	.registerSingleton('StoreService', {
		// TODO Remove later. Temporarily mocked..
		getStore: () => {
			return {
				dispatch: () => {}
			};
		}
	})
	.registerSingleton('GeoResourceService', {
		// TODO Remove later. Temporarily mocked..
	})
	.registerSingleton('GlobalErrorPlugin', new GlobalErrorPlugin())
	.registerModule(adminModule)
	.ready();

export const init = true;
