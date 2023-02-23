import { CatalogService } from '../services/CatalogService';

export const topicsModule = ($injector) => {
	$injector.registerSingleton('CatalogService', new CatalogService());
};
