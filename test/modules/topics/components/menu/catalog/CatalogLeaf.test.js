import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import {  loadExampleCatalog } from '../../../../../../src/modules/topics/services/provider/catalog.provider';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogLeaf.tag, CatalogLeaf);

describe('CatalogLeaf', () => {


	const setup = () => {

		TestUtils.setupStoreAndDi();

		return TestUtils.render(CatalogLeaf.tag);
	};

	describe('when initialized', () => {

		it('renders the nothing', async () => {

			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when model changes', () => {

		it('renders a leaf', async () => {
			//load leaf data
			const leaf = (await loadExampleCatalog('foo')).pop();
			const element = await setup();

			//assign data
			element.data = leaf;

			expect(element.shadowRoot.querySelector('div').innerText).toBe(leaf.geoResourceId);
		});
	});
});

