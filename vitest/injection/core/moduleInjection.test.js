import { Injector } from '../../../src/injection/core/injector';
import { myModule } from './moduleConfig';

describe('Module Injection', () => {
	const $injector = new Injector();
	$injector.registerModule(myModule);

	it('Has http and route service', () => {
		const { HttpService: httpService, RouterService: routerService } = $injector.inject('HttpService', 'RouterService');
		expect(httpService.get).toBe("I'm a http service.");
		expect(routerService.get).toBe("I'm a router.");
	});
});
