import { TestUtils } from '@test/test-utils.js';
import { viewReducer } from '@src/store/view/view.reducer.js';
import { setViewMode } from '@src/store/view/view.action.js';
import { ViewContainer } from '@src/modules/map/components/view/ViewContainer.js';
import { ViewMode } from '@src/domain/view.js';

window.customElements.define(ViewContainer.tag, ViewContainer);

describe('ViewContainer', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, { view: viewReducer });

		return await TestUtils.render(ViewContainer.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ViewContainer();

			expect(element.getModel()).toEqual({ viewMode: null });
		});
	});

	describe('when initialized', () => {
		it('render the correct map view for 2D', async () => {
			const element = await setup({
				view: {
					mode: ViewMode.D2
				}
			});

			expect(element.shadowRoot.querySelectorAll('ba-ol-map')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-cs-globe')).toHaveLength(0);
		});

		it('render the correct map view for 3D', async () => {
			const element = await setup({
				view: {
					mode: ViewMode.D3
				}
			});

			expect(element.shadowRoot.querySelectorAll('ba-ol-map')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('ba-cs-globe')).toHaveLength(1);
		});
	});

	describe('when view changes', () => {
		it('updates the map view', async () => {
			const element = await setup({
				view: {
					mode: ViewMode.D2
				}
			});

			setViewMode(ViewMode.D3);

			expect(element.shadowRoot.querySelectorAll('ba-ol-map')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('ba-cs-globe')).toHaveLength(1);

			setViewMode(ViewMode.D2);

			expect(element.shadowRoot.querySelectorAll('ba-ol-map')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-cs-globe')).toHaveLength(0);
		});
	});
});
