/**
 * @module modules/admin/components/layerTree/LayerTree
 */
// @ts-ignore
import { html } from 'lit-html';
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

const hasChildrenClass = 'has-children';
const showChildrenClass = 'show-children';
const droppableClass = 'droppable';

// const logOnceDictionary = {};
// export const logOnce = (key, objectToShow = 'nix') => {
// 	if (!logOnceDictionary[key]) {
// 		if (objectToShow === 'nix') {
// 			// eslint-disable-next-line no-console
// 			console.log(key);
// 		} else {
// 			if (typeof objectToShow === 'string') {
// 				// eslint-disable-next-line no-console
// 				console.log(objectToShow);
// 			} else {
// 				// eslint-disable-next-line no-console
// 				console.log(JSON.stringify(objectToShow));
// 			}
// 		}
// 		logOnceDictionary[key] = objectToShow;
// 		return true;
// 	}
// 	return false;
// };

// export const onlyOnce = (key) => {
// 	if (logOnceDictionary[key]) {
// 		return false;
// 	}
// 	logOnceDictionary[key] = key;
// 	return true;
// };

// export const getRandomColor = () => {
// 	const red = Math.floor(Math.random() * 256);
// 	const green = Math.floor(Math.random() * 256);
// 	const blue = Math.floor(Math.random() * 256);

// 	const color = `rgb(${red}, ${green}, ${blue})`;

// 	return color;
// };

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
		this._showChildren = (uid) => {};
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

		this.#currentGeoResourceId = null;
		this.#overTarget = false;
		this.#ignoreLevelOneFirstOnLeave = false;

		this.#keyListener = null;
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

			if (draggedEntry.showChildren) {
				this._showChildren(draggedEntry.uid);
			}
			const draggedEntryUid = draggedEntry.uid;
			event.dataTransfer.clearData();
			event.dataTransfer.setData('UID' + draggedEntryUid, draggedEntryUid);

			const target = event.target;
			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			event.target.classList.remove('isdragged');

			removeDragOverClass();

			if (!this.#overTarget) {
				this._resetCatalog();
			}
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
				this._showChildren(entry.uid);
			}
		};

		const handleEnterKeyPress = (event, button, catalogEntry) => {
			if (event.key === 'Enter') {
				const focusedElement = document.activeElement;
				if (focusedElement.tagName === 'BA-ADMINPANEL' || focusedElement.tagName === 'TEXTAREA') {
					if (button) {
						button.click(event, catalogEntry);
					}
				}
			}
		};

		const handleEditClick = (event, catalogEntry) => {
			const button = event.target;
			const li = button.parentNode;

			const keyPressHandler = (event) => {
				handleEnterKeyPress(event, button, catalogEntry);
			};

			if (button.textContent === 'Edit') {
				this.signal(Update_Edit_Mode, true);
				const span = li.firstElementChild;

				if (this.#keyListener === null) {
					this.#keyListener = keyPressHandler;
					document.addEventListener('keydown', keyPressHandler);
				}

				const input = document.createElement('input');
				input.type = 'text';
				input.value = catalogEntry.label;
				li.insertBefore(input, span);
				li.removeChild(span);
				button.textContent = 'Save';
				input.focus();
			} else if (button.textContent === 'Save') {
				this.signal(Update_Edit_Mode, false);
				const input = li.firstElementChild;
				const span = document.createElement('span');

				if (this.#keyListener !== null) {
					document.removeEventListener('keydown', this.#keyListener);
					this.#keyListener = null;
				}

				span.textContent = input.value.trim();
				li.insertBefore(span, input);
				li.removeChild(input);
				button.textContent = 'Edit';

				// Make a deep copy of catalogWithResourceData
				const catalogCopy = JSON.parse(JSON.stringify(catalogWithResourceData));

				// Find the corresponding entry in the copy and update its label
				const catalogEntryCopy = catalogCopy.find((e) => e.uid === catalogEntry.uid);
				if (catalogEntryCopy) {
					catalogEntryCopy.label = input.value.trim();
				}

				// Update_CatalogWithResourceData with [], to force refresh
				this.signal(Update_CatalogWithResourceData, []);
				this._refreshCatalog(catalogCopy);
			}

			event.stopPropagation();
		};

		const handleDeleteClick = (event, catalogEntry) => {
			this._removeEntry(catalogEntry.uid);

			event.stopPropagation();
			event.preventDefault();
		};

		const handleCopyClick = (event, catalogEntry) => {
			this._copyBranch(catalogWithResourceData, catalogEntry);

			event.stopPropagation();
			event.preventDefault();
		};

		const handleNewTopicClick = () => {
			this._updateTopic('newEntry');
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
			this._deleteTopicLevelTree(this.#currentTopic);
			this.#currentTopic = null;
		};

		const handleTopicChange = (event) => {
			const foundTopic = topics.find((topic) => topic._id === event.target.value);

			if (foundTopic) {
				this.#currentTopic = foundTopic;
			}

			this._updateTopic(event.target.value);
		};

		// const handleMouseEnter = (event, catalogEntry) => {
		// 	const element = event.target;

		// 	element.style.backgroundColor = 'lightblue';
		// };

		// const handleMouseLeave = (event, catalogEntry) => {
		// 	const element = event.target;

		// 	element.style.backgroundColor = '';
		// };

		// @mouseover=${(event) => handleMouseEnter(event, entry)}
		// @mouseout=${(event) => handleMouseLeave(event, entry)}

		const renderEntry = (entry, index, level) => {
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
						${entry.label} ${entry.geoResourceId ? '(' + entry.geoResourceId + ')' : ''}
					</span>
					${entry.children
						? html`
								<button @click="${(event) => handleEditClick(event, entry)}">Edit</button>
								<button .disabled=${editMode} @click="${(event) => handleCopyClick(event, entry)}">Copy</button>
								<button .disabled=${editMode} @click="${(event) => handleDeleteClick(event, entry)}">X</button>
								<ul>
									${entry.children.map((child) => html`<li>${renderEntry(child)}</li>`)}
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
					<h2>Layer Tree - Ebenenbaum für Thema "${this.#currentTopic._label}"${sperrText}</h2>
					<button @click="${handleNewTopicClick}">New Topic</button>
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
							(catalogEntry, index) => html`<li class="ba-list-item">${renderEntry(catalogEntry, index, 1)}</li>`
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

	get resetCatalog() {
		return this._resetCatalog;
	}

	/**
	 * @property {function} refreshCatalog - Callback function
	 */
	set refreshCatalog(callback) {
		this._refreshCatalog = callback;
	}

	get refreshCatalog() {
		return this._refreshCatalog;
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
	 * @property {function} showChildren - Callback function
	 */
	set showChildren(callback) {
		this._showChildren = callback;
	}

	get showChildren() {
		return this._showChildren;
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

	get moveElement() {
		return this._moveElement;
	}

	/**
	 * @property {function} saveCatalog - Callback function
	 */
	set saveCatalog(callback) {
		this._saveCatalog = callback;
	}

	get saveCatalog() {
		return this._saveCatalog;
	}

	static get tag() {
		return 'ba-layer-tree';
	}
}
