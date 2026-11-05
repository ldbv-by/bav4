import { BaPlugin } from '@src/plugins/BaPlugin';

class BaPluginNoImpl extends BaPlugin {}

describe('BaPlugin', () => {
	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new BaPlugin()).toThrowError(Error, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			describe('register', () => {
				it('throws exception when abstract #createView is called without overriding', async () => {
					try {
						await new BaPluginNoImpl().register();
						throw new Error('Promise should not be resolved');
					} catch (error) {
						expect(error.message).toContain('Please implement abstract method #register or do not call super.register from child.');
						expect(error).toBeInstanceOf(Error);
					}
				});
			});

			describe('_registerAndLogDuration', () => {
				it('registers the plugin, logs the duration, and returns the registration result', async () => {
					const plugin = new BaPluginNoImpl();
					const store = {};
					const result = {};
					const registerSpy = vi.spyOn(plugin, 'register').mockResolvedValue(result);
					const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

					const returnedResult = await plugin._registerAndLogDuration(store);

					expect(registerSpy).toHaveBeenCalledWith(store);
					expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^BaPluginNoImpl: \d+ms$/));
					expect(returnedResult).toBe(result);
				});
			});
		});
	});
});
