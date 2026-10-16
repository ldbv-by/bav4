import './mockWindowProcess.js';
import '@src/injection/config.wc.js';
import { Injector } from '@src/injection/core/injector.js';
import { $injector } from '@src/injection/index.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBe(true);
		expect($injector.count()).toBe(6);

		expect($injector.getScope('StoreService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('EnvironmentService')).toBe(Injector.SCOPE_PERLOOKUP);
		expect($injector.getScope('ProjectionService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('CoordinateService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.getScope('ConfigService')).toBe(Injector.SCOPE_SINGLETON);
		expect($injector.inject('ConfigService')['ConfigService'].isLoggingEnabled()).toBe(false);
	});
});
