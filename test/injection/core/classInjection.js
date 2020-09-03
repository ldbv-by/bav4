import { $injector, http, router } from './testsConfig';


//Test ES6 class
class classTest {
	constructor(){
		const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
		this.http = HttpService;
		this.router = RouterService;
	}
};

var instance = new classTest();

//tests
describe('ES6 Class Injection', () => {
    it('Has http service', () => {
    expect(instance.http).toBe(http);
  });

  it('Has router service', () => {
    expect(instance.router).toBe(router);
  });
});