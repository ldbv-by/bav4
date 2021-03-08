import { Injector } from '../../../src/injection/core/injector';
import { myModule } from './moduleConfig';

describe('Injector', () => {

	let $injector;

	beforeEach(() => {
		$injector = new Injector();
	});

	describe('registerModule', () => {

		it('returns the injector instance', () => {

			const returnValue = $injector.registerModule(myModule);

			expect(returnValue).toEqual($injector);
		});
	});

	describe('registerSingleton', () => {

		it('returns the injector instance', () => {

			const returnValue = $injector.registerSingleton('HttpService', { get: 'I\'m a router.' });

			expect(returnValue).toEqual($injector);
		});
	});

	describe('register', () => {

		it('returns the injector instance', () => {

			const instanceHttp = () => {
				this.get = 'I\'m a http service.';
			};

			const returnValue = $injector.register('HttpService', instanceHttp);

			expect(returnValue).toEqual($injector);
		});
	});

	describe('reset', () => {

		it('returns the injector instance', () => {

			const returnValue = $injector.reset();

			expect(returnValue).toEqual($injector);
		});
	});
});