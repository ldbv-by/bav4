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

const Update_Catalog = 'update_catalog';
const Update_Geo_Resources = 'update_geo_resources';
const Update_Geo_Resource_Filter = 'update_geo_resource_filter';
const Update_Topics = 'update_topics';
const Update_Drag_Context = 'update_drag_context';
const Update_Popup_Type = 'update_popup_type';
const Update_Error = 'update_error';
const Update_LoadingHint = 'update_loading_hint';

/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class AdminCatalog extends MvuElement {
	#branchWasPersisted;
	#isTreeDirty;
	#editContext;
	#cachedTopic;
	#selectedTopic;
	#tree;
	#lastDroppedBranch;
	#defaultBranchProperties;

	constructor() {
		super({
			topics: [],
			catalog: [],
			geoResources: [],
			geoResourceFilter: '',
			dragContext: null,
			popupType: null,
			error: false,
			loadingHint: {
				geoResource: false,
				catalog: false
			}
		});

		const { AdminCatalogService: adminCatalogService, TranslationService: translationService } = $injector.inject(
			'AdminCatalogService',
			'TranslationService'
		);

		this._adminCatalogService = adminCatalogService;
		this._translationService = translationService;
		this.#branchWasPersisted = false;
		this.#isTreeDirty = false;
		this.#editContext = null;
		this.#cachedTopic = null;
		this.#selectedTopic = null;
		this.#lastDroppedBranch = null;
		this.#defaultBranchProperties = {
			id: null,
			children: null,
			label: '',
			geoResourceId: null,
			authRoles: [],
			ui: {
				hidden: false,
				foldout: true
			}
		};

		this.#tree = new Tree((branch) => {
			if (branch.geoResourceId) {
				const geoResource = this._adminCatalogService.getCachedGeoResourceById(branch.geoResourceId);
				branch.label = geoResource.label;
				branch.authRoles = geoResource.authRoles;
				branch.geoResourceId = geoResource.id;
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
		this.signal(Update_LoadingHint, { catalog: true, geoResource: true });
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
			case Update_Popup_Type:
				return { ...model, popupType: data };
			case Update_LoadingHint: {
				return { ...model, loadingHint: { ...data } };
			}
		}
	}

	onAfterRender() {
		// Adds an indicator for a short period when a branch has been dragged and dropped.
		const droppedBranch = this.#lastDroppedBranch;
		this.#lastDroppedBranch = null;

		if (droppedBranch) {
			const domBranch = this.shadowRoot.querySelector(`#catalog-tree-root li[branch-id="${droppedBranch.id}"] .catalog-branch`);
			domBranch.classList.add('branch-added');

			setTimeout(() => {
				domBranch.classList.remove('branch-added');
			}, 1000);
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { topics, geoResources, catalog, geoResourceFilter, error, popupType, loadingHint } = model;
		const geoResourceFilterUC = geoResourceFilter ? geoResourceFilter.toUpperCase() : null;
		const translate = (key) => this._translationService.translate(key);

		const onTopicSelected = (evt) => {
			const topicId = evt.currentTarget.value;
			const topic = topics.find((t) => t.id === topicId);
			if (this.#isTreeDirty) {
				this.#cachedTopic = topic;
				this.signal(Update_Popup_Type, 'dispose_change');
				return;
			}

			this._requestCatalog(topic);
		};

		const onChangeToCachedTopic = () => {
			this._requestCatalog(this.#cachedTopic);
			this._closePopup();
			this.#cachedTopic = null;
			this.#isTreeDirty = null;
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
			const tree = this.#tree;

			const previewEntry = {
				label: dragContext.label,
				geoResourceId: dragContext.geoResourceId,
				id: 'preview'
			};

			// Hide Branch from UI while it's dragged (dragstart is too early to do this).
			if (dragContext.ui) {
				if (dragContext.ui.hidden !== true) {
					const uiProperties = { ...dragContext.ui };
					uiProperties.hidden = true;

					tree.update(dragContext.id, { ui: uiProperties });
					this.signal(Update_Drag_Context, { ...dragContext, ui: uiProperties });
				}
			}

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

			// Find pointer position within the current dropzone target (evt.currentTarget) to determine where to drop the dragContext.
			const rect = evt.currentTarget.querySelector('.catalog-branch').getBoundingClientRect();
			const insertionValue = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			if (branch.children) {
				if (insertionValue < 0.25) {
					tree.addAt(branch.id, previewEntry, true);
				} else {
					const branchUIProperties = { ...branch.ui, foldout: true };
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
				this.#lastDroppedBranch = dragContext;
				const uiProperties = { ...dragContext.ui };
				uiProperties.hidden = false;
				tree.remove(dragContext.id);
				tree.replace('preview', { ...dragContext, ui: uiProperties });
				this.signal(Update_Catalog, tree.get());
				this.#isTreeDirty = true;
				this.#branchWasPersisted = true;
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

		const onPrependNewGroupBranch = (branch) => {
			const tree = this.#tree;
			const newGroupEntry = { label: translate('admin_catalog_new_branch'), children: [], foldout: true };
			if (branch) {
				const uiProperties = { ...branch.ui, foldout: true };
				tree.update(branch.id, { children: [newGroupEntry, ...branch.children], ui: uiProperties });
			} else {
				tree.prependAt(null, newGroupEntry);
			}
			this.signal(Update_Catalog, tree.get());
		};

		const onFoldoutBranch = (branch) => {
			const uiProperties = { ...branch.ui, foldout: !branch.ui.foldout };
			const tree = this.#tree;

			tree.update(branch.id, { ui: uiProperties });
			this.signal(Update_Catalog, tree.get());
		};

		const onDeleteBranchClicked = (branch) => {
			const tree = this.#tree;
			tree.remove(branch.id);
			this.signal(Update_Catalog, tree.get());
		};

		const onOpenEditGroupLabelPopup = (branch) => {
			this.#editContext = branch;
			this.signal(Update_Popup_Type, 'edit_branch');
			//@ts-ignore
			this.shadowRoot.querySelector('input.popup-input').value = branch.label;
		};

		const onEditGroupLabel = () => {
			const tree = this.#tree;
			//@ts-ignore
			const newLabel = this.shadowRoot.querySelector('input.popup-input').value;
			if (this.#editContext.label !== newLabel) {
				this.#isTreeDirty = true;
			}

			tree.update(this.#editContext.id, { ...this.#editContext, label: newLabel });
			this.signal(Update_Catalog, tree.get());
			this._closePopup();
		};

		const onGeoResourceFilterInput = (evt) => {
			this.signal(Update_Geo_Resource_Filter, evt.currentTarget.value);
		};

		const onGeoResourceRefreshClicked = () => {
			this._requestGeoResources();
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
							? html` <div class="catalog-branch group">
										<div class="title-bar">
											<button class="btn-foldout" @click=${() => onFoldoutBranch(catalogBranch)}>
												<i class="chevron-down ${catalogBranch.ui.foldout ? 'collapsed' : ''}"></i>
											</button>
											<span class="branch-label">${catalogBranch.label}</span>
										</div>
										<div class="branch-btn-bar">
											<button class="icon-button btn-add-group-branch" @click=${() => onPrependNewGroupBranch(catalogBranch)}>
												<i class="plus-circle"></i>
											</button>
											<button class="icon-button btn-edit-group-branch" @click=${() => onOpenEditGroupLabelPopup(catalogBranch)}>
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
													() => catalogBranch.id,
													(childBranch) => getBranchHtml(childBranch)
												)}
											</ul> `
										: nothing}`
							: html`
									<div class="catalog-branch geo-resource">
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
						<button class="btn-add-group-branch-on-root" @click=${() => onPrependNewGroupBranch(null)}>
							${translate('admin_catalog_new_branch')}
						</button>
					</div>
				</div>
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

		const getPopup = () => {
			const editBranchLabelPopup = () => {
				return html`
					<div class="popup">
						<div id="text-label-edit" class="popup-container">
							<div class="popup-edit">
								<span class="popup-title">${translate('admin_popup_edit_label_title')}</span>
								<input draggable="false" class="popup-input" type="text" value=${this.#editContext.label} />
							</div>
							<div class="popup-confirm">
								<button class="btn-cancel" @click=${() => this._closePopup()}>${translate('admin_button_cancel')}</button>
								<button class="btn-confirm" @click=${() => onEditGroupLabel()}>${translate('admin_button_confirm')}</button>
							</div>
						</div>
					</div>
				`;
			};

			const disposeTreePopup = () => {
				return html`
					<div id="confirm-dispose-popup" class="popup">
						<div class="popup-container">
							<div class="popup-edit">
								<span class="popup-title">${translate('admin_popup_tree_dispose_title')}</span>
							</div>
							<div class="popup-confirm">
								<button class="btn-cancel" @click=${() => this._closePopup()}>${translate('admin_button_cancel')}</button>
								<button class="btn-confirm" @click=${onChangeToCachedTopic}>${translate('admin_button_confirm')}</button>
							</div>
						</div>
					</div>
				`;
			};

			switch (popupType) {
				case 'edit_branch':
					return editBranchLabelPopup();
				case 'dispose_change':
					return disposeTreePopup();
				default:
					return nothing;
			}
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
					<div class="menu-bar space-between">
						<div class="catalog-select-container">
							<select id="topic-select" @change=${onTopicSelected}>
								${topics.map((t) => {
									return html`<option value=${t.id}>${t.label}</option>`;
								})}
							</select>
						</div>
						<div class="catalog-button-bar">
							<button id="btn-save-draft" .disabled=${loadingHint.catalog}>${translate('admin_catalog_save_draft')}</button>
							<button id="btn-publish" .disabled=${loadingHint.catalog}>${translate('admin_catalog_publish')}</button>
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
							<button id="btn-geo-resource-refresh" @click=${onGeoResourceRefreshClicked}>${translate('admin_georesource_refresh')}</button>
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
			${getPopup()}
		`;
	}

	_closePopup() {
		this.signal(Update_Popup_Type, null);
	}
	catalogBranch;

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

	async _requestCatalog(topic) {
		try {
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, catalog: true });
			this.#selectedTopic = topic;
			const catalog = await this._adminCatalogService.getCatalog(topic.id);
			this.#tree.create(catalog);
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, catalog: false });
			this.signal(Update_Catalog, this.#tree.get());
			return true;
		} catch (e) {
			console.error(e);
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, catalog: false });
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
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, geoResource: true });
			const resources = await this._adminCatalogService.getGeoResources();
			resources.sort((a, b) => {
				return a.label.localeCompare(b.label);
			});
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, geoResource: false });
			this.signal(Update_Geo_Resources, resources);

			return true;
		} catch (e) {
			console.error(e);
			this.signal(Update_LoadingHint, { ...this.getModel().loadingHint, geoResource: false });
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
