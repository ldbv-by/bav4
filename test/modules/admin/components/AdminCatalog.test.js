import { $injector } from '../../../../src/injection';
import { AdminCatalog } from '../../../../src/modules/admin/components/AdminCatalog';
import { TestUtils } from '../../../test-utils';
import { createUniqueId } from '../../../../src/utils/numberUtils';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { Environment } from '../../../../src/modules/admin/services/AdminCatalogService';
window.customElements.define(AdminCatalog.tag, AdminCatalog);

describe('AdminCatalog', () => {
	let store;

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
		},
		saveCatalog: async () => {},
		publishCatalog: async () => {}
	};

	const setup = async (state = {}) => {
		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('AdminCatalogService', adminCatalogServiceMock);
		return TestUtils.render(AdminCatalog.tag);
	};

	const setupTree = (tree) => {
		return spyOn(adminCatalogServiceMock, 'getCatalog').and.resolveTo(tree);
	};

	const createBranch = (label, childEntries = null) => {
		return { label: label, children: childEntries ? [...childEntries] : null };
	};

	const createGeoResource = (label) => {
		return { label: label, id: createUniqueId() };
	};

	const defaultTreeMock = [
		createBranch('foo resource'),
		createBranch('faz resource', [createBranch('sub faz')]),
		createBranch('bar group', [createBranch('sub foo'), createBranch('sub bar'), createBranch('sub baz')])
	];

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			await setup();
			const element = new AdminCatalog();

			expect(element.getModel()).toEqual({
				topics: [],
				geoResources: [],
				catalog: [],
				geoResourceFilter: '',
				dragContext: null,
				popupType: null,
				loadingHint: {
					catalog: false,
					geoResource: false
				},
				error: false,
				notification: ''
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

			const resources = [...element.shadowRoot.querySelectorAll('#geo-resource-explorer-content .geo-resource span.label')];
			expect(resources.map((r) => r.textContent)).toEqual(['1', '20', 'Aoo', 'Baz', 'Boo', 'Moo', 'Zag']);
		});

		it('renders a tree', async () => {
			setupTree(defaultTreeMock);
			const element = await setup();
			const tree = element.getModel().catalog;

			tree.forEach((branch) => {
				const branchLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .branch-label`);
				expect(branchLabelHtml.textContent).toEqual(branch.label);
			});

			tree[2].children.forEach((branch) => {
				const branchLabelHtml = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .branch-label`);
				expect(branchLabelHtml.textContent).toBe(branch.label);
			});
		});

		it('renders tree children when branch property "ui.foldout" is true', async () => {
			setupTree([{ ...createBranch('bar group', [createBranch('sub foo')]), ui: { foldout: true } }]);
			const element = await setup();

			const tree = element.getModel().catalog;
			const child = tree[0].children[0];

			expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${child.id}"]`)).not.toBeNull();
		});

		it('skips rendering of tree children when branch property "ui.foldout" is false', async () => {
			setupTree([{ ...createBranch('bar group', [createBranch('sub foo')]), ui: { foldout: false } }]);
			const element = await setup();

			const tree = element.getModel().catalog;
			const child = tree[0].children[0];

			expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${child.id}"]`)).toBeNull();
		});

		it('renders "topic" select', async () => {
			const element = await setup();
			const select = element.shadowRoot.querySelector('select#topic-select');
			expect(select).not.toBeNull();
		});

		it('renders "topic" options', async () => {
			spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
				{ id: 'a-id', label: 'A' },
				{ id: 'b-id', label: 'B' }
			]);

			const element = await setup();
			const select = element.shadowRoot.querySelector('select#topic-select');
			expect(select.options).toHaveSize(2);
			expect(select.options[0].textContent).toEqual('A');
			expect(select.options[0].value).toEqual('a-id');
			expect(select.options[1].textContent).toEqual('B');
			expect(select.options[1].value).toEqual('b-id');
		});

		it('renders a hint and drag-zone when tree is empty', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('#catalog-tree .empty-tree-zone')).not.toBeNull();
			expect(element.shadowRoot.querySelector('#catalog-tree #catalog-tree-root')).toBeNull();
		});

		it('renders "save draft" button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('button#btn-save-draft');
			expect(button).not.toBeNull();
			expect(button.textContent).toEqual('admin_catalog_save_draft');
		});

		it('renders "publish" button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('button#btn-publish');
			expect(button).not.toBeNull();
			expect(button.querySelector('span').textContent).toEqual('admin_catalog_publish');
		});

		it('renders "georesource refresh" button', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('button#btn-publish');
			expect(button).not.toBeNull();
			expect(button.querySelector('span').textContent).toEqual('admin_catalog_publish');
		});

		it('renders "georesource filter" input', async () => {
			const element = await setup();
			const button = element.shadowRoot.querySelector('button#btn-geo-resource-refresh');
			expect(button).not.toBeNull();
			expect(button.textContent).toEqual('admin_georesource_refresh');
		});

		it('renders badges on geo resource', async () => {
			spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo([
				{ ...createGeoResource('with badge'), authRoles: ['FOO BADGE', 'BAR BADGE'] },
				{ ...createGeoResource('without badge') }
			]);
			const element = await setup();

			const withBadgeResource = element.shadowRoot.querySelector('#geo-resource-explorer-content .geo-resource:nth-child(1)');
			const withoutBadgeResource = element.shadowRoot.querySelector('#geo-resource-explorer-content .geo-resource:nth-child(2)');

			expect(withBadgeResource.querySelector('.roles-container ba-badge:nth-child(1)').label).toBe('FOO BADGE');
			expect(withBadgeResource.querySelector('.roles-container ba-badge:nth-child(2)').label).toBe('BAR BADGE');
			expect(withoutBadgeResource.querySelector('.roles-container')).toBeNull();
		});

		it('renders badges on catalog leaves', async () => {
			setupTree([{ ...createBranch('with badge'), authRoles: ['FOO BADGE', 'BAR BADGE'] }, { ...createBranch('without badge') }]);
			const element = await setup();
			const catalog = element.getModel().catalog;
			const withBadge = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${catalog[0].id}`);
			const withoutBadge = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${catalog[1].id}`);

			expect(withBadge.querySelector('.roles-container ba-badge:nth-child(1)').label).toBe('FOO BADGE');
			expect(withBadge.querySelector('.roles-container ba-badge:nth-child(2)').label).toBe('BAR BADGE');
			expect(withoutBadge.querySelector('.roles-container')).toBeNull();
		});

		it('renders a loading hint when AdminCatalog is initialized', async () => {
			const element = await setup();

			// fake initialization to test loading screen appearance.
			element._initializeAsync();
			expect(element.getModel().loadingHint.catalog).toBeTrue();
			expect(element.shadowRoot.querySelector('.empty-tree-zone.loading-hint-container')).not.toBeNull();
			expect(element.shadowRoot.querySelector('#geo-resource-explorer-content .loading-hint-container')).not.toBeNull();
			await TestUtils.timeout();
			expect(element.getModel().loadingHint.catalog).toBeFalse();
			expect(element.shadowRoot.querySelector('.empty-tree-zone.loading-hint-container')).toBeNull();
			expect(element.shadowRoot.querySelector('#geo-resource-explorer-content .loading-hint-container')).toBeNull();
		});

		it('renders a loading hint when tree is requested', async () => {
			const element = await setup();

			// fake initialization to test loading screen appearance.
			element._requestCatalog({ id: 'foo' });
			expect(element.getModel().loadingHint.catalog).toBeTrue();
			expect(element.shadowRoot.querySelector('.empty-tree-zone.loading-hint-container')).not.toBeNull();
			await TestUtils.timeout();
			expect(element.getModel().loadingHint.catalog).toBeFalse();
			expect(element.shadowRoot.querySelector('.empty-tree-zone.loading-hint-container')).toBeNull();
		});

		it('renders a loading hint when geo resources are requested', async () => {
			const element = await setup();

			// fake initialization to test loading screen appearance.
			element._requestGeoResources();
			expect(element.getModel().loadingHint.geoResource).toBeTrue();
			expect(element.shadowRoot.querySelector('#geo-resource-explorer-content .loading-hint-container')).not.toBeNull();
			await TestUtils.timeout();
			expect(element.getModel().loadingHint.geoResource).toBeFalse();
			expect(element.shadowRoot.querySelector('#geo-resource-explorer-content .loading-hint-container')).toBeNull();
		});
	});

	describe('catalog tree', () => {
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

		describe('user actions', () => {
			it('creates a branch in the tree when "Create Branch" Button is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-add-group-branch').click();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[branch-id]`)).toHaveSize(2);
				expect(domEntry.querySelectorAll('li[branch-id]')).toHaveSize(1);
			});

			it('prepends a branch on root level in the tree when "Prepend Branch" Button is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const button = element.shadowRoot.querySelector('.btn-add-group-branch-on-root');
				button.click();

				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li`)).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#catalog-tree-root li:nth-child(1) .branch-label').textContent).toEqual('admin_catalog_new_branch');
			});

			it('opens a popup with the branch\'s current label when "Edit Group Label Button" is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');

				expect(editInput.value).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).not.toBeNull();
			});

			it('edits the label of a branch when "Confirm Group Label Button" is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');

				editInput.value = 'bar';
				confirmBtn.click();

				expect(domEntry.querySelector('.branch-label').textContent).toBe('bar');
			});

			it('closes popup of a branch when "Cancel Group Label"  Button is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const cancelBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-cancel');
				cancelBtn.click();

				expect(domEntry.querySelector('.branch-label').textContent).toBe('foo');
				expect(element.shadowRoot.querySelector('.popup')).toBeNull();
			});

			it('deletes a branch from the tree when "Delete Entry Button" is pressed', async () => {
				setupTree([createBranch('foo'), createBranch('faz'), createBranch('bar', [createBranch('sub bar a'), createBranch('another bar child')])]);
				const element = await setup();
				const tree = element.getModel().catalog;

				const fazDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				const barDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[2].id}"]`);
				const subBarDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[2].children[0].id}"]`);

				fazDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${fazDomEntry.id}"]`)).toBeNull();

				subBarDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${subBarDomEntry.id}"]`)).toBeNull();

				barDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${barDomEntry.id}"]`)).toBeNull();
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[branch-id]`)).toHaveSize(1);
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"] .branch-label`).textContent).toBe('foo');
			});

			it('toggles the branch property "ui.foldout" when "Foldout Button" is clicked', async () => {
				setupTree([{ ...createBranch('foo', [createBranch('sub foo'), createBranch('sub bar')]), ui: { foldout: false } }]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const openBtn = element.shadowRoot.querySelector(`li[branch-id="${tree[0].id}"] .btn-foldout`);

				openBtn.click();
				expect(element.getModel().catalog[0].ui.foldout).toBeTrue();

				openBtn.click();
				expect(element.getModel().catalog[0].ui.foldout).toBeFalse();
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

				const refreshSpy = spyOn(element, '_requestGeoResources').and.resolveTo();
				element.shadowRoot.querySelector('#btn-geo-resource-refresh').click();
				expect(refreshSpy).toHaveBeenCalledTimes(1);
			});

			it('saves the tree', async () => {
				setupTree([{ ...createBranch('foo', [createBranch('sub foo'), createBranch('sub bar')]), ui: { foldout: false } }]);
				const element = await setup();
				const saveCatalogSpy = spyOn(adminCatalogServiceMock, 'saveCatalog').and.resolveTo();
				const saveDraftBtn = element.shadowRoot.querySelector('#btn-save-draft');
				saveDraftBtn.click();
				await TestUtils.timeout(); // wait for store to update

				expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_draft_saved_notification');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
				expect(saveCatalogSpy).toHaveBeenCalledTimes(1);
			});

			it('shows publish popup when "Publish" Button is pressed', async () => {
				const element = await setup();
				element.shadowRoot.querySelector('#btn-publish').click();
				expect(element.shadowRoot.querySelector('#publish-popup')).not.toBeNull();
			});

			it('closes publish popup when "Cancel Publish" Button is pressed', async () => {
				const element = await setup();
				element.shadowRoot.querySelector('#btn-publish').click();
				element.shadowRoot.querySelector('.btn-cancel').click();

				expect(element.shadowRoot.querySelector('#publish-popup')).toBeNull();
			});

			it('publishes the tree', async () => {
				setupTree([{ ...createBranch('foo', [createBranch('sub foo'), createBranch('sub bar')]), ui: { foldout: false } }]);
				const element = await setup();
				const publishSpy = spyOn(adminCatalogServiceMock, 'publishCatalog').and.resolveTo();
				const environments = [
					{ value: Environment.STAGE, translate: 'admin_catalog_environment_stage' },
					{ value: Environment.PRODUCTION, translate: 'admin_catalog_environment_production' }
				];

				for (const environment of environments) {
					element.shadowRoot.querySelector('#btn-publish').click();
					const select = element.shadowRoot.querySelector('#select-environment');
					select.value = environment.value;
					expect(select.options[select.selectedIndex].textContent).toBe(environment.translate);
					element.shadowRoot.querySelector('.popup-confirm .btn-confirm').click();
					await TestUtils.timeout(); // wait for store to update

					expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_published_notification');
					expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
					expect(publishSpy).toHaveBeenCalledWith(environment.value, 'ba');
				}

				expect(publishSpy).toHaveBeenCalledTimes(Object.entries(Environment).length);
			});
		});

		describe('tree has pending changes', () => {
			const modifyTreeWithDragAndDrop = (element) => {
				const tree = element.getModel().catalog;
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
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-edit-group-branch').click();
				const editInput = element.shadowRoot.querySelector('#text-label-edit input.popup-input');
				const confirmBtn = element.shadowRoot.querySelector('#text-label-edit button.btn-confirm');
				editInput.value = 'bar';
				confirmBtn.click();

				expect(element.isDirty).toBeTrue();
			});

			it('does not mark the tree dirty when branch-group label is not changed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
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
					.and.resolveTo([createBranch('foo'), createBranch('too')])
					.withArgs('b')
					.and.resolveTo([createBranch('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-confirm').click();
				// waits for a catalog request.
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.getModel().catalog[0].label).toEqual('bar');
			});

			it('keeps the tree when "Confirm Dispose Tree" popup is cancelled', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createBranch('foo'), createBranch('too')])
					.withArgs('b')
					.and.resolveTo([createBranch('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				const popup = element.shadowRoot.querySelector('#confirm-dispose-popup');
				popup.querySelector('.btn-cancel').click();

				// Note: Tree was modified, Therefore order of elements is reversed.
				expect(element.getModel().catalog[0].label).toEqual('too');
				expect(element.getModel().catalog[1].label).toEqual('foo');
				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
			});

			it('switches the tree when a topic is selected', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCatalog')
					.withArgs('a')
					.and.resolveTo([createBranch('foo')])
					.withArgs('b')
					.and.resolveTo([createBranch('bar')]);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				await TestUtils.timeout();

				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.getModel().catalog[0].label).toEqual('bar');
			});
		});

		describe('drag and drop', () => {
			it('sets the dragContext on "dragstart" to the currently dragged branch', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.getModel().catalog;

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

			it('hides dragged branch on similar context on "dragover"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.getModel().catalog;
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.4999');
				const dragEntry = tree[0];
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`);

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				const hideSpy = spyOn(element, '_hideBranch').and.callThrough();
				dragDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`)).toBeNull();
				expect(element.getModel().catalog[0].id).toBe(dragEntry.id);
				expect(element.getModel().catalog[0].ui.hidden).toBeTrue();
				expect(hideSpy).toHaveBeenCalledTimes(1);
			});

			it('hides dragged branch on "dragover"', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.getModel().catalog;
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.4999');
				const dragEntry = tree[0];
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				const hideSpy = spyOn(element, '_hideBranch').and.callThrough();
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${dragEntry.id}"]`)).toBeNull();
				expect(element.getModel().catalog[0].id).toBe(dragEntry.id);
				expect(element.getModel().catalog[0].ui.hidden).toBeTrue();
				expect(hideSpy).toHaveBeenCalledTimes(1);

				// Ensures that the hidden-behaviour is only called once on the first dragover.
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(hideSpy).toHaveBeenCalledTimes(1);
			});

			it('renders a preview in the tree on a geo-resource branch "dragover"', async () => {
				setupTree([createBranch('foo resource'), createBranch('faz resource')]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target branch
				insertionSpy.and.returnValue('0.4999');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[1].id).toBe('preview');
				expect(element.getModel().catalog[2].id).toBe(tree[1].id);

				// Insert preview after target branch
				insertionSpy.and.returnValue('0.5001');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[1].id).toBe(tree[1].id);
				expect(element.getModel().catalog[2].id).toBe('preview');
				expect(insertionSpy).toHaveBeenCalledTimes(2);
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(1);
			});

			it('renders a preview in the tree on a group branch "dragover"', async () => {
				setupTree([createBranch('foo resource'), createBranch('foo group', [createBranch('bar resource')])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const insertionSpy = spyOn(element, '_getNormalizedClientYPositionInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Insert preview before target branch
				insertionSpy.and.returnValue('0.2499');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[1].id).toBe('preview');
				expect(element.getModel().catalog[2].id).toBe(tree[1].id);

				// Prepend preview to target branch
				insertionSpy.and.returnValue('0.25');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[1].children[0].id).toBe('preview');
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
				const tree = element.getModel().catalog;
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
				setupTree([createBranch('foo'), createBranch('bar'), createBranch('faz')]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const insertionSpy = spyOn(element, '_getClientYHeightDiffInRect');
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree`);
				const dropDomEntryBoundingRectHeight = dropDomEntry.getBoundingClientRect().height;
				const dropDomEntryPadding = 20;

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));

				// Add preview to the start of the tree
				insertionSpy.and.returnValue(dropDomEntryBoundingRectHeight - dropDomEntryPadding);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[0].id).toBe('preview');
				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).not.toBeNull();

				// Add preview to the end of the tree
				insertionSpy.and.returnValue(dropDomEntryPadding);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[3].id).toBe('preview');
				expect(element.shadowRoot.querySelector('#catalog-tree-root li[branch-id="preview"]')).not.toBeNull();

				// Skip Preview when adding somewhere in between but outside of a branch
				insertionSpy.and.returnValue(dropDomEntryBoundingRectHeight * 0.5);
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.shadowRoot.querySelector('#catalog-tree-root li[branch-id="preview"]')).toBeNull();
			});

			it('renders a preview of a geo resource on "drag over"', async () => {
				const geoResources = [createGeoResource('Aoo'), createGeoResource('Boo'), createGeoResource('Coo')];
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo(geoResources);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(geoResources[1]);
				setupTree([createBranch('foo branch'), createBranch('bar branch')]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const dragDomResource = element.shadowRoot.querySelector(`#geo-resource-explorer .geo-resource:nth-child(2)`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);

				dragDomResource.dispatchEvent(new DragEvent('dragstart'));
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.getModel().catalog[1].id).toBe(tree[1].id);
				expect(element.getModel().catalog[2].id).toBe('preview');
				expect(element.getModel().catalog[2].geoResourceId).toBe(geoResources[1].id);
			});

			it('"renders a preview on an empty tree on "drag over"', async () => {
				const geoResources = [createGeoResource('Aoo'), createGeoResource('Boo'), createGeoResource('Coo')];
				spyOn(adminCatalogServiceMock, 'getGeoResources').and.resolveTo(geoResources);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(geoResources[1]);
				const element = await setup();
				const dragDomResource = element.shadowRoot.querySelector(`#geo-resource-explorer .geo-resource:nth-child(2)`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree`);

				dragDomResource.dispatchEvent(new DragEvent('dragstart'));
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				expect(element.getModel().catalog[0].id).toBe('preview');
				expect(element.getModel().catalog).toHaveSize(1);
				// Drag over again to mimic case when drag over is fired after preview has been set.
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				expect(element.getModel().catalog[0].id).toBe('preview');
				expect(element.getModel().catalog).toHaveSize(1);
			});

			it('does not update preview "ondragover" when pointer is hovered over the preview branch', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const tree = element.getModel().catalog;
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
				const tree = element.getModel().catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				const expectedTree = element.getModel().catalog;
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				dragDomEntry.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.getModel().catalog).toEqual(expectedTree);
			});

			it('modifies the tree when branch was rearranged on "dragend"', async () => {
				setupTree([createBranch('foo'), createBranch('bar')]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				dragDomEntry.dispatchEvent(new DragEvent('dragend'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.getModel().catalog[1].id).toBe(tree[0].id);
				expect(element.getModel().catalog).not.toEqual(tree);
			});

			it('replaces the preview in the tree with the dragContext on "drop"', async () => {
				setupTree([createBranch('foo'), createBranch('bar')]);
				const element = await setup();
				const tree = element.getModel().catalog;
				const dragDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				const dropDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');

				dragDomEntry.dispatchEvent(new DragEvent('dragstart'));
				dropDomEntry.dispatchEvent(new DragEvent('dragover'));

				const signalSpy = spyOn(element, 'signal').and.callThrough();
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));

				expect(element.shadowRoot.querySelectorAll('#catalog-tree-root li[branch-id="preview"]')).toHaveSize(0);
				expect(element.getModel().catalog[1].id).toEqual(tree[0].id);
				expect(element.getModel().catalog[1].ui.hidden).toBeFalse();
				expect(signalSpy).toHaveBeenCalledTimes(1);
			});

			it('adds a css hint on "drop"', async () => {
				setupTree([createBranch('foo'), createBranch('bar')]);
				const element = await setup();
				const tree = element.getModel().catalog;

				spyOn(element, '_getNormalizedClientYPositionInRect').and.returnValue('0.5001');
				element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`).dispatchEvent(new DragEvent('dragstart'));
				element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`).dispatchEvent(new DragEvent('dragover'));
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));

				const droppedElement = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"] .catalog-branch`);
				expect(droppedElement.classList.contains('branch-added')).toBeTrue();
				droppedElement.dispatchEvent(new Event('animationend'));
				expect(droppedElement.classList.contains('branch-added')).toBeFalse();
			});

			it('does not signal a tree update when preview is not set on "drop"', async () => {
				setupTree([createBranch('foo'), createBranch('bar')]);
				const element = await setup();
				const signalSpy = spyOn(element, 'signal').and.callThrough();
				element.shadowRoot.querySelector('#catalog-tree').dispatchEvent(new DragEvent('drop'));
				expect(signalSpy).toHaveBeenCalledTimes(0);
			});
		});
	});

	describe('error', () => {
		it('displays an error page when fetching topics  went wrong', async () => {
			spyOn(adminCatalogServiceMock, 'getTopics').and.rejectWith('foo');
			const element = await setup();

			expect(element.shadowRoot.querySelector('.error-message').textContent).toEqual('admin_catalog_error_message');
			expect(element.shadowRoot.querySelector('#catalog-editor')).toBeNull();
			expect(element.getModel().error).toBeTrue();
		});

		it('displays an error page when fetching geo-resources went wrong', async () => {
			spyOn(adminCatalogServiceMock, 'getGeoResources').and.rejectWith('foo');
			const element = await setup();

			expect(element.shadowRoot.querySelector('.error-message').textContent).toEqual('admin_catalog_error_message');
			expect(element.shadowRoot.querySelector('#catalog-editor')).toBeNull();
			expect(element.getModel().error).toBeTrue();
		});

		it('displays an error page when fetching catalog went wrong', async () => {
			spyOn(adminCatalogServiceMock, 'getCatalog').and.rejectWith('foo');
			const element = await setup();

			expect(element.shadowRoot.querySelector('.error-message').textContent).toEqual('admin_catalog_error_message');
			expect(element.shadowRoot.querySelector('#catalog-editor')).toBeNull();
			expect(element.getModel().error).toBeTrue();
		});

		it('notifies when saving the tree fails', async () => {
			setupTree([{ ...createBranch('foo', [createBranch('sub foo'), createBranch('sub bar')]), ui: { foldout: false } }]);
			const element = await setup();
			spyOn(adminCatalogServiceMock, 'saveCatalog').and.rejectWith('foo');
			const saveDraftBtn = element.shadowRoot.querySelector('#btn-save-draft');
			saveDraftBtn.click();
			await TestUtils.timeout(); // wait for store to update

			expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_draft_save_failed_notification');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});

		it('notifies when publishing the tree fails', async () => {
			setupTree([{ ...createBranch('foo', [createBranch('sub foo'), createBranch('sub bar')]), ui: { foldout: false } }]);
			const element = await setup();
			spyOn(adminCatalogServiceMock, 'publishCatalog').and.rejectWith('foo');

			element.shadowRoot.querySelector('#btn-publish').click();
			element.shadowRoot.querySelector('.popup-confirm .btn-confirm').click();
			await TestUtils.timeout(); // wait for store to update

			expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_publish_failed_notification');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});
	});
});
