/**
 * @module modules/admin/components/layerTree/LayerTree
 */
// @ts-ignore
import { html } from 'lit-html';
// @ts-ignore
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
// @ts-ignore
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './layerTree.css';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';

// @ts-ignore
import { repeat } from 'lit-html/directives/repeat.js';

const Update_Topics = 'update_topics';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Layers = 'update_layers';
const Update_Dummy = 'update_dummy';
const Update_Edit_Mode = 'update_edit_mode';

export const End_Label = '&nbsp;';

const hasChildrenClass = 'has-children';
const showChildrenClass = 'show-children';
const droppableClass = 'droppable';

/**
 * Contains
 *
 * @class
 */
export class LayerTree extends MvuElement {
	#currentGeoResourceId;
	#currentTopic;
	#currentUId;
	#overTarget;
	#ignoreLevelOneFirstOnLeave;
	#keyListener;
	#spanElement;

	constructor() {
		super({
			topics: [],
			catalogWithResourceData: [],
			layers: [],
			currentGeoResourceId: null,
			dummy: false,
			editMode: false
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			SecurityService: securityService
		} = $injector.inject('ConfigService', 'TranslationService', 'SecurityService');

		this._configService = configService;
		this._translationService = translationService;
		this._securityService = securityService;

		// eslint-disable-next-line no-unused-vars
		this._addGeoResource = (currentUid, newGeoResourceId, catalogWithResourceData) => {
			return '';
		};
		// eslint-disable-next-line no-unused-vars
		this._updateTopic = (topic) => {};
		// eslint-disable-next-line no-unused-vars
		this._removeEntry = (uid) => {};
		// eslint-disable-next-line no-unused-vars
		this._toggleShowChildren = (uid) => {};
		this._addGeoResourcePermanently = () => {};
		// eslint-disable-next-line no-unused-vars
		this._copyBranch = (catalog, catalogEntry) => {};
		// eslint-disable-next-line no-unused-vars
		this._moveElement = (currentCatalogEntryUid, uidFromDrag) => {};
		// eslint-disable-next-line no-unused-vars
		this._saveCatalog = (catalogId, catalog) => {};
		this._addLayerGroup = () => {};
		this._resetCatalog = () => {};
		// eslint-disable-next-line no-unused-vars
		this._disableTopicLevelTree = (topicId) => {};
		// eslint-disable-next-line no-unused-vars
		this._deleteTopicLevelTree = (topicId) => {};

		// eslint-disable-next-line no-unused-vars
		this._refreshCatalog = (catalog) => {};
		this._removeEndLabels = () => {};
		this._addEndLabels = () => {};

		this.#currentGeoResourceId = null;
		this.#overTarget = false;
		this.#ignoreLevelOneFirstOnLeave = false;

		this.#keyListener = null;

		this.activeEditElements = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Topics:
				if (!this.#currentTopic && data.length > 0) {
					this.#currentTopic = data[0];
				}
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: data };
			case Update_Layers:
				return { ...model, layers: data };
			case Update_Dummy:
				return { ...model, dummy: data };
			case Update_Edit_Mode:
				return { ...model, editMode: data };
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData, currentGeoResourceId, editMode } = model;

		if (
			catalogWithResourceData === null ||
			(catalogWithResourceData && catalogWithResourceData.length === 0) ||
			topics === null ||
			(topics && topics.length === 0)
		) {
			return nothing;
		}

		const insertDraggedGeoResource = (currentCatalogEntryUid, newGeoResourceIdFromList) => {
			if (newGeoResourceIdFromList === currentGeoResourceId && this.#currentUId === currentCatalogEntryUid) {
				return;
			}
			const newElementUid = this._addGeoResource(currentCatalogEntryUid, newGeoResourceIdFromList, [...catalogWithResourceData]);
			this.#currentUId = newElementUid;
		};

		const removeDragOverClass = () => {
			if (this.#spanElement) {
				this.#spanElement.classList.remove('drag-over');
				this.#spanElement = null;
			}
		};

