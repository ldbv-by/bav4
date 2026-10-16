import { BvvAdminCatalogService } from '../services/AdminCatalogService';
import { AdminStoreService } from '../services/AdminStoreService';

export const adminModule = ($injector) => {
	$injector.registerSingleton('StoreService', new AdminStoreService());
	$injector.registerSingleton('AdminCatalogService', new BvvAdminCatalogService());
};
