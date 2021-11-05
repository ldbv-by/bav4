import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { TestUtils } from '../../../../../test-utils';


class AbstractMvuContentPanelImpl extends AbstractMvuContentPanel {

	createView() {
		return html`something`;
	}

	static get tag() {
		return 'ba-abstract-mvu-content-panel-impl';
	}
}

window.customElements.define(AbstractMvuContentPanelImpl.tag, AbstractMvuContentPanelImpl);
window.customElements.define('ba-abstract-content-panel', AbstractMvuContentPanel);

const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};

describe('AbstractMvuContentPanel', () => {

	beforeEach(() => {

		setupStoreAndDi();
	});

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractMvuContentPanel()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});
	});

	describe('default css', () => {

		it('adds the baElement and abstractContentPanel CSS files', async () => {
			const element = await TestUtils.render(AbstractMvuContentPanelImpl.tag);

			expect(element.shadowRoot.querySelectorAll('style')).toHaveSize(2);
		});
	});
});
