import './mockWindowProcess.js';
import { BvvFileStorageService, TempStorageService } from '../../src/services/FileStorageService.js';
import { fileStorageServiceFactory } from '../../src/injection/factories.js';
import { $injector } from '../../src/injection/index.js';

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
		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);

		expect(fileStorageServiceFactory() instanceof TempStorageService).toBeTrue();
		// must be same instance
		expect(fileStorageServiceFactory() === fileStorageServiceFactory()).toBeTrue();
	});

	it('provides a (singleton) FileStorageService for standalone mode', () => {
		spyOn(environmentService, 'isStandalone').and.returnValue(true);

		expect(fileStorageServiceFactory() instanceof TempStorageService).toBeTrue();
		// must be same instance
		expect(fileStorageServiceFactory() === fileStorageServiceFactory()).toBeTrue();
	});

	it('provides a FileStorageService for default mode', () => {
		expect(fileStorageServiceFactory() instanceof BvvFileStorageService).toBeTrue();
	});
});
