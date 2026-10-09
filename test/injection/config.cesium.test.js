import './mockWindowProcess.js';
import '@src/injection/config.cesium.js';
import { $injector } from '@src/injection/index.js';
import { Injector } from '@src/injection/core/injector.js';

describe('injector configuration', () => {
	it('registers the expected dependencies', () => {
		expect($injector.isReady()).toBe(false);
		expect($injector.count()).toBe(1);

		// cs module
		expect($injector.getScope('CsLayerService')).toBe(Injector.SCOPE_PERLOOKUP);
	});
});
