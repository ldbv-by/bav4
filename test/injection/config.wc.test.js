import './mockWindowProcess.js';
import '../../src/injection/config.wc.js';
import { $injector } from '../../src/injection/index.js';
import { Injector } from '../../src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBeTrue();
		expect($injector.count()).toBe(6);

		expect($injector.getScope('StoreService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('ProjectionService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('CoordinateService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
	});
});
