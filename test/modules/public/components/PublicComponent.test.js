import { PublicComponent } from '../../../../src/modules/public/components/PublicComponent';
import { TestUtils } from '../../../test-utils';

window.customElements.define(PublicComponent.tag, PublicComponent);

describe('PublicComponent', () => {
	const setup = (state) => {
		TestUtils.setupStoreAndDi(state);
		return TestUtils.render(PublicComponent.tag);
	};

	describe('tag', () => {
		it('sets a default model', () => {
			expect(PublicComponent.tag).toBe('bayern-atlas');
		});
	});

	describe('constructor', () => {
		it('sets a default model', () => {
			setup();
			const element = new PublicComponent();

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
