import './mockWindowProcess.js';
import '../../src/injection/config.admin.js';
import { $injector } from '../../src/injection/index.js';
import { Injector } from '../../src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(4);

		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('HttpService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('TranslationService')).toBe(Injector.SCOPE_SINGLETON);
	});
});
