import './mockWindowProcess.js';
import { BvvFileStorageService, TempStorageService } from '@src/services/FileStorageService.js';
import { fileStorageServiceFactory } from '@src/injection/factories.js';
import { $injector } from '@src/injection/index.js';

describe('fileStorageServiceFactory', () => {
	const environmentService = {
		isEmbeddedAsWC: () => false,
		isStandalone: () => false
	};

	beforeAll(() => {
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('ConfigService', {}).registerSingleton('HttpService', {});
	});

	afterAll(() => {
		$injector.reset();
	});

	it('provides a (singleton) FileStorageService for embed mode', () => {
		vi.spyOn(environmentService, 'isEmbeddedAsWC').mockReturnValue(true);

		expect(fileStorageServiceFactory() instanceof TempStorageService).toBe(true);
		// must be same instance
		expect(fileStorageServiceFactory() === fileStorageServiceFactory()).toBe(true);
	});

	it('provides a (singleton) FileStorageService for standalone mode', () => {
		vi.spyOn(environmentService, 'isStandalone').mockReturnValue(true);

		expect(fileStorageServiceFactory() instanceof TempStorageService).toBe(true);
		// must be same instance
		expect(fileStorageServiceFactory() === fileStorageServiceFactory()).toBe(true);
	});

	it('provides a FileStorageService for default mode', () => {
		expect(fileStorageServiceFactory() instanceof BvvFileStorageService).toBe(true);
	});
});
