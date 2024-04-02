import { BvvComponent } from '../../../../src/modules/wc/components/BvvComponent';
import { TestUtils } from '../../../test-utils';

window.customElements.define(BvvComponent.tag, BvvComponent);

describe('BaseLayerInfo', () => {
	const setup = (state) => {
		TestUtils.setupStoreAndDi(state);
		return TestUtils.render(BvvComponent.tag);
	};

	describe('tag', () => {
		it('sets a default model', () => {
			expect(BvvComponent.tag).toBe('bayern-atlas');
		});
	});

	describe('constructor', () => {
		it('sets a default model', () => {
			setup();
			const element = new BvvComponent();

			expect(element.getModel()).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('renders 11 top level ba-components', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('ba-ol-map')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-view-larger-map-chip')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-draw-tool')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-map-button-container')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-footer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-nonembedded-hint')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-theme-provider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-notification-panel')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-map-context-menu')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-activate-map-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-iframe-container')).toHaveSize(1);
		});
	});
});
