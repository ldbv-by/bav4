import { $injector, http, router } from './testsConfig';

//Test ES6 class
class classTest {
	constructor() {
		const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
		this.http = HttpService;
		this.router = RouterService;
	}
}

const instance = new classTest();

//tests
describe('ES6 Class Injection', () => {
	it('has http service', () => {
		expect(instance.http).toBe(http);
	});

	it('has router service', () => {
		expect(instance.router).toBe(router);
	});
});
