import './mockWindowProcess.js';
import '../../src/injection/config.admin.js';
import { $injector } from '../../src/injection/index.js';
import { Injector } from '../../src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(8);

		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HttpService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('TranslationService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('AdminCatalogService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('AuthService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('SecurityService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('StoreService')).toBe(Injector.SCOPE_SINGLETON);
	});
});
