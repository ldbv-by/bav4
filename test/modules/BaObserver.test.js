import { BaObserver } from '../../src/modules/BaObserver';

class BaObserverNoImpl extends BaObserver {
}

describe('BaObserver', () => {

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new BaObserver()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #createView is called without overriding', () => {
				expect(() => new BaObserverNoImpl().register()).toThrowError(TypeError, 'Please implement abstract method #register or do not call super.register from child.');
			});
		});

	});
});