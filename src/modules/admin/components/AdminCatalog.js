/**
 * @module modules/admin/components/AdminCatalog
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './adminCatalog.css';
import { $injector } from '../../../injection';
import { Tree } from '../utils/Tree';
import { createUniqueId } from '../../../utils/numberUtils';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { closeModal, openModal } from '../../../store/modal/modal.action';

const Update_Catalog = 'update_catalog';
const Update_Geo_Resources = 'update_geo_resources';
const Update_Geo_Resource_Filter = 'update_geo_resource_filter';
const Update_Topics = 'update_topics';
const Update_Drag_Context = 'update_drag_context';
const Update_Error = 'update_error';
const Update_Loading_Hint = 'update_loading_hint';

/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminCatalog extends MvuElement {
	#branchWasPersisted;
	#isTreeDirty;
	#cachedTopic;
	#selectedTopic;
	#tree;
	#defaultBranchProperties;
	#orphanSet;

	constructor() {
		super({
			topics: [],
			catalog: [],
			geoResources: [],
			geoResourceFilter: '',
			dragContext: null,
			error: false,
			loadingHint: {
				geoResource: false,
				catalog: false
			},
			notification: ''
		});

		const { AdminCatalogService: adminCatalogService, TranslationService: translationService } = $injector.inject(
			'AdminCatalogService',
			'TranslationService'
		);

		this._adminCatalogService = adminCatalogService;
		this._translationService = translationService;
		this.#branchWasPersisted = false;
		this.#isTreeDirty = false;
		this.#cachedTopic = null;
		this.#selectedTopic = null;
		this.#orphanSet = new Set();
		this.#defaultBranchProperties = {
			id: null,
			children: null,
			label: '',
			geoResourceId: null,
			authRoles: [],
			ui: {
				hidden: false,
				foldout: true
			},
			isOrphaned: false
		};

		this.#tree = new Tree((branch) => {
			/**
			 * Called when a branch changes or is added to the tree (Setup).
			 * Used to add custom properties to the branch and ensures each branch follows a given data structure (see. this.#defaultBranchProperties)
			 **/

			if (!branch.geoResourceId) return { ...this.#defaultBranchProperties, ...branch };

			const geoResource = this._adminCatalogService.getCachedGeoResourceById(branch.geoResourceId);
			branch.isOrphaned = geoResource === null;

			if (branch.isOrphaned) {
				branch.label = `${this._translationService.translate('admin_catalog_georesource_orphaned')} (${branch.geoResourceId})`;
				branch.authRoles = [];

				// keys in sets are unique => duplicate safety.
				this.#orphanSet.add(branch.id);
			} else {
				branch.label = geoResource.label;
				branch.authRoles = geoResource.authRoles;
				branch.geoResourceId = geoResource.id;
				this.#orphanSet.delete(branch.id);
			}

			return { ...this.#defaultBranchProperties, ...branch };
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._initializeAsync();
	}

	async _initializeAsync() {
		this.signal(Update_Loading_Hint, { catalog: true, geoResource: true });
		if (!(await this._requestTopics())) return;
		if (!(await this._requestGeoResources())) return;

		this.#selectedTopic = this.getModel().topics[0];
		await this._requestCatalog(this.#selectedTopic);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Error:
				return { ...model, error: data === true };
			case Update_Catalog:
				return { ...model, catalog: [...data] };
			case Update_Drag_Context:
				return { ...model, dragContext: data ? { ...data } : null };
			case Update_Geo_Resources:
				return { ...model, geoResources: [...data] };
			case Update_Topics:
				return { ...model, topics: [...data] };
			case Update_Geo_Resource_Filter:
				return { ...model, geoResourceFilter: data };
			case Update_Loading_Hint: {
				return { ...model, loadingHint: { ...data } };
			}
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { topics, geoResources, catalog, geoResourceFilter, error, loadingHint } = model;
		const geoResourceFilterUC = geoResourceFilter ? geoResourceFilter.toUpperCase() : null;
		const translate = (key) => this._translationService.translate(key);

		const onTopicSelected = (evt) => {
			const topicId = evt.target.value;
			const topic = topics.find((t) => t.id === topicId);
			if (this.#isTreeDirty) {
				evt.target.value = this.#selectedTopic.id;
				this.#cachedTopic = topic;
				openModal(
					translate('admin_modal_tree_dispose_title'),
					html`<ba-admin-catalog-confirm-action-panel .onSubmit=${this._switchTreeSubmitted}></ba-admin-catalog-confirm-action-panel>`
				);
				return;
			}

			this._requestCatalog(topic);
		};

		const onGeoResourceDragStart = (evt, geoResource) => {
			evt.stopPropagation();
			this.signal(Update_Drag_Context, { id: createUniqueId(), label: geoResource.label, geoResourceId: geoResource.id });
		};

		const onBranchDragStart = (evt, branch) => {
			evt.stopPropagation();
			const tree = this.#tree;
			const uiProperties = { ...branch.ui, foldout: false };

			tree.update(branch.id, { ui: uiProperties });
			this.signal(Update_Catalog, tree.get());
			this.signal(Update_Drag_Context, { ...branch });
			this.#branchWasPersisted = false;
		};

		const onBranchDragEnd = (branch) => {
			const tree = this.#tree;

			// Restore Branch in tree when it was not rearranged.
			if (!this.#branchWasPersisted) {
				const uiProperties = { ...branch.ui, hidden: false };
				tree.update(branch.id, { ui: uiProperties });
			}

			// Ensure preview cleanup.
			tree.remove('preview');
			this.signal(Update_Catalog, tree.get());
			this.signal(Update_Drag_Context, null);
		};

		const onBranchDragOver = (evt, branch) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (branch?.id === 'preview') return;

			const dragContext = this.getModel().dragContext;

			if (dragContext.ui && dragContext.ui.hidden !== true) {
				this._hideBranch(dragContext);
			}

			// Can not drag over itself
			if (branch?.id === dragContext.id) {
				return;
			}

			const previewEntry = {
				label: dragContext.label,
				geoResourceId: dragContext.geoResourceId,
				id: 'preview'
			};

			const tree = this.#tree;
			tree.remove('preview');

			if (catalog.length === 0 || (catalog.length === 1 && catalog[0].id === 'preview')) {
				tree.prependAt(null, previewEntry);
				this.signal(Update_Catalog, tree.get());
				return;
			}

			if (!branch) {
				// Handles edge case, when a branch is dragged at the start or end of the tree.
				// In that case the dragged branch should get appended or prepended.
				const rect = evt.currentTarget.getBoundingClientRect();
				const heightDifference = this._getClientYHeightDiffInRect(evt.clientY, rect);
				const computedStyle = window.getComputedStyle(evt.currentTarget);
				const paddingTop = parseFloat(computedStyle.paddingTop);
				const paddingBottom = parseFloat(computedStyle.paddingBottom);

				if (heightDifference >= rect.height - paddingTop) {
					tree.prependAt(null, previewEntry);
				} else if (heightDifference <= paddingBottom) {
					tree.appendAt(null, previewEntry);
				}

				this.signal(Update_Catalog, tree.get());
				return;
			}

			// remove pending animation
			const branchAnimation = evt.currentTarget.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .catalog-branch`);
			branchAnimation.classList.remove('branch-added');

			// Find pointer position within the current dropzone target (evt.currentTarget) to determine where to drop the dragContext.
			const rect = evt.currentTarget.querySelector('.catalog-branch').getBoundingClientRect();
			const insertionValue = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			if (branch.children) {
				if (insertionValue > 1) {
					return;
				}

				if (insertionValue < 0.25) {
					tree.addAt(branch.id, previewEntry, true);
				} else {
					const branchUIProperties = { ...branch.ui, foldout: true, hidden: false };
					tree.update(branch.id, { ui: branchUIProperties });
					tree.prependAt(branch.id, previewEntry);
				}
			} else {
				tree.addAt(branch.id, previewEntry, insertionValue < 0.5);
			}

			this.signal(Update_Catalog, tree.get());
		};

		const onBranchDrop = (evt) => {
			const tree = this.#tree;
			const dragContext = this.getModel().dragContext;
			const previewEntry = tree.getById('preview');

			if (previewEntry) {
				const uiProperties = { ...dragContext.ui };
				uiProperties.hidden = false;
				tree.remove(dragContext.id);
				tree.replace('preview', { ...dragContext, ui: uiProperties });
				this.signal(Update_Catalog, tree.get());
				this.#isTreeDirty = true;
				this.#branchWasPersisted = true;

				// Restart / Starts animation when dropped.
				const droppedBranchDom = evt.currentTarget.querySelector(`#catalog-tree-root li[branch-id="${dragContext.id}"] .catalog-branch`);
				droppedBranchDom.classList.remove('branch-added');
				droppedBranchDom.classList.add('branch-added');
				droppedBranchDom.getAnimations()[0].currentTime = 0;
			}

			evt.preventDefault();
		};

		const onTreeDragZoneLeave = (evt) => {
			/*
			 * onTreeDragZoneLeave not only gets called when the tree-DOM has been left but also when the mouse enters a child of the tree-DOM,
			 * thus makes the event unreliable to trust if the tree-dom really has been left.
			 * Therefore the following workaround is applied which checks if the pointer is outside the drag zone's bounding box.
			 */
			const rect = evt.currentTarget.getBoundingClientRect();
			const clientXNormalizedPositionInRect = this._getNormalizedClientXPositionInRect(evt.clientX, rect);
			const clientYNormalizedPositionInRect = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			const isOutsideOfDragZone =
				clientXNormalizedPositionInRect < 0 ||
				clientXNormalizedPositionInRect > 1 ||
				clientYNormalizedPositionInRect < 0 ||
				clientYNormalizedPositionInRect > 1;

			if (isOutsideOfDragZone) {
				const tree = this.#tree;
				tree.remove('preview');
				this.signal(Update_Catalog, tree.get());
			}
		};

		const onAddGroupBranch = (branch) => {
			const tree = this.#tree;
			const newGroupEntry = { label: translate('admin_catalog_new_branch'), children: [], foldout: true };
			tree.addAt(branch?.id, newGroupEntry, true);
			this.signal(Update_Catalog, tree.get());
		};

		const onFoldoutBranch = (branch) => {
			const uiProperties = { ...branch.ui, foldout: !branch.ui.foldout };
			const tree = this.#tree;

			tree.update(branch.id, { ui: uiProperties });
			this.signal(Update_Catalog, tree.get());
		};

		const onDeleteBranchClicked = (branch) => {
			const domBranch = this.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${branch.id}"] .catalog-branch`);
			domBranch.classList.remove('branch-added');
			const tree = this.#tree;
			tree.remove(branch.id);
			this._syncOrphanSetWithTree();
			this.#isTreeDirty = true;
			this.signal(Update_Catalog, tree.get());
		};

		const onShowEditBranchModal = (branch) => {
			openModal(
				translate('admin_modal_edit_label_title'),
				html`<ba-admin-catalog-branch-panel
					.id=${branch.id}
					.label=${branch.label}
					.onSubmit=${this._editBranchSubmitted}
				></ba-admin-catalog-branch-panel>`
			);
		};

		const onGeoResourceFilterInput = (evt) => {
			this.signal(Update_Geo_Resource_Filter, evt.currentTarget.value);
		};

		const onGeoResourceRefreshClicked = () => {
			this._requestGeoResources();
		};

		const onBranchAnimationEnd = (evt) => {
			evt.currentTarget.classList.remove('branch-added');
		};

		const onSaveDraft = () => {
			this._saveCatalog(this.#selectedTopic.id, this.#tree);
		};

		const onShowPublishModal = () => {
			openModal(
				translate('admin_modal_publish_title'),
				html`<ba-admin-catalog-publish-panel
					.warningHint=${this.#orphanSet.size > 0 ? translate('admin_catalog_warning_orphan') : null}
					.topicId=${this.#selectedTopic.id}
					.onSubmit=${closeModal}
				></ba-admin-catalog-publish-panel>`
			);
		};

		const getWarningHint = () => {
			return this.#orphanSet.size > 0
				? html` <div class="warning-hint-container"><div class="warning-hint">${translate('admin_catalog_warning_orphan')}</div></div> `
				: nothing;
		};

		const getAuthRolesHtml = (authRoles) => {
			if (!authRoles || authRoles.length < 1) return nothing;

			return html`
				<div class="roles-container">
					${authRoles.map((role) => {
						return html`
							<ba-badge
								class="filter-results-badge"
								.background=${'var(--menu-bar-color)'}
								.label=${role}
								.color=${'var(--text3)'}
								.size=${0.9}
								.title=${role}
							></ba-badge>
						`;
					})}
				</div>
			`;
		};

		const getCatalogTreeHtml = () => {
			const selectedTopic = this.#selectedTopic;
			const getBranchHtml = (catalogBranch) => {
				if (catalogBranch.ui.hidden) {
					return nothing;
				}

				return html`
					<li
						draggable="true"
						class="draggable"
						branch-id=${catalogBranch.id}
						@dragstart=${(evt) => onBranchDragStart(evt, catalogBranch)}
						@dragend=${() => onBranchDragEnd(catalogBranch)}
						@dragover=${(evt) => onBranchDragOver(evt, catalogBranch)}
					>
						${catalogBranch.children !== null
							? html` <div class="catalog-branch group" @animationend=${onBranchAnimationEnd}>
										<div class="title-bar">
											<button class="btn-foldout" @click=${() => onFoldoutBranch(catalogBranch)}>
												<i class="chevron-down ${catalogBranch.ui.foldout ? 'collapsed' : ''}"></i>
											</button>
											<span class="branch-label">${catalogBranch.label}</span>
										</div>
										<div class="branch-btn-bar">
											<button class="icon-button btn-add-group-branch" @click=${() => onAddGroupBranch(catalogBranch)}>
												<i class="plus-circle"></i>
											</button>
											<button class="icon-button btn-edit-group-branch" @click=${() => onShowEditBranchModal(catalogBranch)}>
												<i class="pencil-square"></i>
											</button>
											<button class="icon-button btn-delete-branch" @click=${() => onDeleteBranchClicked(catalogBranch)}>
												<i class="x-circle"></i>
											</button>
										</div>
									</div>
									${catalogBranch.ui.foldout
										? html`<ul>
												${repeat(
													catalogBranch.children,
													(childBranch) => childBranch.id,
													(childBranch) => getBranchHtml(childBranch)
												)}
											</ul> `
										: nothing}`
							: html`
									<div class="catalog-branch geo-resource  ${catalogBranch.isOrphaned ? 'orphan' : ''}" @animationend=${onBranchAnimationEnd}>
										<div class="title-bar">
											<div class="drag-icon-container">
												<i class="grip-horizontal"></i>
											</div>
											<span class="branch-label">${catalogBranch.label}</span>
										</div>
										${getAuthRolesHtml(catalogBranch.authRoles)}
										<div class="branch-btn-bar">
											<button class="icon-button btn-delete-branch" @click=${() => onDeleteBranchClicked(catalogBranch)}>
												<i class="x-circle"></i>
											</button>
										</div>
									</div>
								`}
					</li>
				`;
			};

			return html`
				<div class="catalog-tree-title-container title-bar">
					<h1>${selectedTopic.label}</h1>
					<div class="btn-bar">
						<button class="btn-add-group-branch-on-root tree-button" @click=${() => onAddGroupBranch(null)}>
							${translate('admin_catalog_new_branch')}
						</button>
					</div>
				</div>
				${getWarningHint()}

				<div id="catalog-tree" @dragleave=${onTreeDragZoneLeave} @drop=${onBranchDrop} @dragover=${(evt) => onBranchDragOver(evt, null)}>
					${catalog.length > 0
						? html`
								<ul id="catalog-tree-root">
									${repeat(
										catalog,
										(branch) => branch.id,
										(branch) => getBranchHtml(branch)
									)}
								</ul>
							`
						: html`<div class="empty-tree-zone"><h1>${translate('admin_catalog_empty_tree_hint')}</h1></div>`}
				</div>
			`;
		};

		if (error) {
			return html`
				<style>
					${css}
				</style>
				<div class="error-container">
					<div class="error-message"><h1>${translate('admin_catalog_error_message')}</h1></div>
				</div>
			`;
		}

		return html`
			<style>
				${css}
			</style>
			<div class="grid-container">
				<div id="catalog-editor">
					<div class="menu-bar main-action-menu space-between">
						<div class="catalog-select-container">
							<select id="topic-select" @change=${onTopicSelected}>
								${topics.map((t) => {
									return html`<option value=${t.id}>${t.label}</option>`;
								})}
							</select>
						</div>
						<div class="catalog-button-bar">
							<button id="btn-save-draft" class="menu-button" .disabled=${loadingHint.catalog} @click=${onSaveDraft}>
								<span>${translate('admin_catalog_save_draft')}</span>
							</button>
							<button id="btn-publish" class="menu-button" .disabled=${loadingHint.catalog} @click=${onShowPublishModal}>
								<span>${translate('admin_catalog_publish')}</span>
							</button>
						</div>
					</div>
					<div class="catalog-container">
						${loadingHint.catalog
							? html`<div class="empty-tree-zone loading-hint-container">
									<ba-spinner .label=${translate('admin_catalog_loading_hint')}></ba-spinner>
								</div>`
							: getCatalogTreeHtml()}
					</div>
				</div>
				<div id="geo-resource-explorer" class="gr25">
					<div class="menu-bar">
						<div class="geo-resource-button-bar">
							<input
								id="geo-resource-search-input"
								type="text"
								placeholder="${translate('admin_georesource_filter_placeholder')}"
								autocomplete="off"
								@input=${onGeoResourceFilterInput}
							/>
							<button id="btn-geo-resource-refresh" class="menu-button" @click=${onGeoResourceRefreshClicked}>
								<span>${translate('admin_georesource_refresh')}</span>
							</button>
						</div>
					</div>
					<div id="geo-resource-explorer-content">
						${loadingHint.geoResource === true
							? html`<div class="loading-hint-container"><ba-spinner .label=${translate('admin_georesource_loading_hint')}></ba-spinner></div>`
							: geoResources.map((resource) => {
									if (!geoResourceFilter || resource.label.toUpperCase().indexOf(geoResourceFilterUC) > -1) {
										return html`<div draggable="true" class="geo-resource draggable" @dragstart=${(evt) => onGeoResourceDragStart(evt, resource)}>
											<div class="title-bar">
												<div class="drag-icon-container">
													<i class="grip-horizontal"></i>
												</div>
												<span class="label">${resource.label}</span>
												${getAuthRolesHtml(resource.authRoles)}
											</div>
										</div>`;
									}
									return nothing;
								})}
					</div>
				</div>
			</div>
		`;
	}

	_editBranchSubmitted = (branchId, newLabel) => {
		const tree = this.#tree;
		const oldLabel = tree.getById(branchId).label;
		//@ts-ignore
		if (oldLabel !== newLabel) {
			this.#isTreeDirty = true;
			tree.update(branchId, { label: newLabel });
			this.signal(Update_Catalog, tree.get());
		}

		closeModal();
	};

	_switchTreeSubmitted = async () => {
		await this._requestCatalog(this.#cachedTopic);
		//@ts-ignore
		this.shadowRoot.querySelector('#topic-select').value = this.#cachedTopic.id;
		closeModal();
		this.#cachedTopic = null;
		this.#isTreeDirty = false;
	};

	_getClientYHeightDiffInRect(clientY, rect) {
		return rect.height - (clientY - rect.top);
	}

	_getNormalizedClientXPositionInRect(clientX, rect) {
		const normalizedCursorPositionInElement = (clientX - rect.left) / rect.width;
		return normalizedCursorPositionInElement;
	}

	_getNormalizedClientYPositionInRect(clientY, rect) {
		const normalizedCursorPositionInElement = (clientY - rect.top) / rect.height;
		return normalizedCursorPositionInElement;
	}

	_hideBranch(branch) {
		const tree = this.#tree;
		const uiProperties = { ...branch.ui };
		uiProperties.hidden = true;
		tree.update(branch.id, { ui: uiProperties });
		this.signal(Update_Drag_Context, { ...branch, ui: uiProperties });
		this.signal(Update_Catalog, tree.get());
	}

	_syncOrphanSetWithTree() {
		for (const orphan of this.#orphanSet) {
			if (!this.#tree.has(orphan)) {
				this.#orphanSet.delete(orphan);
			}
		}
	}

	async _saveCatalog(topicId, treeInstance) {
		const translate = (key) => this._translationService.translate(key);
		const prepareTreeForRequest = (subTree) => {
			return subTree.map((branch) => {
				if (branch.children) {
					return { label: branch.label, children: prepareTreeForRequest(branch.children), id: branch.id };
				}

				return { geoResourceId: branch.geoResourceId, label: branch.label };
			});
		};

		const payload = prepareTreeForRequest(treeInstance.get());

		try {
			await this._adminCatalogService.saveCatalog(topicId, payload);
			emitNotification(translate('admin_catalog_draft_saved_notification'), LevelTypes.INFO);
			this.#isTreeDirty = false;
		} catch (e) {
			console.error(e);
			emitNotification(translate('admin_catalog_draft_save_failed_notification'), LevelTypes.ERROR);
		}
	}

	async _requestCatalog(topic) {
		try {
			this.#orphanSet.clear();
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, catalog: true });
			this.#selectedTopic = topic;
			const catalog = await this._adminCatalogService.getCatalog(topic.id);

			this.#tree.create(catalog);
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, catalog: false });
			this.signal(Update_Catalog, this.#tree.get());
			return true;
		} catch (e) {
			console.error(e);
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, catalog: false });
			this.signal(Update_Error, true);
			return false;
		}
	}

	async _requestTopics() {
		try {
			const topics = await this._adminCatalogService.getTopics();
			this.signal(Update_Topics, topics);
			return true;
		} catch (e) {
			console.error(e);
			this.signal(Update_Error, true);
			return false;
		}
	}

	async _requestGeoResources() {
		try {
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, geoResource: true });
			const resources = await this._adminCatalogService.getGeoResources();
			resources.sort((a, b) => {
				return a.label.localeCompare(b.label);
			});
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, geoResource: false });
			this.signal(Update_Geo_Resources, resources);

			return true;
		} catch (e) {
			console.error(e);
			this.signal(Update_Loading_Hint, { ...this.getModel().loadingHint, geoResource: false });
			this.signal(Update_Error, true);
			return false;
		}
	}

	get isDirty() {
		return this.#isTreeDirty;
	}

	static get tag() {
		return 'ba-admin-catalog';
	}
}
