import { AdminCatalogService } from '../services/AdminCatalogService';

export const adminModule = ($injector) => {
	$injector.registerSingleton('AdminCatalogService', new AdminCatalogService());
};
