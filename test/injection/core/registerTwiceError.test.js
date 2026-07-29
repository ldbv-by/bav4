import { $injector } from './testsConfig';
const mockService = { get: "I'm a mock. " };

//tests
describe('Registration', () => {
	it('with double Dependency throws error', () => {
		const registerDouble = () => {
			$injector.register('MockService', mockService);
			$injector.register('MockService', mockService);
		};

		expect(registerDouble).toThrowError('Instance already registered for MockService');
	});
});
