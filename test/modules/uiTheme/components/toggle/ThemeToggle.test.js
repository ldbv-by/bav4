/* eslint-disable no-undef */
import { ThemeToggle } from '../../../../../src/modules/uiTheme/components/toggle/ThemeToggle';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';

window.customElements.define(ThemeToggle.tag, ThemeToggle);
window.customElements.define(Toggle.tag, Toggle);

let store;

describe('ThemeToggle', () => {
	const setup = () => {
		const state = {
			media: {
				darkSchema: true
			}
		};
		store = TestUtils.setupStoreAndDi(state, {
			media: createNoInitialStateMediaReducer()
		});

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(ThemeToggle.tag);
	};

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('ba-toggle').title).toBe('uiTheme_toggle_tooltip_dark');
			expect(element.shadowRoot.querySelector('ba-toggle').checked).toBeTrue();
			expect(element.shadowRoot.querySelector('.icon.adjust')).toBeTruthy();
		});
	});

	describe('when toggle clicked', () => {
		it('changes the theme', async () => {
			const element = await setup();

			element.shadowRoot.querySelector('ba-toggle').click();

			expect(store.getState().media.darkSchema).toBeFalse();
			expect(element.shadowRoot.querySelector('ba-toggle').checked).toBeFalse();
			expect(element.shadowRoot.querySelector('ba-toggle').title).toBe('uiTheme_toggle_tooltip_light');
		});
	});
});
