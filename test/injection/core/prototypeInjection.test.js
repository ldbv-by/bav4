import { $injector, http, router } from './testsConfig';

//test proto
let protoTest = function() {
	let { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
	this.http = HttpService;
	this.router = RouterService;
};

let instance = new protoTest();

//tests
describe('Prototype Constructor Injection', () => {

	it('Has http service', () => {
		expect(instance.http).toBe(http);
	});

	it('Has router service', () => {
		expect(instance.router).toBe(router);
	});
});