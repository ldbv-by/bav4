/**
 * @module injection/config_cesium
 */
import { $injector } from '.';
import { csModule } from '@src/modules/csGlobe/injection';

$injector.registerModule(csModule);
