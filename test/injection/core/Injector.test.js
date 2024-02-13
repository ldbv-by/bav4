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
			const returnValue = $injector.registerSingleton('HttpService', { get: "I'm a router." });

			expect(returnValue).toEqual($injector);
		});
	});

	describe('register', () => {
		it('returns the injector instance', () => {
			const instanceHttp = () => {
				this.get = "I'm a http service.";
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

		it('resets the ready flag', () => {
			$injector.ready();
			const returnValue = $injector.reset();

			expect(returnValue.isReady()).toBeFalse();
		});
	});

	describe('getId', () => {
		it('returns the Id of the instance', () => {
			expect($injector.getId().startsWith('injector')).toBeTrue();
			expect($injector.getId()).not.toBe(new Injector().getId());
		});
	});

	describe('ready and isReady', () => {
		it('sets a flag and calls the listeners', () => {
			const spy = jasmine.createSpy();
			$injector.onReady(spy);

			expect($injector.isReady()).toBeFalse();

			$injector.ready();

			expect(spy).toHaveBeenCalledTimes(1);
			expect($injector.isReady()).toBeTrue();
		});

		it('warns when already set ready', () => {
			const warnSpy = spyOn(console, 'warn');

			$injector.ready();
			$injector.ready();

			expect(warnSpy).toHaveBeenCalledOnceWith('Injector already marked as ready!');
		});
	});

	describe('getScope', () => {
		it('returns the scope of a dependency', () => {
			const instanceHttp = () => {
				this.get = "I'm a http service.";
			};
			$injector.register('HttpService', instanceHttp).registerSingleton('RouterService', { get: "I'm a router." });

			expect($injector.getScope('HttpService')).toBe(Injector.SCOPE_PERLOOKUP);
			expect($injector.getScope('RouterService')).toBe(Injector.SCOPE_SINGLETON);
			expect($injector.getScope('Foo')).toBeNull();
		});
	});

	describe('count', () => {
		it('returns the count of registered dependencies', () => {
			const instanceHttp = () => {
				this.get = "I'm a http service.";
			};
			$injector.register('HttpService', instanceHttp).registerSingleton('RouterService', { get: "I'm a router." });

			expect($injector.count()).toBe(2);
		});
	});

	describe('static getter', () => {
		it('returns the SCOPE_PERLOOKUP and the SCOPE_SINGLETON keys', () => {
			expect(Injector.SCOPE_PERLOOKUP).toBe('PerLookup');
			expect(Injector.SCOPE_SINGLETON).toBe('Singleton');
		});
	});
});
