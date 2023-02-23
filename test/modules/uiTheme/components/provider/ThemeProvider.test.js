/* eslint-disable no-undef */
import { ThemeProvider } from '../../../../../src/modules/uiTheme/components/provider/ThemeProvider';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { setIsDarkSchema } from '../../../../../src/store/media/media.action';

window.customElements.define(ThemeProvider.tag, ThemeProvider);

describe('ThemeProvider', () => {
	const setup = (config) => {
		const { window } = config;
		const state = {
			media: {
				darkSchema: true
			}
		};
		TestUtils.setupStoreAndDi(state, {
			media: createNoInitialStateMediaReducer()
		});

		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => window
		});
		return TestUtils.render(ThemeProvider.tag);
	};

	describe('when initialized', () => {
		it('sets the correct theme class, a listener and renders nothing', async () => {
			const addSpy = jasmine.createSpy();
			const removeSpy = jasmine.createSpy();
			const mockWindow = {
				document: {
					body: {
						classList: {
							add: addSpy,
							remove: removeSpy
						}
					}
				}
			};

			await setup({ window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(addSpy).toHaveBeenCalledWith('dark-theme');
			expect(removeSpy).toHaveBeenCalledWith('light-theme');
		});
	});

	describe('when theme changed', () => {
		it('updates the css class', async () => {
			const addSpy = jasmine.createSpy();
			const removeSpy = jasmine.createSpy();
			const mockWindow = {
				document: {
					body: {
						classList: {
							add: addSpy,
							remove: removeSpy
						}
					}
				}
			};

			await setup({ window: mockWindow });
			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(addSpy).toHaveBeenCalledWith('dark-theme');
			expect(removeSpy).toHaveBeenCalledWith('light-theme');

			setIsDarkSchema(false);

			expect(addSpy).toHaveBeenCalledTimes(2);
			expect(removeSpy).toHaveBeenCalledTimes(2);
			expect(addSpy).toHaveBeenCalledWith('light-theme');
			expect(removeSpy).toHaveBeenCalledWith('dark-theme');
		});
	});
});
