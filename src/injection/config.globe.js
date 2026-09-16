import { GlobalErrorPlugin } from '@src/plugins/GlobalErrorPlugin';
import { $injector } from '.';
import { EnvironmentService } from '@src/services/EnvironmentService';
import { ProcessEnvConfigService } from '@src/services/ProcessEnvConfigService';
import { StoreService } from '@src/services/StoreService';
import { TranslationService } from '@src/services/TranslationService';
import { GeoResourceService } from '@src/services/GeoResourceService';
import { AuthService } from '@src/services/AuthService';
import { AuthPlugin } from '@src/plugins/AuthPlugin';
import { EmbedReadyPlugin } from '@src/plugins/EmbedReadyPlugin';
import { TopicsPlugin } from '@src/plugins/TopicsPlugin';
import { ChipsPlugin } from '@src/plugins/ChipsPlugin';
import { LayersPlugin } from '@src/plugins/LayersPlugin';
import { LegendsPlugin } from '@src/plugins/LegendsPlugin';
import { GeolocationPlugin } from '@src/plugins/GeolocationPlugin';
import { PositionPlugin } from '@src/plugins/PositionPlugin';
import { HighlightPlugin } from '@src/plugins/HighlightPlugin';
import { MediaPlugin } from '@src/plugins/MediaPlugin';
import { MeasurementPlugin } from '@src/plugins/MeasurementPlugin';
import { DrawPlugin } from '@src/plugins/DrawPlugin';
import { RoutingPlugin } from '@src/plugins/RoutingPlugin';

$injector
	.registerSingleton('AuthService', new AuthService())
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService())
	.registerSingleton('StoreService', {})
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.ready();

export const init = true;
