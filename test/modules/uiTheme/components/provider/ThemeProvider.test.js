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

			const toggleSpy = jasmine.createSpy();
			const addEventListenerSpy = jasmine.createSpy();
			const mockWindow = {
				document: {
					body: {
						classList: {
							toggle: toggleSpy
						}
					}
				},
				matchMedia: () => {
					return { addEventListener: addEventListenerSpy }; 
				}
			};

			await setup({ window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(toggleSpy).toHaveBeenCalledWith('dark-theme');
			expect(addEventListenerSpy).toHaveBeenCalled;
		});
	});

	describe('when theme changed', () => {
		it('updates the css class', async () => {
			const toggleSpy = jasmine.createSpy();
			const mockWindow = {
				document: {
					body: {
						classList: {
							toggle: toggleSpy
						}
					}
				},
				matchMedia: () => {
					return { addEventListener: () => { } }; 
				}
			};

			await setup({ window: mockWindow });
			expect(document.body.innerHTML).toBe('<ba-theme-provider></ba-theme-provider>');
			expect(toggleSpy).toHaveBeenCalledWith('dark-theme');

			changeTheme('light');

			expect(toggleSpy).toHaveBeenCalledWith('light-theme');
			expect(toggleSpy).toHaveBeenCalledTimes(2);
		});
	});
});