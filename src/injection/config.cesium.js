/**
 * @module injection/config_cesium
 */

import { csModule } from '@src/modules/csGlobe/injection';
import { $injector } from '.';

$injector.registerModule(csModule);
