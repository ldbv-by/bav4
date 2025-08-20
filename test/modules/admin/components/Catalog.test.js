import { html } from 'lit-html';
import { $injector } from '../../../../src/injection';
import { Catalog } from '../../../../src/modules/admin/components/Catalog';
import { TestUtils } from '../../../test-utils';
window.customElements.define(Catalog.tag, Catalog);

describe('Catalog', () => {
	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector.registerSingleton('TranslationService', { translate: (key, params) => html`${key}${params[0] ?? ''}` });
		return TestUtils.render(Catalog.tag);
	};

	const createNode = (label, childNodes = undefined) => {
		return { label: label, children: childNodes ? [...childNodes] : undefined };
	};

	describe('When initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new Catalog();

			expect(element.getModel()).toEqual({ catalogTree: [], dragContext: null });
		});
	});

	describe('Catalog Tree', () => {
		const treeMock = [
			createNode('foo resource'),
			createNode('faz resource'),
			createNode('bar group', [createNode('sub foo'), createNode('sub bar'), createNode('sub baz')])
		];

		it('prepares property "catalogTree" with ui specific properties on set', async () => {
			const element = await setup();

			element.catalogTree = treeMock;
			const preparedTree = element.catalogTree;

			preparedTree.forEach((node) => {
				expect(node.nodeId).toBeDefined();
			});
			preparedTree[2].children.forEach((node) => {
				expect(node.nodeId).toBeDefined();
			});
		});

		it('renders a tree representation when property "catalogTree" is set', async () => {
			const element = await setup();
			element.catalogTree = treeMock;

			const tree = element.catalogTree;

			tree.forEach((node) => {
				const nodeLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${node.nodeId}"] .node-label`);
				expect(nodeLabelHtml.textContent).toBe(node.label);
			});
			tree[2].children.forEach((node) => {
				const nodeLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${node.nodeId}"] .node-label`);
				expect(nodeLabelHtml.textContent).toBe(node.label);
			});
		});
	});

	describe('Tree-Manipulation methods', () => {
		const treeMock = [
			createNode('foo resource'),
			createNode('faz resource', [createNode('sub faz')]),
			createNode('bar group', [createNode('sub foo'), createNode('sub bar'), createNode('sub baz')])
		];

		it('adds a node to the tree when _addNodeAt is called', async () => {
			const element = await setup();
			element.catalogTree = treeMock;
			const tree = element.catalogTree;

			const nodeIdA = tree[0].nodeId;
			const nodeIdB = tree[2].nodeId;
			const nodeIdC = tree[2].children[0].nodeId;

			element._addNodeAt(nodeIdA, createNode('Node added at the beginning'), true);
			element._addNodeAt(nodeIdB, createNode('Node added before provided Id'), true);
			element._addNodeAt(nodeIdC, createNode('Node added after provided Id'));

			expect(element.catalogTree[0].label).toEqual('Node added at the beginning');
			expect(element.catalogTree[3].label).toEqual('Node added before provided Id');
			expect(element.catalogTree[4].children[1].label).toEqual('Node added after provided Id');
		});

		it('updates a node from the tree when _updateNode is called', async () => {
			const element = await setup();
			element.catalogTree = treeMock;
			const tree = element.catalogTree;

			const nodeToUpdate = tree[2].children[0];
			element._updateNode({ ...nodeToUpdate, label: 'Updated Label' });

			expect(element.catalogTree[2].children[0].label).toEqual('Updated Label');
		});

		it('removes a node from the tree when _removeNodeById is called', async () => {
			const element = await setup();
			element.catalogTree = treeMock;
			const tree = element.catalogTree;

			const nodeToRemove = tree[2].children[0];
			element._removeNodeById(nodeToRemove.nodeId);

			expect(element.catalogTree[2].children).toHaveSize(2);
			expect(element.catalogTree[2].children[0].label).not.toEqual(treeMock[2].children[0].label);
			expect(element.catalogTree[2].children[0].label).toEqual(treeMock[2].children[1].label);
			expect(element.catalogTree[2].children[1].label).not.toEqual(treeMock[2].children[0].label);
		});
	});
});
