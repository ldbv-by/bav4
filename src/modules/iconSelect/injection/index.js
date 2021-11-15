import { IconService } from '../services/IconService';

export const iconSelectModule = ($injector) => {
	$injector.registerSingleton('IconService', new IconService());
};
