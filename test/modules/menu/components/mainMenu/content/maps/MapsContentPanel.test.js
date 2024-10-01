import { BaseLayerContainer } from '../../../../../../../src/modules/baseLayer/components/container/BaseLayerContainer';
import { LayerManager } from '../../../../../../../src/modules/layerManager/components/LayerManager';
import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { MapsContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/maps/MapsContentPanel';
import { TestUtils } from '../../../../../../test-utils';
import { $injector } from '../../../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';

window.customElements.define(MapsContentPanel.tag, MapsContentPanel);

describe('MapsContentPanel', () => {
	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: true //because of safari test bug
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector.registerSingleton('EnvironmentService', {});
		return TestUtils.render(MapsContentPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).position).toBe('sticky');
			expect(element.shadowRoot.querySelectorAll(LayerManager.tag)).toHaveSize(1);
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).top).toBe('0px');
		});

		it('layouts for portrait', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).top).toBe('-40px');
		});
	});
});
