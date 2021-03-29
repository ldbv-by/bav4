import { BaObserver } from '../../src/modules/BaObserver';

class BaObserverNoImpl extends BaObserver {
}

describe('BaObserver', () => {

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new BaObserver()).toThrowError(Error, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #createView is called without overriding', (done) => {

				new BaObserverNoImpl().register().then(() => {
					done(new Error('Promise should not be resolved'));
				}, (reason) => {
					expect(reason.message).toContain('Please implement abstract method #register or do not call super.register from child.');
					expect(reason).toBeInstanceOf(Error);
					done();
				});
			});
		});
	});
});