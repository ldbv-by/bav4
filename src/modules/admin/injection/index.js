import { BvvAdminCatalogService } from '../services/AdminCatalogService';

export const adminModule = ($injector) => {
	$injector.registerSingleton('AdminCatalogService', new BvvAdminCatalogService());
};
