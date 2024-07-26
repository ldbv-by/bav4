import { BvvFileStorageService, TempStorageService } from '../services/FileStorageService';
import { $injector } from './index';

const tempStorageService = new TempStorageService();
export const fileStorageServiceFactory = () => {
	const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

	return environmentService.isEmbeddedAsWC() || environmentService.isStandalone() ? tempStorageService : new BvvFileStorageService();
};
