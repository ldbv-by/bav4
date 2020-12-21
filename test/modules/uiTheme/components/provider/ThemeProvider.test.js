/* eslint-disable no-undef */
import { ThemeProvider } from '../../../../../src/modules/uiTheme/components/provider/ThemeProvider';
import { TestUtils } from '../../../../test-utils';
import { changeTheme } from '../../../../../src/modules/uiTheme/store/uiTheme.action';
import { uiThemeReducer } from '../../../../../src/modules/uiTheme/store/uiTheme.reducer';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ThemeProvider.tag, ThemeProvider);

describe('ThemeProvider', () => {

	const setup = (config) => {
		const { window } = config;
		const state = {
			uiTheme: {
				theme: 'dark'
			}
		};
		TestUtils.setupStoreAndDi(state, {
			uiTheme: uiThemeReducer
		});


		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => window,
		});
		return TestUtils.render(ThemeProvider.tag);
	};

	describe('when initialized', () => {
		it('sets the correct theme class, a listener and renders nothing', async () => {
			const addSpy = jasmine.createSpy();
			const removeSpy = jasmine.createSpy();
			const addEventListenerSpy = jasmine.createSpy();
			const mockWindow = {
				document: {
					body: {
						classList: {
							add: addSpy,
							remove: removeSpy,
						}
					}
				},
				matchMedia: () => {
					return { addEventListener: addEventListenerSpy }; 
				}
			};

			await setup({ window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(addSpy).toHaveBeenCalledWith('dark-theme');
			expect(removeSpy).toHaveBeenCalledWith('light-theme');
			expect(addEventListenerSpy).toHaveBeenCalled;
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
							remove: removeSpy,
						}
					}
				},
				matchMedia: () => {
					return { addEventListener: () => { } }; 
				}
			};

			await setup({ window: mockWindow });
			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(addSpy).toHaveBeenCalledWith('dark-theme');
			expect(removeSpy).toHaveBeenCalledWith('light-theme');

			changeTheme('light');

			expect(addSpy).toHaveBeenCalledTimes(2);
			expect(removeSpy).toHaveBeenCalledTimes(2);
			expect(addSpy).toHaveBeenCalledWith('light-theme');
			expect(removeSpy).toHaveBeenCalledWith('dark-theme');
		});
	});
});