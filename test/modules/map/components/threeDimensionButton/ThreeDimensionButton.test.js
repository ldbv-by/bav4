import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { ThreeDimensionButton } from '@src/modules/map/components/threeDimensionButton/ThreeDimensionButton.js';
import { viewReducer } from '@src/store/view/view.reducer.js';
import { ViewMode } from '@src/domain/view.js';

window.customElements.define(ThreeDimensionButton.tag, ThreeDimensionButton);

describe('ThreeDimensionButton', () => {
	let store;

	const setup = async (state = {}) => {
		const initialState = { ...state };

		store = TestUtils.setupStoreAndDi(initialState, { view: viewReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return await TestUtils.render(ThreeDimensionButton.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ThreeDimensionButton();

			expect(element.getModel()).toEqual({ viewMode: null });
		});
	});

	describe('when initialized', () => {
		describe('and view mode is 2D', () => {
			it('shows a 3D button', async () => {
				const element = await setup({
					view: {
						mode: ViewMode.D2
					}
				});

				expect(element.shadowRoot.querySelectorAll('.three-dimension-button')).toHaveLength(1);
				expect(element.shadowRoot.querySelectorAll('.icon.three-dimension-icon')).toHaveLength(1);
				expect(element.shadowRoot.querySelector('.three-dimension-button').title).toBe('map_threeDimensionButton_title_2d');
			});
		});
		describe('and view mode is 3D', () => {
			it('shows a 3D button', async () => {
				const element = await setup({
					view: {
						mode: ViewMode.D3
					}
				});

				expect(element.shadowRoot.querySelectorAll('.three-dimension-button.is-active-three-dimension')).toHaveLength(1);
				expect(element.shadowRoot.querySelectorAll('.icon.three-dimension-icon')).toHaveLength(1);
				expect(element.shadowRoot.querySelector('.three-dimension-button').title).toBe('map_threeDimensionButton_title_3d');
			});
		});
	});

	describe('when button is clicked', () => {
		it('toggles the view mode', async () => {
			const element = await setup({
				view: {
					mode: ViewMode.D2
				}
			});
			const button = element.shadowRoot.querySelector('.three-dimension-button');

			button.click();

			expect(store.getState().view.mode).toBe(ViewMode.D3);

			button.click();

			expect(store.getState().view.mode).toBe(ViewMode.D2);
		});
	});
});
