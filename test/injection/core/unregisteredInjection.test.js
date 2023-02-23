import { $injector } from './testsConfig';
const mockService = { get: "I'm a mock. " };

$injector.registerSingleton({
	MockService: mockService
});

class RegistrationTest {
	constructor(serviceName) {
		this.service = $injector.inject(serviceName);
	}
}

//tests
describe('Injection Name does not match with dependency', () => {
	it('MockService Injected / Registered', () => {
		const testObj = new RegistrationTest('MockService');
		expect(testObj.service).toEqual({ MockService: mockService });
	});

	it('UnknownService throws Error on Injecting', () => {
		expect(() => {
			new RegistrationTest('FooService');
		}).toThrowError('No registered instance found for FooService');
	});
});
