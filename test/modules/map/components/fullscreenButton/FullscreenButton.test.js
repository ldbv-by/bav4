import { FullScreenButton } from '@src/modules/map/components/fullscreenButton/FullScreenButton';
import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';
window.customElements.define(FullScreenButton.tag, FullScreenButton);

let store;

describe('FullScreenButton', () => {
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};
	let element;

	beforeEach(async () => {
		const state = {
			media: {
				fullscreen: false
			}
		};
		store = TestUtils.setupStoreAndDi(state, { media: createNoInitialStateMediaReducer() });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('MapService', mapServiceMock);

		element = await TestUtils.render(FullScreenButton.tag);
	});

	describe('when initialized', () => {
		it('adds a fullscreen button with correct initial state', async () => {
			expect(element.shadowRoot.querySelector('.fullscreen')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.fullscreen-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-active-fullscreen')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.icon.fullscreen-icon')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.fullscreen-button').title).toBe('map_interaction_button_container_fullscreen_on');
		});
	});

	describe('when clicked', () => {
		it('toggles fullscreen mode', () => {
			expect(store.getState().media.fullscreen).toBe(false);
			expect(element.shadowRoot.querySelector('.fullscreen-button').title).toBe('map_interaction_button_container_fullscreen_on');
			element.shadowRoot.querySelector('.fullscreen-button').click();

			expect(store.getState().media.fullscreen).toBe(true);
			expect(element.shadowRoot.querySelector('.fullscreen-button').title).toBe('map_interaction_button_container_fullscreen_off');

			element.shadowRoot.querySelector('.fullscreen-button').click();

			expect(store.getState().media.fullscreen).toBe(false);
			expect(element.shadowRoot.querySelector('.fullscreen-button').title).toBe('map_interaction_button_container_fullscreen_on');
		});
	});
});
