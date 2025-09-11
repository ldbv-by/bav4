/**
 * @module modules/admin/components/Catalog
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './catalog.css';
import { $injector } from '../../../injection';
import { Tree } from '../utils/Tree';

const Update_Catalog = 'update_catalog_tree';
const Update_Geo_Resources = 'update_geo_resources';
const Update_Geo_Resource_Filter = 'update_geo_resource_filter';
const Update_Topics = 'update_topics';
const Update_Drag_Context = 'update_drag_context';
const Update_Popup_Type = 'update_popup_type';
/**
 * Catalog Viewer for the administration user-interface.
 * @class
 * @author herrmutig
 */
export class Catalog extends MvuElement {
	#branchWasPersisted;
	#isTreeDirty;
	#editContext;
	#cachedTopic;
	#selectedTopic;
	#tree;
	#defaultBranchProperties;

	constructor() {
		super({
			topics: [],
			catalog: [],
			geoResources: [],
			geoResourceFilter: '',
			dragContext: null,
			popupType: null
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
		this.#defaultBranchProperties = {
			id: null,
			children: null,
			label: '',
			hidden: false,
			foldout: true,
			ui: {
				hidden: false,
				foldout: true
			}
		};

		this.#tree = new Tree((branch) => {
			if (branch.geoResourceId) {
				const geoResource = this._adminCatalogService.getCachedGeoResourceById(branch.geoResourceId);
				branch.label = geoResource.label;
			}

			return { ...this.#defaultBranchProperties, ...branch };
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		const initializeAsync = async () => {
			if (!(await this._requestTopics())) return;
			if (!(await this._requestGeoResources())) return;

			this.#selectedTopic = this.getModel().topics[0];

			await this._requestCatalogTree(this.#selectedTopic);
		};

		initializeAsync();
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
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
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { topics, geoResources, catalog, geoResourceFilter, popupType } = model;
		const geoResourceFilterUC = geoResourceFilter ? geoResourceFilter.toUpperCase() : null;
		const translate = (key) => this._translationService.translate(key);

		const onTopicSelected = (evt) => {
			const topicId = evt.currentTarget.value;
			const topic = topics.find((t) => t.id === topicId);
			if (this.#isTreeDirty) {
				this.#cachedTopic = topic;
				this.signal(Update_Popup_Type, 'disposeChange');
				return;
			}

			this._requestCatalogTree(topic);
		};

		const onChangeToCachedTopic = () => {
			this._requestCatalogTree(this.#cachedTopic);
			this._closePopup();
			this.#cachedTopic = null;
			this.#isTreeDirty = null;
		};

		const onGeoResourceDragStart = (evt, geoResource) => {
			evt.stopPropagation();
			this.signal(Update_Drag_Context, { label: geoResource.label, geoResourceId: geoResource.id });
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

			const dragContext = this.dragContext;
			const tree = this.#tree;

			const previewEntry = {
				label: this.dragContext.label,
				geoResourceId: this.dragContext.geoResourceId,
				id: 'preview'
			};

			// Hide Branch from UI while it's dragged (dragstart is too early to do this).
			if (dragContext.id) {
				if (dragContext.ui.hidden !== true) {
					const uiProperties = { ...dragContext.ui };
					uiProperties.hidden = true;

					tree.update(dragContext.id, { ui: uiProperties });
					this.signal(Update_Drag_Context, { ...dragContext, ui: uiProperties });
				}
			}

			tree.remove('preview');

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
			const previewEntry = tree.getById('preview');

			if (previewEntry) {
				const uiProperties = { ...this.dragContext.ui };
				uiProperties.hidden = false;
				tree.remove(this.dragContext.id);
				tree.replace('preview', { ...this.dragContext, ui: uiProperties });
				this.signal(Update_Catalog, tree.get());
				this.#isTreeDirty = true;
				this.#branchWasPersisted = true;
			}

			evt.preventDefault();
		};

		const onTreeDragZoneLeave = (evt) => {
			/* onTreeDragZoneLeave gets also called when the mouse enters a children of the tree. Therefore it is hard to determine if
			 * the zone has been left. Therefore checking if the pointer is outside the drag zone's bounding box fixes the issue.
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
			const newGroupEntry = { label: 'New Group', children: [], foldout: true };
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
			this.signal(Update_Popup_Type, 'editGroupLabel');
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
			//@ts-ignore
			this.shadowRoot.querySelector('#geo-resource-search-input').value = '';
			this.signal(Update_Geo_Resource_Filter, '');
			this._requestGeoResources();
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
					<h1>${selectedTopic ? selectedTopic.label : nothing}</h1>
					<div class="btn-bar">
						<button @click=${() => onPrependNewGroupBranch(null)}>Neue Gruppe</button>
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
						: html`<h1>Please add a group or drag a geo resource in here.</h1>`}
				</div>
			`;
		};

		const getEditGroupLabelPopup = () => {
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

		const getConfirmTreeDisposePopup = () => {
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

		const getPopup = () => {
			switch (popupType) {
				case 'editGroupLabel':
					return getEditGroupLabelPopup();
				case 'disposeChange':
					return getConfirmTreeDisposePopup();
				default:
					return nothing;
			}
		};

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
							<button>${translate('admin_georesource_save_draft')}</button>
							<button>${translate('admin_georesource_publish')}</button>
						</div>
					</div>
					<div class="catalog-container">${getCatalogTreeHtml()}</div>
				</div>
				<div id="geo-resource-explorer" class="gr25">
					<div class="menu-bar">
						<div class="geo-resource-button-bar">
							<input
								id="geo-resource-search-input"
								type="text"
								placeholder="Geo Resource filtern"
								autocomplete="off"
								@input=${onGeoResourceFilterInput}
							/>
							<button id="btn-geo-resource-refresh" @click=${onGeoResourceRefreshClicked}>${translate('admin_georesource_refresh')}</button>
						</div>
					</div>
					<div id="geo-resource-explorer-content">
						${geoResources.map((r) => {
							if (!geoResourceFilter || r.label.toUpperCase().indexOf(geoResourceFilterUC) > -1) {
								return html`<div draggable="true" class="geo-resource draggable" @dragstart=${(evt) => onGeoResourceDragStart(evt, r)}>
									<div class="title-bar">
										<div class="drag-icon-container">
											<i class="grip-horizontal"></i>
										</div>
										<span class="label">${r.label}</span>
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

	async _requestCatalogTree(topic) {
		try {
			this.#selectedTopic = topic;
			const catalog = await this._adminCatalogService.getCatalog(topic.id);
			this.#tree.create(catalog);
			this.signal(Update_Catalog, this.#tree.get());
			return true;
		} catch (e) {
			console.error(e);
			// TODO signal Error to UI
		}

		return false;
	}

	async _requestTopics() {
		try {
			const topics = await this._adminCatalogService.getTopics();
			this.signal(Update_Topics, topics);
			return true;
		} catch (e) {
			console.error(e.cause);
			// TODO signal Error to UI
		}

		return false;
	}

	async _requestGeoResources() {
		try {
			const resources = await this._adminCatalogService.getGeoResources();
			resources.sort((a, b) => {
				return a.label.localeCompare(b.label);
			});
			this.signal(Update_Geo_Resources, resources);
			return true;
		} catch (e) {
			console.error(e);
			// TODO signal Error to UI
		}

		return false;
	}
	get catalog() {
		return this.getModel().catalog;
	}

	get dragContext() {
		return this.getModel().dragContext;
	}

	get isDirty() {
		return this.#isTreeDirty;
	}

	static get tag() {
		return 'ba-catalog';
	}
}
