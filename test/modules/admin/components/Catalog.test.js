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

	const createEntry = (label, childEntries = null) => {
		return { label: label, children: childEntries ? [...childEntries] : null };
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
				catalog: [],
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
			createEntry('foo resource'),
			createEntry('faz resource', [createEntry('sub faz')]),
			createEntry('bar group', [createEntry('sub foo'), createEntry('sub bar'), createEntry('sub baz')])
		];

		describe('helper methods', () => {
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

		describe('branch properties', () => {
			it('prepares property "catalog" with ui specific properties are set', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const preparedTree = element.catalog;

				preparedTree.forEach((branch) => {
					expect(branch.id).toBeDefined();
				});
				preparedTree[2].children.forEach((branch) => {
					expect(branch.id).toBeDefined();
				});
			});

			it('renders a tree representation when property "catalog" is set', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalog;

				tree.forEach((branch) => {
					const branchLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .branch-label`);
					expect(branchLabelHtml.textContent).toEqual(branch.label);
				});

				tree[2].children.forEach((branch) => {
					const branchLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .branch-label`);
					expect(branchLabelHtml.textContent).toBe(branch.label);
				});
			});

			it('renders tree children when branch property "open" is true', async () => {
				setupTree([{ ...createEntry('bar group', [createEntry('sub foo')]), open: true }]);
				const element = await setup();

				const tree = element.catalog;
				const child = tree[0].children[0];

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${child.id}"]`)).not.toBeNull();
			});

			it('skips rendering of tree children when branch property "open" is false', async () => {
				setupTree([{ ...createEntry('bar group', [createEntry('sub foo')]), ui: { foldout: false } }]);
				const element = await setup();

				const tree = element.catalog;
				const child = tree[0].children[0];

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${child.id}"]`)).toBeNull();
			});
		});

		describe('user actions', () => {
			it('creates a branch in the tree when "Create Entry Button" is pressed', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-add-group-branch').click();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[branch-id]`)).toHaveSize(2);
				expect(domEntry.querySelectorAll('li[branch-id]')).toHaveSize(1);
			});

			it('opens a popup with the branch\'s current label when "Edit Group Label Button" is pressed', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');

				expect(editInput.value).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).not.toBeNull();
			});

			it('edits the label of a branch when "Confirm Group Label Button" is pressed', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');

				editInput.value = 'bar';
				confirmBtn.click();

				expect(domEntry.querySelector('.branch-label').textContent).toBe('bar');
			});

			it('closes popup of a branch when "Cancel Group Label Button" is pressed', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const cancelBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-cancel');
				cancelBtn.click();

				expect(domEntry.querySelector('.branch-label').textContent).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).toBeNull();
			});

			it('deletes a branch from the tree when "Delete Entry Button" is pressed', async () => {
				setupTree([createEntry('foo'), createEntry('faz'), createEntry('bar', [createEntry('sub foo'), createEntry('sub bar')])]);
				const element = await setup();
				const tree = element.catalog;

				const fazDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				const barDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[2].id}"]`);
				const subFooDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[2].children[0].id}"]`);

				fazDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${fazDomEntry.id}"]`)).toBeNull();

				barDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${fazDomEntry.id}"]`)).toBeNull();

				subFooDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${subFooDomEntry.id}"]`)).toBeNull();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[branch-id]`)).toHaveSize(1);
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"] .branch-label`).textContent).toBe('foo');
			});

			it('toggles the branch property "ui.foldout" when "Foldout Button" is clicked', async () => {
				setupTree([{ ...createEntry('foo', [createEntry('sub foo'), createEntry('sub bar')]), ui: { foldout: false } }]);
				const element = await setup();
				const tree = element.catalog;
				const openBtn = element.shadowRoot.querySelector(`li[branch-id="${tree[0].id}"] .btn-foldout`);

				openBtn.click();
				expect(element.catalog[0].ui.foldout).toBeTrue();

				openBtn.click();
				expect(element.catalog[0].ui.foldout).toBeFalse();
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
				const tree = element.catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				dragDomEntry.dispatchEvent(new DragEvent('dragend'));
			};

			it('marks the tree dirty when modified with drag & drop', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();

				modifyTreeWithDragAndDrop(element);

				expect(element.isDirty).toBe(true);
			});

			it('marks the tree dirty when branch-group label is modified', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');
				editInput.value = 'bar';
				confirmBtn.click();

				expect(element.isDirty).toBeTrue();
			});

			it('does not mark the tree dirty when branch-group label is not changed', async () => {
				setupTree([createEntry('foo', [])]);
				const element = await setup();
				const tree = element.catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
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
					.and.resolveTo([createEntry('foo'), createEntry('too')])
					.withArgs('b')
					.and.resolveTo([createEntry('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-confirm').click();
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.catalog[0].label).toEqual('bar');
			});

			it('keeps the tree when "Confirm Dispose Tree" popup is cancelled', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createEntry('foo'), createEntry('too')])
					.withArgs('b')
					.and.resolveTo([createEntry('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-cancel').click();
				await TestUtils.timeout();

				// Note: Tree was modified, Therefore order of elements is reversed.
				expect(element.catalog[0].label).toEqual('too');
				expect(element.catalog[1].label).toEqual('foo');
				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
			});

			it('switches the tree when a topic is selected', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createEntry('foo')])
					.withArgs('b')
					.and.resolveTo([createEntry('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.catalog[0].label).toEqual('bar');
			});
		});

		describe('drag and drop', () => {
			it('sets the dragContext on "dragstart" to the currently dragged branch', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				domEntry.dispatchEvent(new DragEvent('dragstart'));

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

			it('hides dragged branch on "dragover"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalog;
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.4999');
				const dragEntry = tree[0];
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				const signalSpy = spyOn(element, 'signal').and.callThrough();
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`)).toBeNull();
				expect(element.catalog[0].id).toBe(dragEntry.id);
				expect(element.catalog[0].ui.hidden).toBeTrue();
				expect(signalSpy).toHaveBeenCalledTimes(2);

				// Ensures that the hidden-behaviour is only called once on the first dragover.
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(signalSpy).toHaveBeenCalledTimes(3);
			});

			it('renders a preview in the tree on a geo-resource branch "dragover"', async () => {
				setupTree([createEntry('foo resource'), createEntry('faz resource')]);
				const element = await setup();
				const tree = element.catalog;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target branch
				insertionSpy.and.returnValue('0.4999');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[1].id).toBe('preview');
				expect(element.catalog[2].id).toBe(tree[1].id);

				// Insert preview after target branch
				insertionSpy.and.returnValue('0.5001');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[1].id).toBe(tree[1].id);
				expect(element.catalog[2].id).toBe('preview');
				expect(insertionSpy).toHaveBeenCalledTimes(2);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview in the tree on a group branch "dragover"', async () => {
				setupTree([createEntry('foo resource'), createEntry('foo group', [createEntry('bar resource')])]);
				const element = await setup();
				const tree = element.catalog;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target branch
				insertionSpy.and.returnValue('0.2499');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[1].id).toBe('preview');
				expect(element.catalog[2].id).toBe(tree[1].id);

				// Prepend preview to target branch
				insertionSpy.and.returnValue('0.25');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[1].children[0].id).toBe('preview');
				expect(insertionSpy).toHaveBeenCalledTimes(2);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
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
				const tree = element.catalog;
				const widthSpy = spyOn(element, '_getNormalizedClientXPositionInRect');
				const heightSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const treeDom = element.shadowRoot.querySelector(`#catalog-tree`);
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				testCases.forEach((tc) => {
					widthSpy.and.returnValue(tc[0]);
					heightSpy.and.returnValue(tc[1]);
					dropDomEntry.dispatchEvent(new DragEvent('dragover'));
					treeDom.dispatchEvent(new DragEvent('dragleave'));
					expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				});

				// Keep preview when inside the dragzone.
				widthSpy.and.returnValue(0.1);
				heightSpy.and.returnValue(0.1);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				treeDom.dispatchEvent(new DragEvent('dragleave'));
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview in the tree\'s head or tail "ondragover"', async () => {
				setupTree([createEntry('foo resource')]);
				const element = await setup();
				const tree = element.catalog;
				const insertionSpy = spyOn(element, '_getClientYHeightDiffInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree`);
				const dropDomEntryBoundingRectHeight = dropDomEntry.getBoundingClientRect().height;
				const dropDomEntryPadding = 20;

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Add preview to the start of the tree
				insertionSpy.and.returnValue(dropDomEntryBoundingRectHeight - dropDomEntryPadding);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[0].id).toBe('preview');
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);

				// Add preview to the end of the tree
				insertionSpy.and.returnValue(dropDomEntryPadding);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.catalog[1].id).toBe('preview');
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview of a geo resource on "drag over"', async () => {
				const geoResources = [createGeoResource('Aoo'), createGeoResource('Boo'), createGeoResource('Coo')];
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo(geoResources);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(geoResources[1]);
				setupTree([createEntry('foo branch'), createEntry('bar branch')]);
				const element = await setup();
				const tree = element.catalog;
				const dragDomResource = element.shadowRoot.querySelector(`#geo-resource-explorer .geo-resource:nth-child(2)`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);

				dragDomResource.dispatchEvent(new DragEvent('dragstart'));
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.catalog[1].id).toBe(tree[1].id);
				expect(element.catalog[2].id).toBe('preview');
				expect(element.catalog[2].geoResourceId).toBe(geoResources[1].id);
			});

			it('does not update preview "ondragover" when pointer is hovered over the preview branch', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalog;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				insertionSpy.and.returnValue('0.4999');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				const signalSpy = spyOn(element, 'signal').and.callThrough();
				const previewDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="preview"]`);
				previewDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(signalSpy).not.toHaveBeenCalled();
			});

			it('does not modify the tree when branch was not rearranged on "dragend"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				const expectedTree = element.catalog;
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				dragDomEntry.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.catalog).toEqual(expectedTree);
			});

			it('modifies the tree when branch was rearranged on "dragend"', async () => {
				setupTree([createEntry('foo'), createEntry('bar')]);
				const element = await setup();
				const tree = element.catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				dragDomEntry.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.catalog[1].id).toBe(tree[0].id);
				expect(element.catalog).not.toEqual(tree);
			});

			it('replaces the preview in the tree with the dragContext on "drop"', async () => {
				setupTree([createEntry('foo'), createEntry('bar')]);
				const element = await setup();
				const tree = element.catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.catalog[1].id).toEqual(tree[0].id);
				expect(element.catalog[1].ui.hidden).toBeFalse();
			});
		});
	});
});
