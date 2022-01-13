import { BaseLayerSwitcher } from '../../../../../../../src/modules/baseLayer/components/switcher/BaseLayerSwitcher';
import { LayerManager } from '../../../../../../../src/modules/layerManager/components/LayerManager';
import { AbstractMvuContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { MapsContentPanel } from '../../../../../../../src/modules/menu/components/mainMenu/content/maps/MapsContentPanel';
import { TestUtils } from '../../../../../../test-utils';

window.customElements.define(MapsContentPanel.tag, MapsContentPanel);

describe('MapsContentPanel', () => {

	const setup = () => {
		TestUtils.setupStoreAndDi();
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

			expect(element.shadowRoot.querySelectorAll(BaseLayerSwitcher.tag)).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll(LayerManager.tag)).toHaveSize(1);

		});
	});
});
