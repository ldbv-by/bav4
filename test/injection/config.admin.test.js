import './mockWindowProcess.js';
import '../../src/injection/config.admin.js';
import { $injector } from '../../src/injection/index.js';
import { Injector } from '../../src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(9);

		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HttpService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('TranslationService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('AdminCatalogService')).toBe(Injector.SCOPE_SINGLETON);

		// TODO - Maybe Remove: Used to resolve dependencies needed for the frontend to work. Not used in the frontend but in the services below
		expect($injector.getScope('AuthService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('StoreService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('GeoResourceService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('GlobalErrorPlugin')).toBe(Injector.SCOPE_SINGLETON);
	});
});
