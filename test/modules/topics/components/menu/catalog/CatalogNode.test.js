import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../../src/utils/markup';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogNode.tag, CatalogNode);

describe('CatalogNode', () => {



	const setup = (levelAttribute = { level: 0 }) => {

		const state = {
			topics: { current: 'foo' }
		};

		TestUtils.setupStoreAndDi(state);

		if (levelAttribute) {
			return TestUtils.render(CatalogNode.tag, levelAttribute);
		}
		return TestUtils.render(CatalogNode.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {

			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('it has a default level of 0', async () => {

			const element = await setup(null);

			expect(element._level).toBe(0);
		});
	});

	describe('when model changes', () => {

		it('renders a leaf', async () => {
			//load node data
			const [node] = await loadExampleCatalog('foo');
			const element = await setup();

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelector('.ba-list-item__header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba-list-item__sub-header')).toBeFalsy();

			expect(element.shadowRoot.querySelector('.iscollapse')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#list-item-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders level 2', async () => {
			//load node data
			const [node] = await loadExampleCatalog('foo');
			const element = await setup({ level: 1 });

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelector('.ba-list-item__header')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.ba-list-item__sub-header')).toBeTruthy();
		});

		it('click collapse', async () => {
			//load node data
			const [node] = await loadExampleCatalog('foo');
			const element = await setup();

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelector('.ba-list-item__header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.iscollapse')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

			const collapseButton = element.shadowRoot.querySelector('.ba-list-item__header');
			collapseButton.click();

			expect(element.shadowRoot.querySelector('.iscollapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeFalsy();

			collapseButton.click();
			expect(element.shadowRoot.querySelector('.iscollapse')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
		});

	});
});

