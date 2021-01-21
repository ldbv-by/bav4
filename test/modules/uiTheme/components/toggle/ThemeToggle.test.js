/* eslint-disable no-undef */
import { ThemeToggle } from '../../../../../src/modules/uiTheme/components/toggle/ThemeToggle';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { TestUtils } from '../../../../test-utils';
import { uiThemeReducer } from '../../../../../src/modules/uiTheme/store/uiTheme.reducer';
import { $injector } from '../../../../../src/injection';

window.customElements.define(ThemeToggle.tag, ThemeToggle);
window.customElements.define(Toggle.tag, Toggle);

let store;

describe('ThemeToggle', () => {

	const setup = () => {
		const state = {
			uiTheme: {
				theme: 'dark'
			}
		};
		store = TestUtils.setupStoreAndDi(state, {
			uiTheme: uiThemeReducer
		});

		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(ThemeToggle.tag);
	};

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('ba-toggle').title).toBe('uiTheme_toggle_tooltip_dark');
			expect(element.shadowRoot.querySelector('ba-toggle').getAttribute('checked')).toBe('true');
			expect(element.shadowRoot.querySelector('.icon.adjust')).toBeTruthy();
			// expect(element.shadowRoot.querySelector('.slider.round')).toBeTruthy();
		});
	});

	describe('when toggle clicked', () => {
		it('changes the theme', async () => {
			const element = await setup();
			
			element.shadowRoot.querySelector('ba-toggle').click();

			expect(store.getState().uiTheme.theme).toBe('light');
			expect(element.shadowRoot.querySelector('ba-toggle').getAttribute('checked')).toBe('false');
			expect(element.shadowRoot.querySelector('ba-toggle').title).toBe('uiTheme_toggle_tooltip_light');
		});
	});
});