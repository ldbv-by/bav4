import { html } from 'lit-html';
import { $injector } from '../../../../src/injection';
import { Catalog } from '../../../../src/modules/admin/components/Catalog';
import { TestUtils } from '../../../test-utils';
import { createUniqueId } from '../../../../src/utils/numberUtils';
window.customElements.define(Catalog.tag, Catalog);

describe('Catalog', () => {
	const adminCatalogServiceMock = {
		// eslint-disable-next-line no-unused-vars
		getTopics: async () => {
			return [{ id: 'ba', label: 'Ba' }];
		},
		getGeoResources: async () => {
			return [];
		},
		getCachedGeoResourceById: async () => {
			return {};
		},
		getCatalog: async () => {
			return [];
		}
	};

	const setup = async (state = {}) => {
		TestUtils.setupStoreAndDi(state, {});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => html`${key}` })
			.registerSingleton('AdminCatalogService', adminCatalogServiceMock);
		return TestUtils.render(Catalog.tag);
	};

	const setupTree = (tree) => {
		return spyOn(adminCatalogServiceMock, 'getCatalog').and.resolveTo(tree);
	};

	const createNode = (label, childNodes = undefined) => {
		return { label: label, children: childNodes ? [...childNodes] : undefined, foldout: true };
	};

	const createGeoResource = (label) => {
		return { label: label, id: createUniqueId() };
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new Catalog();

			expect(element.getModel()).toEqual({
				topics: [],
				geoResources: [],
				catalogTree: [],
				geoResourceFilter: '',
				dragContext: null,
				popupType: null
			});
		});
	});

	describe('when ui renders', () => {
		it('skips rendering of the "Edit Group" Popup', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.popup')).toBeNull();
		});

		it('renders geo-resources alphanumerically', async () => {
			spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo([
				createGeoResource('20'),
				createGeoResource('Zag'),
				createGeoResource('Baz'),
				createGeoResource('Moo'),
				createGeoResource('1'),
				createGeoResource('Aoo'),
				createGeoResource('Boo')
			]);
			const element = await setup();
			await TestUtils.timeout();

			const resources = [...element.shadowRoot.querySelectorAll('#geo-resource-explorer-content .geo-resource span.label')];
			expect(resources.map((r) => r.textContent)).toEqual(['1', '20', 'Aoo', 'Baz', 'Boo', 'Moo', 'Zag']);
		});
	});

	describe('catalog tree', () => {
		const defaultTreeMock = [
			createNode('foo resource'),
			createNode('faz resource', [createNode('sub faz')]),
			createNode('bar group', [createNode('sub foo'), createNode('sub bar'), createNode('sub baz')])
		];

		describe('tree-manipulation methods', () => {
			it('traverses the tree when _traverseTree is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;

				element._traverseTree(tree, (index, subTree) => {
					subTree[index] = { ...subTree[index], flagged: true };
				});

				expect(tree[0].flagged).toBeTrue();
				expect(tree[1].flagged).toBeTrue();
				expect(tree[1].children[0].flagged).toBeTrue();
				expect(tree[2].flagged).toBeTrue();
				expect(tree[2].children[0].flagged).toBeTrue();
				expect(tree[2].children[1].flagged).toBeTrue();
				expect(tree[2].children[2].flagged).toBeTrue();
			});

			it('adds a node to the tree when _addNodeAt is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				const nodeIdA = tree[0].nodeId;
				const nodeIdB = tree[2].nodeId;
				const nodeIdC = tree[2].children[0].nodeId;

				element._addNodeAt(tree, nodeIdA, createNode('Node added at the beginning'), true);
				element._addNodeAt(tree, nodeIdB, createNode('Node added before provided Id'), true);
				element._addNodeAt(tree, nodeIdC, createNode('Node added after provided Id'));

				expect(traversalSpy).toHaveBeenCalledTimes(3);
				expect(element.catalogTree[0].label).toEqual('Node added at the beginning');
				expect(element.catalogTree[3].label).toEqual('Node added before provided Id');
				expect(element.catalogTree[4].children[1].label).toEqual('Node added after provided Id');
			});

			it('prepends a node to as a child when _prependNodeAsChild is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const parentNodeId = tree[2].nodeId;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				element._prependNodeAsChild(tree, parentNodeId, createNode('Node prepended in parent'));

				expect(traversalSpy).toHaveBeenCalledTimes(1);
				expect(element.catalogTree[2].children[0].label).toEqual('Node prepended in parent');
			});

			it('gets a node by id', async () => {
				setupTree([...defaultTreeMock, { label: 'getNodeLabel', nodeId: 'example id' }]);
				const element = await setup();
				const tree = element.catalogTree;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				const node = element._getNodeById(tree, 'example id');

				expect(traversalSpy).toHaveBeenCalledTimes(1);
				expect(node).toEqual(jasmine.objectContaining({ label: 'getNodeLabel', nodeId: 'example id' }));
			});

			it('updates a node from the tree when _updateNode is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				const nodeToUpdate = tree[2].children[0];
				element._updateNode(tree, { ...nodeToUpdate, label: 'Updated Label' });

				expect(traversalSpy).toHaveBeenCalledTimes(1);
				expect(element.catalogTree[2].children[0].nodeId).toEqual(nodeToUpdate.nodeId);
				expect(element.catalogTree[2].children[0].label).toEqual('Updated Label');
			});

			it('replaces a node from the tree when _replaceNode is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				const nodeToReplace = tree[2].children[0];
				element._replaceNode(tree, nodeToReplace.nodeId, { label: 'Replaced Label' });

				expect(traversalSpy).toHaveBeenCalledTimes(1);
				expect(element.catalogTree[2].children[0].nodeId).not.toEqual(nodeToReplace.nodeId);
				expect(element.catalogTree[2].children[0].label).toEqual('Replaced Label');
			});

			it('removes a node from the tree when _removeNodeById is called', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const traversalSpy = spyOn(element, '_traverseTree').and.callThrough();

				const nodeToRemove = tree[2].children[0];
				element._removeNodeById(tree, nodeToRemove.nodeId);

				expect(traversalSpy).toHaveBeenCalledTimes(1);
				expect(element.catalogTree[2].children).toHaveSize(2);
				expect(element.catalogTree[2].children[0].label).not.toEqual(defaultTreeMock[2].children[0].label);
				expect(element.catalogTree[2].children[0].label).toEqual(defaultTreeMock[2].children[1].label);
				expect(element.catalogTree[2].children[1].label).not.toEqual(defaultTreeMock[2].children[0].label);
			});

			it('returns the normalized position within an bounding rect when "_getNormalizedClientPositionInRect" methods are called', async () => {
				const testCases = [
					{ pointerPos: -10, expected: -0.1 },
					{ pointerPos: 0, expected: 0 },
					{ pointerPos: 10, expected: 0.1 },
					{ pointerPos: 20, expected: 0.2 },
					{ pointerPos: 60, expected: 0.6 },
					{ pointerPos: 100, expected: 1 },
					{ pointerPos: 201, expected: 2.01 }
				];

				const element = await setup();
				const rect = new DOMRect(0, 0, 100, 100);

				testCases.forEach((tc) => {
					expect(element._getNormalizedClientXPositionInRect(tc.pointerPos, rect)).toBe(tc.expected);
					expect(element._getNormalizedClientYPositionInRect(tc.pointerPos, rect)).toBe(tc.expected);
				});
			});

			it('returns the height difference when "_getClientYHeightDiffInRect" is called', async () => {
				const testCases = [
					{ pointerPos: -10, expected: 110 },
					{ pointerPos: 0, expected: 100 },
					{ pointerPos: 10, expected: 90 },
					{ pointerPos: 20, expected: 80 },
					{ pointerPos: 60, expected: 40 },
					{ pointerPos: 100, expected: 0 },
					{ pointerPos: 201, expected: -101 }
				];

				const element = await setup();
				const rect = new DOMRect(0, 0, 0, 100);

				testCases.forEach((tc) => {
					expect(element._getClientYHeightDiffInRect(tc.pointerPos, rect)).toBe(tc.expected);
				});
			});
		});

		describe('node properties', () => {
			it('prepares property "catalogTree" with ui specific properties are set', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const preparedTree = element.catalogTree;

				preparedTree.forEach((node) => {
					expect(node.nodeId).toBeDefined();
				});
				preparedTree[2].children.forEach((node) => {
					expect(node.nodeId).toBeDefined();
				});
			});

			it('renders a tree representation when property "catalogTree" is set', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
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

			it('renders tree children when node property "foldout" is true', async () => {
				setupTree([{ ...createNode('bar group', [createNode('sub foo')]), foldout: true }]);
				const element = await setup();

				const tree = element.catalogTree;
				const child = tree[0].children[0];

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${child.nodeId}"]`)).not.toBeNull();
			});

			it('skips rendering of tree children when node property "foldout" is false', async () => {
				setupTree([{ ...createNode('bar group', [createNode('sub foo')]), foldout: false }]);
				const element = await setup();

				const tree = element.catalogTree;
				const child = tree[0].children[0];

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${child.nodeId}"]`)).toBeNull();
			});
		});

		describe('user actions', () => {
			it('creates a node in the tree when "Create Node Button" is pressed', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;

				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);

				domNode.querySelector('.btn-add-group-node').click();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[node-id]`)).toHaveSize(2);
				expect(domNode.querySelectorAll('li[node-id]')).toHaveSize(1);
			});

			it('opens a popup with the node\'s current label when "Edit Group Label Button" is pressed', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;

				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				domNode.querySelector('.btn-edit-group-node').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');

				expect(editInput.value).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).not.toBeNull();
			});

			it('edits the label of a node when "Confirm Group Label Button" is pressed', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;
				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);

				domNode.querySelector('.btn-edit-group-node').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');

				editInput.value = 'bar';
				confirmBtn.click();

				expect(domNode.querySelector('.node-label').textContent).toBe('bar');
			});

			it('closes popup of a node when "Cancel Group Label Button" is pressed', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;
				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);

				domNode.querySelector('.btn-edit-group-node').click();
				const cancelBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-cancel');
				cancelBtn.click();

				expect(domNode.querySelector('.node-label').textContent).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).toBeNull();
			});

			it('deletes a node from the tree when "Delete Node Button" is pressed', async () => {
				setupTree([createNode('foo'), createNode('faz'), createNode('bar', [createNode('sub foo'), createNode('sub bar')])]);
				const element = await setup();
				const tree = element.catalogTree;

				const fazDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				const barDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[2].nodeId}"]`);
				const subFooDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[2].children[0].nodeId}"]`);

				fazDomNode.querySelector('.btn-delete-node').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${fazDomNode.nodeId}"]`)).toBeNull();

				barDomNode.querySelector('.btn-delete-node').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${fazDomNode.nodeId}"]`)).toBeNull();

				subFooDomNode.querySelector('.btn-delete-node').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${subFooDomNode.nodeId}"]`)).toBeNull();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[node-id]`)).toHaveSize(1);
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"] .node-label`).textContent).toBe('foo');
			});

			it('toggles the node property "foldout" when "Foldout Button" is clicked', async () => {
				setupTree([{ ...createNode('foo', [createNode('sub foo'), createNode('sub bar')]), foldout: false }]);
				const element = await setup();
				const tree = element.catalogTree;
				const foldoutBtn = element.shadowRoot.querySelector(`li[node-id="${tree[0].nodeId}"] .btn-foldout`);

				foldoutBtn.click();
				expect(element.catalogTree[0].foldout).toBeTrue();

				foldoutBtn.click();
				expect(element.catalogTree[0].foldout).toBeFalse();
			});

			it('filters geo-resources on input', async () => {
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo([
					createGeoResource('20'),
					createGeoResource('Zag'),
					createGeoResource('Baz'),
					createGeoResource('Moo'),
					createGeoResource('1'),
					createGeoResource('Aoo'),
					createGeoResource('Boo')
				]);
				const element = await setup();
				await TestUtils.timeout();

				const inputField = element.shadowRoot.querySelector('input#geo-resource-search-input');
				inputField.value = 'oo';
				inputField.dispatchEvent(new Event('input'));

				const resources = [...element.shadowRoot.querySelectorAll('#geo-resource-explorer-content .geo-resource span.label')];
				expect(resources.map((r) => r.textContent)).toEqual(['Aoo', 'Boo', 'Moo']);
			});

			it('refreshes geo-resources on click', async () => {
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo([
					createGeoResource('20'),
					createGeoResource('Zag'),
					createGeoResource('Baz'),
					createGeoResource('Moo'),
					createGeoResource('1'),
					createGeoResource('Aoo'),
					createGeoResource('Boo')
				]);
				const element = await setup();
				await TestUtils.timeout();

				const refreshSpy = spyOn(element, '_requestGeoResources').and.callThrough();
				element.shadowRoot.querySelector('#btn-geo-resource-refresh').click();
				await TestUtils.timeout();

				expect(refreshSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('tree has pending changes', () => {
			const modifyTreeWithDragAndDrop = (element) => {
				const tree = element.catalogTree;
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dragDomNode.dispatchEvent(new DragEvent('dragstart'));
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				dragDomNode.dispatchEvent(new DragEvent('dragend'));
			};

			it('marks the tree dirty when modified with drag & drop', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();

				modifyTreeWithDragAndDrop(element);

				expect(element.isDirty).toBe(true);
			});

			it('marks the tree dirty when node-group label is modified', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;
				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);

				domNode.querySelector('.btn-edit-group-node').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');
				editInput.value = 'bar';
				confirmBtn.click();

				expect(element.isDirty).toBeTrue();
			});

			it('does not mark the tree dirty when node-group label is not changed', async () => {
				setupTree([createNode('foo', [])]);
				const element = await setup();
				const tree = element.catalogTree;
				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);

				domNode.querySelector('.btn-edit-group-node').click();
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');
				confirmBtn.click();

				expect(element.isDirty).toBeFalse();
			});

			it('shows a "Confirm Dispose Tree" popup when another topic is selected while tree is dirty', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.dispatchEvent(new Event('change'));

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).not.toBeNull();
			});

			it('switches the tree when "Confirm Dispose Tree" popup is confirmed', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createNode('foo'), createNode('too')])
					.withArgs('b')
					.and.resolveTo([createNode('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-confirm').click();
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.catalogTree[0].label).toEqual('bar');
			});

			it('keeps the tree when "Confirm Dispose Tree" popup is cancelled', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createNode('foo'), createNode('too')])
					.withArgs('b')
					.and.resolveTo([createNode('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-cancel').click();
				await TestUtils.timeout();

				// Note: Tree was modified, Therefore order of elements is reversed.
				expect(element.catalogTree[0].label).toEqual('too');
				expect(element.catalogTree[1].label).toEqual('foo');
				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
			});

			it('switches the tree when a topic is selected', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createNode('foo')])
					.withArgs('b')
					.and.resolveTo([createNode('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.catalogTree[0].label).toEqual('bar');
			});
		});

		describe('drag and drop', () => {
			it('sets the dragContext on "dragstart" to the currently dragged node', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;

				const domNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				domNode.dispatchEvent(new DragEvent('dragstart'));

				expect(element.getModel().dragContext).toEqual(jasmine.objectContaining(tree[0]));
			});

			it('sets the dragContext on "dragstart" to the currently dragged geo-resource', async () => {
				const geoResources = [createGeoResource('Aoo'), createGeoResource('Boo'), createGeoResource('Coo')];
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo(geoResources);
				const element = await setup();

				const domResource = element.shadowRoot.querySelector(`#geo-resource-explorer .geo-resource:nth-child(2)`);
				domResource.dispatchEvent(new DragEvent('dragstart'));

				expect(element.getModel().dragContext.geoResourceId).toEqual(geoResources[1].id);
			});

			it('hides dragged node on "dragover"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.4999');
				const dragNode = tree[0];
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${dragNode.nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				dragDomNode.dispatchEvent(new DragEvent('dragstart'));

				const hiddenSpy = spyOn(element, '_updateNode').and.callThrough();
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${dragNode.nodeId}"]`)).toBeNull();
				expect(element.catalogTree[0].nodeId).toBe(dragNode.nodeId);
				expect(element.catalogTree[0].hidden).toBeTrue();

				// Ensures that the hidden-behaviour is only called once on the first dragover.
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(hiddenSpy).toHaveBeenCalledOnceWith(jasmine.anything(), jasmine.objectContaining({ nodeId: dragNode.nodeId, hidden: true }));
			});

			it('renders a preview in the tree on a geo-resource node "dragover"', async () => {
				setupTree([createNode('foo resource'), createNode('faz resource')]);
				const element = await setup();
				const tree = element.catalogTree;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				dragDomNode.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target node
				insertionSpy.and.returnValue('0.4999');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[1].nodeId).toBe('preview');
				expect(element.catalogTree[2].nodeId).toBe(tree[1].nodeId);

				// Insert preview after target node
				insertionSpy.and.returnValue('0.5001');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[1].nodeId).toBe(tree[1].nodeId);
				expect(element.catalogTree[2].nodeId).toBe('preview');
				expect(insertionSpy).toHaveBeenCalledTimes(2);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview in the tree on a group node "dragover"', async () => {
				setupTree([createNode('foo resource'), createNode('foo group', [createNode('bar resource')])]);
				const element = await setup();
				const tree = element.catalogTree;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				dragDomNode.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target node
				insertionSpy.and.returnValue('0.2499');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[1].nodeId).toBe('preview');
				expect(element.catalogTree[2].nodeId).toBe(tree[1].nodeId);

				// Prepend preview to target node
				insertionSpy.and.returnValue('0.25');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[1].children[0].nodeId).toBe('preview');
				expect(insertionSpy).toHaveBeenCalledTimes(2);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);
			});

			it('removes preview on "dragleave"', async () => {
				// values smaller 0 or greater 1 imply that the mouse/pointer is outside of the dragzone.
				const testCases = [
					[-0.01, 0.5],
					[1.01, 0.5],
					[0.5, -0.01],
					[0.5, 1.01]
				];
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const widthSpy = spyOn(element, '_getNormalizedClientXPositionInRect');
				const heightSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const treeDom = element.shadowRoot.querySelector(`#catalog-tree`);
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);

				dragDomNode.dispatchEvent(new DragEvent('dragstart'));

				testCases.forEach((tc) => {
					widthSpy.and.returnValue(tc[0]);
					heightSpy.and.returnValue(tc[1]);
					dropDomNode.dispatchEvent(new DragEvent('dragover'));
					treeDom.dispatchEvent(new DragEvent('dragleave'));
					expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(0);
				});

				// Keep preview when inside the dragzone.
				widthSpy.and.returnValue(0.1);
				heightSpy.and.returnValue(0.1);
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				treeDom.dispatchEvent(new DragEvent('dragleave'));
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview in the tree\'s head or tail "ondragover"', async () => {
				setupTree([createNode('foo resource')]);
				const element = await setup();
				const tree = element.catalogTree;
				const insertionSpy = spyOn(element, '_getClientYHeightDiffInRect');
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree`);
				const dropDomNodeBoundingRectHeight = dropDomNode.getBoundingClientRect().height;
				const dropDomNodePadding = 20;

				dragDomNode.dispatchEvent(new DragEvent('dragstart'));

				// Add preview to the start of the tree
				insertionSpy.and.returnValue(dropDomNodeBoundingRectHeight - dropDomNodePadding);
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[0].nodeId).toBe('preview');
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);

				// Add preview to the end of the tree
				insertionSpy.and.returnValue(dropDomNodePadding);
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalogTree[1].nodeId).toBe('preview');
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview of a geo resource on "drag over"', async () => {
				const geoResources = [createGeoResource('Aoo'), createGeoResource('Boo'), createGeoResource('Coo')];
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo(geoResources);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(geoResources[1]);
				setupTree([createNode('foo node'), createNode('bar node')]);
				const element = await setup();
				const tree = element.catalogTree;
				const dragDomResource = element.shadowRoot.querySelector(`#geo-resource-explorer .geo-resource:nth-child(2)`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);

				dragDomResource.dispatchEvent(new DragEvent('dragstart'));
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));

				expect(element.catalogTree[1].nodeId).toBe(tree[1].nodeId);
				expect(element.catalogTree[2].nodeId).toBe('preview');
				expect(element.catalogTree[2].geoResourceId).toBe(geoResources[1].id);
			});

			it('does not update preview "ondragover" when pointer is hovered over the preview node', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				dragDomNode.dispatchEvent(new DragEvent('dragstart'));
				insertionSpy.and.returnValue('0.4999');
				dropDomNode.dispatchEvent(new DragEvent('dragover'));

				const signalSpy = spyOn(element, 'signal').and.callThrough();
				const previewDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="preview"]`);
				previewDomNode.dispatchEvent(new DragEvent('dragover'));

				expect(signalSpy).not.toHaveBeenCalled();
			});

			it('does not modify the tree when node was not rearranged on "dragend"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalogTree;
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomNode.dispatchEvent(new DragEvent('dragstart'));
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				dragDomNode.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(0);
				expect(element.catalogTree[0].nodeId).toBe(tree[0].nodeId);
				expect(element.catalogTree).toEqual(tree);
			});

			it('modifies the tree when node was rearranged on "dragend"', async () => {
				setupTree([createNode('foo'), createNode('bar')]);
				const element = await setup();
				const tree = element.catalogTree;
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomNode.dispatchEvent(new DragEvent('dragstart'));
				dropDomNode.dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				dragDomNode.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(0);
				expect(element.catalogTree[1].nodeId).toBe(tree[0].nodeId);
				expect(element.catalogTree).not.toEqual(tree);
			});

			it('replaces the preview in the tree with the dragContext on "drop"', async () => {
				setupTree([createNode('foo'), createNode('bar')]);
				const element = await setup();
				const tree = element.catalogTree;
				const dragDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[0].nodeId}"]`);
				const dropDomNode = element.shadowRoot.querySelector(`#catalog-tree-root li[node-id="${tree[1].nodeId}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomNode.dispatchEvent(new DragEvent('dragstart'));
				dropDomNode.dispatchEvent(new DragEvent('dragover'));

				const replaceSpy = spyOn(element, '_replaceNode').and.callThrough();
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(1);
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));

				expect(replaceSpy).toHaveBeenCalledTimes(1);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[node-id="preview"]')).toHaveSize(0);
				expect(element.catalogTree[1].nodeId).toEqual(tree[0].nodeId);
				expect(element.catalogTree[1].hidden).toBeFalse();
			});
		});
	});
});
