import { AdminStoreService } from '../services/AdminStoreService';
import { BvvAdminCatalogService } from '../services/AdminCatalogService';

export const adminModule = ($injector) => {
	$injector.registerSingleton('StoreService', new AdminStoreService());
	$injector.registerSingleton('AdminCatalogService', new BvvAdminCatalogService());
};
