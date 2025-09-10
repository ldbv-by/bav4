/**
 * @module modules/admin/components/Catalog
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { MvuElement } from '../../MvuElement';
import css from './catalog.css';
import { $injector } from '../../../injection';
import { Tree } from '../utils/Tree';

const Update_Catalog_Tree = 'update_catalog_tree';
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
	#nodeWasPersisted;
	#isTreeDirty;
	#editContext;
	#cachedTopic;
	#selectedTopic;
	#tree;

	constructor() {
		super({
			topics: [],
			catalogTree: [],
			geoResources: [],
			geoResourceFilter: '',
			dragContext: null,
			popupType: null
		});

		const { BvvAdminCatalogService: adminCatalogService, TranslationService: translationService } = $injector.inject(
			'AdminCatalogService',
			'TranslationService'
		);

		this._adminCatalogService = adminCatalogService;
		this._translationService = translationService;
		this.#nodeWasPersisted = false;
		this.#isTreeDirty = false;
		this.#editContext = null;
		this.#cachedTopic = null;
		this.#selectedTopic = null;

		this.#tree = new Tree((entry) => {
			let { id, children, ...properties } = entry;
			properties.ui = { hidden: false, foldout: false };

			if (entry.geoResourceId !== undefined) {
				const geoResource = this._adminCatalogService.getCachedGeoResourceById(entry.geoResourceId);
				properties.label = geoResource.label;
			}

			return { id: id, children: children, ...properties, properties: properties };
		});
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._requestData();
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Catalog_Tree:
				return { ...model, catalogTree: [...data] };
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
		const { topics, geoResources, catalogTree, geoResourceFilter, popupType } = model;
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

		const onNodeDragStart = (evt, entry) => {
			evt.stopPropagation();
			const tree = this.#tree;
			tree.update(entry.id, { foldout: false });
			this.signal(Update_Catalog_Tree, tree.get());
			this.signal(Update_Drag_Context, { ...entry });
			this.#nodeWasPersisted = false;
		};

		const onNodeDragEnd = (entry) => {
			const tree = this.#tree;

			// Restore Node in tree when it was not rearranged.
			if (!this.#nodeWasPersisted) {
				tree.update(entry.id, { hidden: false });
			}

			// Ensure preview cleanup.
			tree.remove('preview');
			this.signal(Update_Catalog_Tree, tree.get());
			this.signal(Update_Drag_Context, null);
		};

		const onNodeDragOver = (evt, entry) => {
			evt.preventDefault();
			evt.stopPropagation();

			if (entry?.id === 'preview') return;

			const tree = this.#tree;

			const previewEntry = {
				label: this.dragContext.label,
				geoResourceId: this.dragContext.geoResourceId,
				id: 'preview'
			};

			// Hide Node from UI while it's dragged (dragstart is too early to do this).
			if (this.dragContext.id !== undefined) {
				if (this.dragContext.hidden !== true) {
					tree.update(this.dragContext.id, { ...this.dragContext, hidden: true });
					this.signal(Update_Drag_Context, { ...this.dragContext, hidden: true });
				}
			}

			tree.remove('preview');

			if (!entry) {
				// Handles edge case, when a node is dragged at the start or end of the tree.
				// In that case the dragged node should get appended or prepended.
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

				this.signal(Update_Catalog_Tree, tree.get());
				return;
			}

			// Find pointer position within the current dropzone target (evt.currentTarget) to determine where to drop the dragContext.
			const rect = evt.currentTarget.querySelector('.catalog-node').getBoundingClientRect();
			const insertionValue = this._getNormalizedClientYPositionInRect(evt.clientY, rect);

			if (entry.children) {
				if (insertionValue < 0.25) {
					tree.addAt(entry.id, previewEntry, true);
				} else {
					tree.update(entry.id, { foldout: true });
					tree.prependAt(entry.id, previewEntry);
				}
			} else {
				tree.addAt(entry.id, previewEntry, insertionValue < 0.5);
			}

			this.signal(Update_Catalog_Tree, tree.get());
		};

		const onNodeDrop = (evt) => {
			const tree = this.#tree;
			const previewEntry = tree.getById('preview');

			if (previewEntry) {
				tree.remove(this.dragContext.id);
				tree.replace('preview', { ...this.dragContext, hidden: false });
				this.signal(Update_Catalog_Tree, tree.get());
				this.#isTreeDirty = true;
				this.#nodeWasPersisted = true;
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
				this.signal(Update_Catalog_Tree, tree.get());
			}
		};

		const onPrependNewGroupNode = (entry) => {
			const tree = this.#tree;
			const newGroupEntry = { label: 'New Group', children: [], foldout: true };

			if (entry) {
				tree.update(entry.id, { children: [newGroupEntry, ...entry.children], foldout: true });
			} else {
				tree.prependAt(newGroupEntry);
			}
			this.signal(Update_Catalog_Tree, tree.get());
		};

		const onFoldoutNodeGroup = (entry) => {
			const tree = this.#tree;
			tree.update(entry.id, { foldout: !entry.foldout });
			this.signal(Update_Catalog_Tree, tree.get());
		};

		const onDeleteNodeClicked = (entry) => {
			const tree = this.#tree;
			tree.remove(entry.id);
			this.signal(Update_Catalog_Tree, tree.get());
		};

		const onOpenEditGroupLabelPopup = (node) => {
			this.#editContext = node;
			this.signal(Update_Popup_Type, 'editGroupLabel');
			//@ts-ignore
			this.shadowRoot.querySelector('input.popup-input').value = node.label;
		};

		const onEditGroupLabel = () => {
			const tree = this.#tree;
			//@ts-ignore
			const newLabel = this.shadowRoot.querySelector('input.popup-input').value;
			if (this.#editContext.label !== newLabel) {
				this.#isTreeDirty = true;
			}

			tree.update(this.#editContext.id, { ...this.#editContext, label: newLabel });
			this.signal(Update_Catalog_Tree, tree.get());
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
			const getNodeHtml = (node) => {
				if (node.hidden) {
					return nothing;
				}

				return html`
					<li
						draggable="true"
						class="draggable"
						node-id=${node.id}
						@dragstart=${(evt) => onNodeDragStart(evt, node)}
						@dragend=${() => onNodeDragEnd(node)}
						@dragover=${(evt) => onNodeDragOver(evt, node)}
					>
						${node.children !== null
							? html` <div class="catalog-node group">
										<div class="title-bar">
											<button class="btn-foldout" @click=${() => onFoldoutNodeGroup(node)}>
												<i class="chevron-down ${node.foldout ? 'collapsed' : ''}"></i>
											</button>
											<span class="node-label">${node.label}</span>
										</div>
										<div class="node-btn-bar">
											<button class="icon-button btn-add-group-node" @click=${() => onPrependNewGroupNode(node)}><i class="plus-circle"></i></button>
											<button class="icon-button btn-edit-group-node" @click=${() => onOpenEditGroupLabelPopup(node)}>
												<i class="pencil-square"></i>
											</button>
											<button class="icon-button btn-delete-node" @click=${() => onDeleteNodeClicked(node)}><i class="x-circle"></i></button>
										</div>
									</div>
									${node.foldout
										? html`<ul>
												${repeat(
													node.children,
													() => node.id,
													(childNode) => getNodeHtml(childNode)
												)}
											</ul> `
										: nothing}`
							: html`
									<div class="catalog-node geo-resource">
										<div class="title-bar">
											<div class="drag-icon-container">
												<i class="grip-horizontal"></i>
											</div>
											<span class="node-label">${node.label}</span>
										</div>
										<div class="node-btn-bar">
											<button class="icon-button btn-delete-node" @click=${() => onDeleteNodeClicked(node)}><i class="x-circle"></i></button>
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
						<button @click=${() => onPrependNewGroupNode(null)}>Neue Gruppe</button>
					</div>
				</div>
				<div id="catalog-tree" @dragleave=${onTreeDragZoneLeave} @drop=${onNodeDrop} @dragover=${(evt) => onNodeDragOver(evt, null)}>
					${catalogTree.length > 0
						? html`
								<ul id="catalog-tree-root">
									${repeat(
										catalogTree,
										(node) => node.id,
										(node) => getNodeHtml(node)
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

	async _requestData() {
		await this._requestTopics();
		const topics = this.getModel().topics;

		if (!this.#selectedTopic) {
			this.#selectedTopic = topics[0];
		}

		await this._requestGeoResources();
		await this._requestCatalogTree(this.#selectedTopic);
	}

	async _requestCatalogTree(topic) {
		this.#selectedTopic = topic;
		const catalogTree = await this._adminCatalogService.getCatalog(topic.id);
		this.#tree.create(catalogTree);
		this.signal(Update_Catalog_Tree, this.#tree.get());
	}

	async _requestTopics() {
		const topics = await this._adminCatalogService.getTopics();
		this.signal(Update_Topics, topics);
	}

	async _requestGeoResources() {
		const resources = await this._adminCatalogService.getGeoResources();
		resources.sort((a, b) => {
			return a.label.localeCompare(b.label);
		});

		this.signal(Update_Geo_Resources, resources);
	}

	get catalogTree() {
		return this.getModel().catalogTree;
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
