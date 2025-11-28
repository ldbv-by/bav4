import { $injector } from '../../../../src/injection';
import { AdminCatalog } from '../../../../src/modules/admin/components/AdminCatalog';
import { AdminCatalogPublishPanel } from '../../../../src/modules/admin/components/AdminCatalogPublishPanel';
import { AdminCatalogBranchPanel } from '../../../../src/modules/admin/components/AdminCatalogBranchPanel';
import { AdminCatalogConfirmActionPanel } from '../../../../src/modules/admin/components/AdminCatalogConfirmActionPanel';
import { TestUtils } from '../../../test-utils';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { modalReducer } from '../../../../src/store/modal/modal.reducer';
import { closeModal } from '../../../../src/store/modal/modal.action';
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

	const shareServiceMock = {
		copyToClipboard: async () => {}
	};

	const setup = async (state = {}) => {
		store = TestUtils.setupStoreAndDi(state, { notifications: notificationReducer, modal: modalReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AdminCatalogService', adminCatalogServiceMock)
			.registerSingleton('ShareService', shareServiceMock);

		return TestUtils.render(AdminCatalog.tag);
	};

	const setupTree = (tree) => {
		return spyOn(adminCatalogServiceMock, 'getCatalog').and.resolveTo(tree);
	};

	const createBranch = (label, childEntries = null) => {
		return { label: label, children: childEntries ? [...childEntries] : null };
	};

	const createGeoResource = (label) => {
		return { label: label, id: label };
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
			expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint')).toBeNull();
		});

		it('renders tree children when branch property "ui.foldout" is true', async () => {
			setupTree([{ ...createBranch('bar group', [createBranch('sub foo')]), ui: { foldout: true } }]);
			const element = await setup();

			const tree = element.getModel().catalog;
			const parent = tree[0];

			expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${parent.id}"] > ul.branch-collapsed`)).toBeNull();
		});

		it('skips rendering of tree children when branch property "ui.foldout" is false', async () => {
			setupTree([{ ...createBranch('bar group', [createBranch('sub foo')]), ui: { foldout: false } }]);
			const element = await setup();

			const tree = element.getModel().catalog;
			const parent = tree[0];

			expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${parent.id}"] > ul.branch-collapsed`)).not.toBeNull();
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
			expect(button.querySelector('span').textContent).toEqual('admin_catalog_save_draft');
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
			expect(button.querySelector('span').textContent).toEqual('admin_georesource_refresh');
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

		it('renders a warning hint when a geo resource is orphaned', async () => {
			setupTree([
				{ ...createBranch('Geo Resource'), geoResourceId: 'foo' },
				{ ...createBranch('Orphan Resource'), geoResourceId: 'orphan' },
				{ ...createBranch('Orphan Resource'), geoResourceId: 'another orphan' },
				{ ...createBranch('Orphan Resource'), id: 'preview', geoResourceId: 'ignored because preview' }
			]);
			spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.callFake((geoResourceId) => {
				return geoResourceId === 'foo' ? createGeoResource('foo') : null;
			});

			const element = await setup();
			const orphanElements = element.shadowRoot.querySelectorAll('.orphan');

			expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint').textContent).toEqual('admin_catalog_warning_orphan');
			expect(orphanElements[0].querySelector('.branch-label').textContent).toEqual('admin_catalog_georesource_orphaned (orphan)');
			expect(orphanElements[1].querySelector('.branch-label').textContent).toEqual('admin_catalog_georesource_orphaned (another orphan)');
			expect(orphanElements).toHaveSize(3);
		});

		it('marks category branch as an orphan when it contains an orphan child', async () => {
			spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.callFake((geoResourceId) => {
				return geoResourceId === 'foo' ? createGeoResource('foo') : null;
			});
			setupTree([
				createBranch('Parent', [{ ...createBranch('foo resource'), geoResourceId: 'foo' }]),
				createBranch('Orphan Parent', [{ ...createBranch('Orphan Resource'), geoResourceId: 'orphan' }])
			]);
			const element = await setup();
			const orphanElements = element.shadowRoot.querySelectorAll('.orphan');

			expect(orphanElements[0].querySelector('.branch-label').textContent).toEqual('Orphan Parent');
			expect(orphanElements[1].querySelector('.branch-label').textContent).toEqual('admin_catalog_georesource_orphaned (orphan)');
			expect(orphanElements).toHaveSize(2);
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

				// Tests if a entry gets inserted right before domEntry.
				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li[branch-id]`)).toHaveSize(2);
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id]:nth-child(2)`)).toBe(domEntry);
			});

			it('copies a branch to the clipboard when "Copy Clipboard Icon" is pressed', async () => {
				setupTree([{ ...createBranch('foo'), geoResourceId: 'foo resource id' }]);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue({ ...createGeoResource('foo'), id: 'foo resource id' });
				const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard');
				const element = await setup();
				const tree = element.getModel().catalog;
				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);

				domEntry.querySelector('.btn-copy-branch').click();
				await TestUtils.timeout(); // wait for notification

				expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_clipboard_notification');
				expect(clipboardSpy).toHaveBeenCalledOnceWith('foo (foo resource id)');
			});

			it('copies an orphan branch to the clipboard when "Copy Clipboard Icon" is pressed', async () => {
				setupTree([{ ...createBranch('foo'), geoResourceId: 'foo resource id' }]);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(null);
				const clipboardSpy = spyOn(shareServiceMock, 'copyToClipboard');

				const element = await setup();
				const tree = element.getModel().catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				domEntry.querySelector('.btn-copy-branch').click();

				expect(clipboardSpy).toHaveBeenCalledOnceWith('foo resource id');
			});

			it('prepends a branch on root level in the tree when "Prepend Branch" Button is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const button = element.shadowRoot.querySelector('.btn-add-group-branch-on-root');
				button.click();

				expect(element.shadowRoot.querySelectorAll(`#catalog-tree-root li`)).toHaveSize(2);
				expect(element.shadowRoot.querySelector('#catalog-tree-root li:nth-child(1) .branch-label').textContent).toEqual('admin_catalog_new_branch');
			});

			it('opens a modal to edit the branch when "Edit Group Label Button" is pressed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;

				const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
				domEntry.querySelector('.btn-edit-group-branch').click();
				// Wait for store
				TestUtils.timeout();

				expect(store.getState().modal.data.title).toEqual('admin_modal_edit_label_title');
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElement.querySelectorAll(AdminCatalogBranchPanel.tag)).toHaveSize(1);
				expect(wrapperElement.querySelector(AdminCatalogBranchPanel.tag).id).toEqual('' + tree[0].id);
				expect(wrapperElement.querySelector(AdminCatalogBranchPanel.tag).label).toEqual(tree[0].label);
				expect(wrapperElement.querySelector(AdminCatalogBranchPanel.tag).onSubmit).toEqual(element._editBranchSubmitted);
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

			it('syncs orphans when "Delete Entry Button" removes an orphan from the tree', async () => {
				setupTree([
					{ ...createBranch('Geo Resource'), geoResourceId: 'foo' },
					{ ...createBranch('Orphan Resource'), geoResourceId: 'orphan' },
					{ ...createBranch('Orphan Resource'), geoResourceId: 'another orphan' }
				]);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.callFake((geoResourceId) => {
					return geoResourceId === 'foo' ? createGeoResource('foo') : null;
				});

				const element = await setup();
				const tree = element.getModel().catalog;
				const orphanDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				const anotherOrphanDomEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[2].id}"]`);

				orphanDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint').textContent).toEqual('admin_catalog_warning_orphan');
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${orphanDomEntry.id}"]`)).toBeNull();
				expect(element.shadowRoot.querySelectorAll('.orphan')).toHaveSize(1);

				anotherOrphanDomEntry.querySelector('.btn-delete-branch').click();
				expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint')).toBeNull();
				expect(element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${anotherOrphanDomEntry.id}"]`)).toBeNull();
				expect(element.shadowRoot.querySelectorAll('.orphan')).toHaveSize(0);
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

			it('shows publish modal when "Publish" Button is pressed', async () => {
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a-id', label: 'A' },
					{ id: 'b-id', label: 'B' }
				]);

				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');
				topicSelect.selectedIndex = 1;
				topicSelect.dispatchEvent(new Event('change'));
				// waits for a catalog request.
				await TestUtils.timeout();

				// waits for modal
				element.shadowRoot.querySelector('#btn-publish').click();
				await TestUtils.timeout();

				expect(store.getState().modal.data.title).toEqual('admin_modal_publish_title');
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElement.querySelectorAll(AdminCatalogPublishPanel.tag)).toHaveSize(1);
				expect(wrapperElement.querySelector(AdminCatalogPublishPanel.tag).topicId).toEqual('b-id');
				expect(wrapperElement.querySelector(AdminCatalogPublishPanel.tag).onSubmit).toEqual(closeModal);
			});

			it('shows publish modal with warning hint when "Publish" Button is pressed', async () => {
				setupTree([{ ...createBranch('Geo Resource'), geoResourceId: 'foo' }]);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(null);

				const element = await setup();

				// waits for modal
				element.shadowRoot.querySelector('#btn-publish').click();
				await TestUtils.timeout();

				expect(store.getState().modal.data.title).toEqual('admin_modal_publish_title');
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElement.querySelectorAll(AdminCatalogPublishPanel.tag)).toHaveSize(1);
				expect(wrapperElement.querySelector(AdminCatalogPublishPanel.tag).warningHint).toEqual('admin_catalog_warning_orphan');
				expect(wrapperElement.querySelector(AdminCatalogPublishPanel.tag).onSubmit).toEqual(closeModal);
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

			it('marks the tree dirty when a branch has been deleted', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();

				const tree = element.getModel().catalog;
				const treeEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[1].id}"]`);
				treeEntry.querySelector('.btn-delete-branch').click();

				expect(element.isDirty).toBe(true);
			});

			it('removes dirty flag when modified tree is saved', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();

				modifyTreeWithDragAndDrop(element);
				element.shadowRoot.querySelector('#btn-save-draft').click();
				await TestUtils.timeout();

				expect(element.isDirty).toBe(false);
			});

			it('marks the tree dirty when branch-group label is modified', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				element._editBranchSubmitted(tree[0].id, 'bar');
				expect(element.isDirty).toBeTrue();
			});

			it('does not mark the tree dirty when branch-group label is not changed', async () => {
				setupTree([createBranch('foo', [])]);
				const element = await setup();
				const tree = element.getModel().catalog;
				element._editBranchSubmitted(tree[0].id, tree[0].label);
				expect(element.isDirty).toBeFalse();
			});

			it('shows a confirmation modal when another topic is selected on a dirty tree state', async () => {
				setupTree(defaultTreeMock);
				const element = await setup();
				const topicSelect = element.shadowRoot.querySelector('#topic-select');

				modifyTreeWithDragAndDrop(element);
				topicSelect.dispatchEvent(new Event('change'));

				expect(store.getState().modal.data.title).toEqual('admin_modal_tree_dispose_title');
				const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
				expect(wrapperElement.querySelectorAll(AdminCatalogConfirmActionPanel.tag)).toHaveSize(1);
				expect(wrapperElement.querySelector(AdminCatalogConfirmActionPanel.tag).onSubmit).toEqual(element._switchTreeSubmitted);
			});

			it('switches the tree while tree is dirty', async () => {
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
				await element._switchTreeSubmitted();

				expect(element.getModel().catalog[0].label).toEqual('bar');
			});

			it('switches the tree when a topic is selected', async () => {
				const treeFoo = [{ ...createBranch('Geo Resource'), geoResourceId: 'foo' }];
				const treeOrphan = [{ ...createBranch('Orphan Resource'), geoResourceId: 'orphan' }];
				spyOn(adminCatalogServiceMock, 'getTopics').and.resolveTo([
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				]);
				spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.callFake((geoResourceId) => {
					return geoResourceId === 'foo' ? createGeoResource('foo') : null;
				});
				spyOn(adminCatalogServiceMock, 'getCatalog').withArgs('a').and.resolveTo(treeFoo).withArgs('b').and.resolveTo(treeOrphan);

				const element = await setup();
				const switchTopic = async (index) => {
					const topicSelect = element.shadowRoot.querySelector('#topic-select');
					topicSelect.selectedIndex = index;
					topicSelect.dispatchEvent(new Event('change'));
					await TestUtils.timeout();
				};

				await switchTopic(1);
				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint')).not.toBeNull();
				expect(element.getModel().catalog[0].label).toEqual('admin_catalog_georesource_orphaned (orphan)');

				await switchTopic(0);
				expect(element.shadowRoot.querySelector('#confirm-dispose-popup')).toBeNull();
				expect(element.shadowRoot.querySelector('.warning-hint-container .warning-hint')).toBeNull();
				expect(element.getModel().catalog[0].label).toEqual('foo');
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

		it('notifies when copy to clipboard failed on a branch', async () => {
			setupTree([{ ...createBranch('foo'), geoResourceId: 'foo resource id' }]);
			spyOn(adminCatalogServiceMock, 'getCachedGeoResourceById').and.returnValue(null);
			spyOn(shareServiceMock, 'copyToClipboard').and.rejectWith();

			const element = await setup();
			const tree = element.getModel().catalog;

			const domEntry = element.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${tree[0].id}"]`);
			domEntry.querySelector('.btn-copy-branch').click();

			await TestUtils.timeout(); // wait for notification

			expect(store.getState().notifications.latest.payload.content).toBe('admin_catalog_clipboard_error_notification');
		});
	});
});
