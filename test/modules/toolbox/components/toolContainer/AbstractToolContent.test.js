import { html } from 'lit-html';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { TestUtils } from '../../../../test-utils';




class ToolContentImpl extends AbstractToolContent {

	createView() {
		return html`something`;
	}

	static get tag() {
		return 'ba-tool-content-impl';
	}
}

window.customElements.define(ToolContentImpl.tag, ToolContentImpl);
window.customElements.define('ba-abstract-content-panel', AbstractToolContent);

const setupStoreAndDi = () => {
	TestUtils.setupStoreAndDi();
};

describe('AbstractToolContent', () => {

	beforeEach(() => {

		setupStoreAndDi();
	});

	describe('expected errors', () => {

		describe('constructor', () => {

			it('throws exception when instantiated without inheritance', () => {
				expect(() => new AbstractToolContent()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('calls the parent constructor with model', () => {
				const model = { foo: 'bar' };
				class MyToolContent extends AbstractToolContent {
					constructor() {
						super(model);
					}
				}
				window.customElements.define('ba-mytoolcontent', MyToolContent);

				const instance = new MyToolContent();

				expect(instance.getModel()).toEqual(model);
			});
		});
	});

	describe('default css', () => {

		it('adds the baElement and abstractContentPanel CSS files', async () => {
			const element = await TestUtils.render(ToolContentImpl.tag);

			expect(element.shadowRoot.querySelectorAll('style')).toHaveSize(2);
		});
	});
});
