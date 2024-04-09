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
		it('renders 11 top level ba-components within a closed shadow root', async () => {
			const element = await setup();

			// null as the shadow root is closed
			expect(element.shadowRoot).toBeNull();
			expect(element._root.querySelectorAll('ba-ol-map')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-view-larger-map-chip')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-draw-tool')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-map-button-container')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-footer')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-nonembedded-hint')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-theme-provider')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-notification-panel')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-map-context-menu')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-activate-map-button')).toHaveSize(1);
			expect(element._root.querySelectorAll('ba-iframe-container')).toHaveSize(1);
		});
	});
});
