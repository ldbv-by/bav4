import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel.js';
import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { catalogReducer } from '../../../../../../src/store/catalog/catalog.reducer.js';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../../src/utils/markup';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogNode.tag, CatalogNode);

describe('CatalogNode', () => {
	const testCatalog = [
		{
			label: 'Subtopic 1',
			id: 'node1',
			open: true,
			children: [
				{
					geoResourceId: 'gr0'
				},
				{
					geoResourceId: 'gr1'
				},
				{
					label: 'Subtopic 2',
					id: 'node2',
					children: [
						{
							geoResourceId: 'gr3'
						}
					]
				}
			]
		},
		{
			geoResourceId: 'gr3'
		}
	];
	let store;
	const setup = (levelProperty = { level: 0 }, openNodes = []) => {
		const state = {
			catalog: { openNodes }
		};

		store = TestUtils.setupStoreAndDi(state, {
			catalog: catalogReducer
		});

		if (levelProperty) {
			return TestUtils.render(CatalogNode.tag, levelProperty);
		}
		return TestUtils.render(CatalogNode.tag);
	};

	describe('class', () => {
		it('inherits from AbstractMvuContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new CatalogNode();

			expect(element.getModel()).toEqual({ level: 0, collapsed: true, catalogNode: null, active: false });
		});
	});

	describe('when initialized', () => {
		describe('and NO data is set', () => {
			it('renders the nothing', async () => {
				const element = await setup();

				expect(element.shadowRoot.children.length).toBe(0);
			});
		});

		describe('and data is set', () => {
			it('updates the catalog s-o-s according to the node data', async () => {
				//load node data
				const [node] = testCatalog;
				const element = await setup();

				//assign data
				element.data = node;

				expect(store.getState().catalog.openNodes).toContain('node1');
			});

			it('updates the model according to the catalog s-o-s', async () => {
				//load node data
				const [node] = testCatalog;
				//node2 is registered as open
				const element = await setup({ level: 1 }, ['node2']);

				//assign data
				element.data = node;

				expect(element.getModel().collapsed).toBeFalse();
			});
		});
	});

	describe('when model changes', () => {
		it('renders a leaf', async () => {
			//load node data
			const [node] = testCatalog;
			const element = await setup();

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__sub-header')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.sub-icon')).toHaveSize(0);

			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#list-item-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders level 0', async () => {
			//load node data
			const [node] = testCatalog;
			const element = await setup();

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(1);
			expect(store.getState().catalog.openNodes).toContain('node1');
		});

		it('renders level 1', async () => {
			//load node data
			const [node] = testCatalog;
			const element = await setup({ level: 1 });

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.sub-divider')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__sub-header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.sub-icon')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll(`style`)[2].innerText).toContain('.sub-divider{--node-level: 0em;}');
		});
	});

	describe('when the toggle-collapse button is clicked', () => {
		it('updates the UI ', async () => {
			//load node data
			const [node] = await testCatalog;
			const element = await setup();

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__header')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(1);

			const collapseButton = element.shadowRoot.querySelector('.ba-list-item__header');
			collapseButton.click();

			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(0);

			collapseButton.click();
			expect(element.shadowRoot.querySelectorAll('.iscollapse')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.iconexpand')).toHaveSize(1);
		});
	});
});
