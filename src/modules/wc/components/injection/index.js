import { WcStoreService } from '../../services/WcStoreService';

export const wcModule = ($injector) => {
	$injector.registerSingleton('StoreService', new WcStoreService());
};
