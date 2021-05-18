import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import {  loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogNode.tag, CatalogNode);

describe('CatalogNode', () => {


	const setup = () => {

		TestUtils.setupStoreAndDi();

		return TestUtils.render(CatalogNode.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {

			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
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
		});
	});
});