		const onDragStart = (event, draggedEntry) => {
			const element = event.target;
			element.style.backgroundColor = '';

			const draggedEntryUid = draggedEntry.uid;
			event.dataTransfer.clearData();
			event.dataTransfer.setData('UID' + draggedEntryUid, draggedEntryUid);

			const target = event.target;
			const addIsDragged = () => {
				target.classList.add('isdragged');
				this._addEndLabels();
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			event.target.classList.remove('isdragged');

			removeDragOverClass();

			this._removeEndLabels();
		};

		const onDragOver = (event, currentCatalogEntry, level) => {
			const types = event.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoResourceIdFromList = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;
			if (newGeoResourceIdFromList) {
				if (newGeoResourceIdFromList === currentCatalogEntry.geoResourceId) {
					event.preventDefault();
					return;
				}

				this.#overTarget = true;
				if (level === 1) {
					this.#ignoreLevelOneFirstOnLeave = true;
				}
				this.#currentGeoResourceId = newGeoResourceIdFromList;
				insertDraggedGeoResource(currentCatalogEntry.uid, newGeoResourceIdFromList);
			}

			const matchedElementUid = types.find((element) => /uid(.+)/i.test(element));
			const uidFromDrag = matchedElementUid ? matchedElementUid.replace(/uid/, '') : null;
			if (uidFromDrag) {
				event.preventDefault();
				if (uidFromDrag === currentCatalogEntry.uid) {
					return;
				}
				if (this.#currentUId === currentCatalogEntry.uid) {
					return;
				}

				this.#overTarget = true;
				this.#currentUId = currentCatalogEntry.uid;
				this._moveElement(currentCatalogEntry.uid, uidFromDrag);
			}

			removeDragOverClass();
			this.#spanElement = event.target;
			this.#spanElement.classList.add('drag-over');
		};

		const onDrop = (event, entry) => {
			this.#currentGeoResourceId = null;
			removeDragOverClass();
			const dropUid = event.dataTransfer.types[0].replace('uid', '');
			if (this.#overTarget || dropUid === entry.uid) {
				this.#overTarget = false;
				this._addGeoResourcePermanently();
			} else {
				this._resetCatalog();
			}
			event.preventDefault();
		};

		const onDragLeave = (event) => {
			if (this.#ignoreLevelOneFirstOnLeave) {
				this.#ignoreLevelOneFirstOnLeave = false;
				return;
			}

			// removeDragOverClass();

			this.#overTarget = false;
			event.target.classList.add('isdragged');
			// event.target.classList.remove('drag-over');
			event.preventDefault();

			if (this.#currentGeoResourceId !== null) {
				this._removeEntry(this.#currentUId);
				this.#currentGeoResourceId = null;
			}

			this.#currentUId = '';
		};

		const handleCategoryClick = (event, entry) => {
			const li = event.currentTarget;
			const button = li.querySelector('button');

			event.stopPropagation();
			event.preventDefault();

			if (button.textContent === 'Save') {
				return;
			}

			if (entry.children) {
				this._toggleShowChildren(entry.uid);
			}
		};

		const handleKeyPress = (event, button, catalogEntry) => {
			if (event.key === 'Enter') {
				const focusedElement = document.activeElement;
				if (focusedElement.tagName === 'BA-ADMINPANEL' || focusedElement.tagName === 'TEXTAREA') {
					if (button) {
						button.click(event, catalogEntry);
					}
				}
			}

			if (event.key === 'Escape') {
				handleAbortClick(event, catalogEntry);
			}
		};

		const handleAbortClick = (event, catalogEntry) => {
			if (this.activeEditElements) {
				const { editButton, abortButton, copyButton, deleteButton } = this.activeEditElements;

				if (editButton.textContent === 'Save') {
					this.signal(Update_Edit_Mode, false);

					editButton.textContent = 'Edit';
					abortButton.style.display = 'none';
					copyButton.style.display = '';
					deleteButton.style.display = '';

					const input = editButton.parentNode.firstElementChild;
					const span = document.createElement('span');
					span.textContent = catalogEntry.label;

					if (this.#keyListener !== null) {
						document.removeEventListener('keydown', this.#keyListener);
						this.#keyListener = null;
					}

					this.activeEditElements = null;
					editButton.parentNode.insertBefore(span, input);
					editButton.parentNode.removeChild(input);
					editButton.textContent = 'Edit';
				}
			}
		};

		const handleEditClick = (event, catalogEntry) => {
			const editButton = event.target;
			const li = editButton.parentNode;
			const abortButton = li.querySelector('.abort-button');

			const keyPressHandler = (event) => {
				handleKeyPress(event, editButton, catalogEntry);
			};

			if (editButton.textContent === 'Edit') {
				this.signal(Update_Edit_Mode, true);
				abortButton.style.display = '';
				const span = li.firstElementChild;

				const copyButton = li.querySelector('.copy-button');
				if (copyButton) {
					copyButton.style.display = 'none';
				}

				const deleteButton = li.querySelector('.delete-button');
				if (deleteButton) {
					deleteButton.style.display = 'none';
				}

				this.activeEditElements = {
					editButton,
					abortButton,
					copyButton,
					deleteButton
				};

				if (this.#keyListener === null) {
					this.#keyListener = keyPressHandler;
					document.addEventListener('keydown', keyPressHandler);
				}

				const input = document.createElement('input');
				input.type = 'text';
				input.value = catalogEntry.label;

				input.style.pointerEvents = 'auto';
				input.style.userSelect = 'text';
				input.style.zIndex = '1';
				input.style.opacity = '1';
				input.style.visibility = 'visible';
				input.style.position = 'relative';

				li.insertBefore(input, span);
				li.removeChild(span);
				editButton.textContent = 'Save';
				input.focus();
				input.classList.add('editable-input');
			} else if (editButton.textContent === 'Save') {
				this.signal(Update_Edit_Mode, false);
				abortButton.style.display = 'none';
				const input = li.firstElementChild;
				const span = document.createElement('span');

				if (this.#keyListener !== null) {
					document.removeEventListener('keydown', this.#keyListener);
					this.#keyListener = null;
				}

				span.textContent = input.value.trim();
				li.insertBefore(span, input);
				li.removeChild(input);
				editButton.textContent = 'Edit';

				const catalogCopy = JSON.parse(JSON.stringify(catalogWithResourceData));

				const catalogEntryCopy = catalogCopy.find((e) => e.uid === catalogEntry.uid);
				if (catalogEntryCopy) {
					catalogEntryCopy.label = input.value.trim();
				}

				this.signal(Update_CatalogWithResourceData, []);
				this._refreshCatalog(catalogCopy);
			}
		};

		const handleDeleteClick = (event, catalogEntry) => {
			const userConfirmed = confirm('Wollen Sie ' + catalogEntry.label + ' wirklich löschen?');
			if (userConfirmed) {
				this._removeEntry(catalogEntry.uid);
			}
			event.stopPropagation();
			event.preventDefault();
		};

		const handleCopyClick = (event, catalogEntry) => {
			this._copyBranch(catalogWithResourceData, catalogEntry);

			event.stopPropagation();
			event.preventDefault();
		};

		const handleNewLayerGroupClick = () => {
			this._addLayerGroup();
		};

		const handleSaveClick = () => {
			this._saveCatalog();
		};

		const handleDisableTopicLevelTreeClick = () => {
			this._disableTopicLevelTree(this.#currentTopic);
		};

		const handleDeleteTopicLevelTreeClick = () => {
			const userConfirmed = confirm('Wollen Sie wirklich löschen?');
			if (userConfirmed) {
				this._deleteTopicLevelTree(this.#currentTopic);
				this.#currentTopic = null;
			}
		};

		const handleTopicChange = (event) => {
			const foundTopic = topics.find((topic) => topic._id === event.target.value);

			if (foundTopic) {
				this.#currentTopic = foundTopic;
			}

			this._updateTopic(event.target.value);
		};

		const renderEntry = (entry, level) => {
			return html`
				<li
					@click="${(event) => handleCategoryClick(event, entry)}"
					class="${(entry.children ? hasChildrenClass + ' ' : '') + (entry.showChildren ? showChildrenClass : '')}"
				>
					<span
						class="ba-list-item__pre"
						id="${entry.geoResourceId}"
						class="draggable ${(entry.children ? hasChildrenClass + ' ' : '') + droppableClass}"
						draggable="true"
						@dragover=${(event) => onDragOver(event, entry, level)}
						@dragleave=${onDragLeave}
						@drop=${(event) => onDrop(event, entry)}
						@dragstart=${(event) => onDragStart(event, entry)}
						@dragend=${onDragEnd}
					>
						${unsafeHTML(entry.label)} ${entry.geoResourceId ? '(' + entry.geoResourceId + ')' : ''}
					</span>
					${entry.children
						? html`
								<button @click="${(event) => handleEditClick(event, entry)}">Edit</button>
								<button class="abort-button" @click="${(event) => handleAbortClick(event, entry)}" style="display: none;">Abort</button>
								<button class="copy-button" @click="${(event) => handleCopyClick(event, entry)}">Copy</button>
								<button class="delete-button" @click="${(event) => handleDeleteClick(event, entry)}">X</button>
								<ul>
									${entry.children.map((child) => html`<li>${renderEntry(child, level + 1)}</li>`)}
								</ul>
							`
						: html`<button .disabled=${editMode} @click="${(event) => handleDeleteClick(event, entry)}">X</button>`}
				</li>
			`;
		};

		if (topics) {
			const sperrText = this.#currentTopic._disabled ? ' -- deaktiviert -- ' : '';
			const deactivateButtonText = this.#currentTopic._disabled ? 'Ebenenbaum aktivieren' : 'Ebenenbaum deaktivieren';
			return html`
				<style>
					${css}
				</style>


				<div>
					<h2>Themen - Ebenenbaum für Thema "${this.#currentTopic._label}"${sperrText}</h2>
					<button @click="${handleNewLayerGroupClick}">neue Ebenengruppe</button>
					<button @click="${handleSaveClick}">sichern</button>
					<button @click="${handleDisableTopicLevelTreeClick}">${deactivateButtonText}</button>
					<button @click="${handleDeleteTopicLevelTreeClick}">Ebenenbaum löschen</button>

					<select @change="${handleTopicChange}">
						${topics.map((topic) => html` <option value="${topic._id}">${topic._label} ${topic._disabled ? ' -- deaktiviert -- ' : ''}</option> `)}
					</select>

						${repeat(
							catalogWithResourceData,
							(item) => item.uid + item.label,
							(catalogEntry) => html`<li class="ba-list-item">${renderEntry(catalogEntry, 1)}</li>`
						)}
					</ul>
				</div>
			`;
		}
		return nothing;
	}

	/**
	 * @property {Array} topics = []
	 */
	set topics(value) {
		this.signal(Update_Topics, value);
	}

	get topics() {
		return this.getModel().topics;
	}

	/**
	 * @property {Array} catalogWithResourceData = []
	 */
	set catalogWithResourceData(value) {
		this.signal(Update_CatalogWithResourceData, value);
	}

	get catalogWithResourceData() {
		return this.getModel().catalogWithResourceData;
	}

	/**
	 * @property {Array} layers = []
	 */
	set layers(value) {
		this.signal(Update_Layers, value);
	}

	get layers() {
		return this.getModel().layers;
	}

	/**
	 * @property {bool} dummy
	 */
	set dummy(value) {
		this.signal(Update_Dummy, value);
	}

	get dummy() {
		return this.getModel().dummy;
	}

	/**
	 * @property {function} resetCatalog - Callback function
	 */
	set resetCatalog(callback) {
		this._resetCatalog = callback;
	}

	/**
	 * @property {function} refreshCatalog - Callback function
	 */
	set refreshCatalog(callback) {
		this._refreshCatalog = callback;
	}

	/**
	 * @property {function} addLayerGroup - Callback function
	 */
	set addLayerGroup(callback) {
		this._addLayerGroup = callback;
	}

	get addLayerGroup() {
		return this._addLayerGroup;
	}

	/**
	 * @property {function} updateTopic - Callback function
	 */
	set updateTopic(callback) {
		this._updateTopic = callback;
	}

	get updateTopic() {
		return this._updateTopic;
	}

	/**
	 * @property {function} disableTopicLevelTree - Callback function
	 */
	set disableTopicLevelTree(callback) {
		this._disableTopicLevelTree = callback;
	}

	get disableTopicLevelTree() {
		return this._disableTopicLevelTree;
	}

	/**
	 * @property {function} deleteTopicLevelTree - Callback function
	 */
	set deleteTopicLevelTree(callback) {
		this._deleteTopicLevelTree = callback;
	}

	get deleteTopicLevelTree() {
		return this._deleteTopicLevelTree;
	}

	/**
	 * @property {function} addGeoResource - Callback function
	 */
	set addGeoResource(callback) {
		this._addGeoResource = callback;
	}

	get addGeoResource() {
		return this._addGeoResource;
	}

	/**
	 * @property {function} toggleShowChildren - Callback function
	 */
	set toggleShowChildren(callback) {
		this._toggleShowChildren = callback;
	}

	get toggleShowChildren() {
		return this._toggleShowChildren;
	}

	/**
	 * @property {function} removeEntry - Callback function
	 */
	set removeEntry(callback) {
		this._removeEntry = callback;
	}

	get removeEntry() {
		return this._removeEntry;
	}

	/**
	 * @property {function} addGeoResourcePermanently - Callback function
	 */
	set addGeoResourcePermanently(callback) {
		this._addGeoResourcePermanently = callback;
	}

	get addGeoResourcePermanently() {
		return this._addGeoResourcePermanently;
	}

	/**
	 * @property {function} copyBranch - Callback function
	 */
	set copyBranch(callback) {
		this._copyBranch = callback;
	}

	get copyBranch() {
		return this._copyBranch;
	}

	/**
	 * @property {function} moveElement - Callback function
	 */
	set moveElement(callback) {
		this._moveElement = callback;
	}

	/**
	 * @property {function} removeEndLabels - Callback function
	 */
	set removeEndLabels(callback) {
		this._removeEndLabels = callback;
	}

	/**
	 * @property {function} addEndLabels - Callback function
	 */
	set addEndLabels(callback) {
		this._addEndLabels = callback;
	}

	/**
	 * @property {function} saveCatalog - Callback function
	 */
	set saveCatalog(callback) {
		this._saveCatalog = callback;
	}

	static get tag() {
		return 'ba-layer-tree';
	}
}
