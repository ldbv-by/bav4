import { Injector } from '../../../src/injection/core/injector';
const $injector = new Injector();
const httpService = {
	get: () => "I'm a http service."
};
const routerService = {
	get: () => "I'm a router."
};
$injector.registerFactory('HttpService', () => httpService);
$injector.registerFactory('RouterService', () => routerService);
class ClassTest {
	constructor() {
		const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
		this.http = HttpService;
		this.router = RouterService;
	}
}
const instance = new ClassTest();

describe('ES6 Class Injection', () => {
	it('injected a http service instance', () => {
		expect(instance.http.get()).toEqual("I'm a http service.");
	});

	it('injected a router service instance', () => {
		expect(instance.router.get()).toEqual("I'm a router.");
	});
});
