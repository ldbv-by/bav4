import { $injector, http, router } from './testsConfig';

//test proto
var protoTest = function() {
	var { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
	return { HttpService, RouterService };
};

//tests
describe('Function Injection', () => {

	it('Has http service', () => {
		expect(protoTest().HttpService).toBe(http);
	});

	it('Has router service', () => {
		expect(protoTest().RouterService).toBe(router);
	});
});