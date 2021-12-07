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
			it('throws exception when abstract #createView is called without overriding', async () => {

				try {
					await new BaPluginNoImpl().register();
					throw new Error('Promise should not be resolved');
				}
				catch (error) {
					expect(error.message).toContain('Please implement abstract method #register or do not call super.register from child.');
					expect(error).toBeInstanceOf(Error);
				}
			});
		});
	});
});
