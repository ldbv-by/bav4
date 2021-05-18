import { CatalogService } from '../services/CatalogService';
import { loadExampleCatalog } from '../services/provider/catalog.provider';

export const topicsModule = ($injector) => {
	$injector
		.registerSingleton('CatalogService', new CatalogService(loadExampleCatalog));
};