import { BaPlugin } from '../../src/plugins/BaPlugin';

class BaPluginNoImpl extends BaPlugin {
}

describe('BaPlugin', () => {

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new BaPlugin()).toThrowError(Error, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #createView is called without overriding', (done) => {

				new BaPluginNoImpl().register().then(() => {
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
