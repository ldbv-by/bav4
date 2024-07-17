import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel.js';
import { CatalogLeaf } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogLeaf';
import { CatalogNode } from '../../../../../../src/modules/topics/components/menu/catalog/CatalogNode';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../../src/utils/markup';
import { TestUtils } from '../../../../../test-utils.js';

window.customElements.define(CatalogNode.tag, CatalogNode);

describe('CatalogNode', () => {
	const testCatalog = [
		{
			label: 'Subtopic 1',
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
	const setup = (levelProperty = { level: 0 }) => {
		const state = {
			topics: { current: 'foo' }
		};

		TestUtils.setupStoreAndDi(state);

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

			expect(element.getModel()).toEqual({ level: 0, collapsed: true, catalogEntry: null, active: false });
		});
	});

	describe('when initialized', () => {
		it('renders the nothing', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
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

			expect(element.shadowRoot.querySelector('.ba-list-item__header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba-list-item__sub-header')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.sub-icon')).toBeFalsy();

			expect(element.shadowRoot.querySelector('.iscollapse')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#list-item-button').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('renders level 2', async () => {
			//load node data
			const [node] = testCatalog;
			const element = await setup({ level: 1 });

			//assign data
			element.data = node;

			//data contains one node and two leaves
			expect(element.shadowRoot.querySelectorAll(CatalogLeaf.tag)).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll(CatalogNode.tag)).toHaveSize(1);

			expect(element.shadowRoot.querySelector('.sub-divider')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba-list-item__header')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.ba-list-item__sub-header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.sub-icon')).toBeTruthy();

			expect(element.shadowRoot.querySelector('.iscollapse')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

			expect(element.shadowRoot.querySelectorAll(`style`)[2].innerText).toContain('.sub-divider{--node-level: 0em;}');
		});

		it('click collapse', async () => {
			//load node data
			const [node] = await testCatalog;
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
