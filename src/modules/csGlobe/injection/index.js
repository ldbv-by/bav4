import { CsLayerService } from '../services/CsLayerService';

export const csModule = ($injector) => {
	$injector.register('CsLayerService', CsLayerService);
};
