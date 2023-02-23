import { html } from 'lit-html';
import { AbstractContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractContentPanel';
import { TestUtils } from '../../../../../test-utils';

class AbstractContentPanelImpl extends AbstractContentPanel {
	createView() {
		return html`something`;
	}

	static get tag() {
		return 'ba-abstract-content-panel-impl';
	}
}

window.customElements.define(AbstractContentPanelImpl.tag, AbstractContentPanelImpl);
window.customElements.define('ba-abstract-content-panel', AbstractContentPanel);

const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};

describe('AbstractContentPanel', () => {
	beforeEach(() => {
		setupStoreAndDi();
	});

	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractContentPanel()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});
	});

	describe('default css', () => {
		it('adds the baElement and abstractContentPanel CSS files', async () => {
			const element = await TestUtils.render(AbstractContentPanelImpl.tag);

			expect(element.shadowRoot.querySelectorAll('style')).toHaveSize(2);
		});
	});
});
