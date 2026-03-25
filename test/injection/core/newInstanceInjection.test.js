import { $injector } from './testsConfig';

/*
 * This will overwrite the current keys "HttpServer" and "RouterService" that are already registered as
 * singletons with instance dependencies.
 */
const instanceHttp = function () {
	this.get = "I'm a http service.";
};
const instanceRouter = function () {
	this.get = "I'm a router.";
};

$injector.register({
	HttpService: instanceHttp,
	RouterService: instanceRouter
});

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
	it('Has http service new instance', () => {
		expect(instance.http.get).toEqual("I'm a http service.");
	});

	it('Has router service new instance', () => {
		expect(instance.router.get).toEqual("I'm a router.");
	});
});
