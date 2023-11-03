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

const Update_Topics = 'update_topics';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Layers = 'update_layers';
const Update_Dummy = 'update_dummy';

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

/**
 * Contains
 *
 * @class
 */
export class LayerTree extends MvuElement {
	#currentGeoResourceId;
	#currentUId;

	constructor() {
		super({
			topics: [],
			catalogWithResourceData: [],
			layers: [],
			currentGeoResourceId: null,
			dummy: false
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

		this.#currentGeoResourceId = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Topics:
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: data };
			case Update_Layers:
				return { ...model, layers: data };
			case Update_Dummy:
				return { ...model, dummy: data };
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData, currentGeoResourceId } = model;

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

		const onDragStart = (event, draggedEntry) => {
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
		};

		const onDragOver = (event, currentCatalogEntry) => {
			const types = event.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoResourceIdFromList = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;
			if (newGeoResourceIdFromList) {
				if (newGeoResourceIdFromList === currentCatalogEntry.geoResourceId) {
					event.preventDefault();
					return;
				}
				this.#currentGeoResourceId = newGeoResourceIdFromList;
				insertDraggedGeoResource(currentCatalogEntry.uid, newGeoResourceIdFromList);
			}

			const matchedElementUid = types.find((element) => /uid(.+)/i.test(element));
			const uidFromDrag = matchedElementUid ? matchedElementUid.replace(/uid/, '') : null;
			if (uidFromDrag) {
				if (uidFromDrag === currentCatalogEntry.uid) {
					event.preventDefault();
					return;
				}
				if (this.#currentUId === currentCatalogEntry.uid) {
					event.preventDefault();
					return;
				}

				this.#currentUId = currentCatalogEntry.uid;
				this._moveElement(currentCatalogEntry.uid, uidFromDrag);
			}

			const spanElement = event.target;
			spanElement.classList.add('drag-over');
		};

		const onDrop = () => {
			this.#currentGeoResourceId = null;

			this._addGeoResourcePermanently();
		};

		const onDragLeave = (event) => {
			event.target.classList.add('isdragged');
			event.target.classList.remove('drag-over');
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

		const handleEditClick = (event) => {
			const button = event.target;
			const li = button.parentNode;

			if (button.textContent === 'Edit') {
				const span = li.firstElementChild;

				const input = document.createElement('input');
				input.type = 'text';
				input.value = span.textContent;
				li.insertBefore(input, span);
				li.removeChild(span);
				button.textContent = 'Save';
			} else if (button.textContent === 'Save') {
				const input = li.firstElementChild;
				const span = document.createElement('span');
				span.textContent = input.value;
				li.insertBefore(span, input);
				li.removeChild(input);
				button.textContent = 'Edit';
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

		// const handleNewClick = () => {
		// 	// eslint-disable-next-line no-console
		// 	// console.log('🚀 ~ LayerTree. ~ handleNewClick ~ e:', e);
		// };

		const handleNewLayerGroupClick = () => {
			this._addLayerGroup();
		};

		const handleSaveClick = () => {
			this._saveCatalog();
		};

		const handleTopicChange = (event) => {
			this._updateTopic(event.target.value);
		};

		const renderEntry = (entry) => {
			return html`
				<li
					@click="${(event) => handleCategoryClick(event, entry)}"
					class="${(entry.children ? hasChildrenClass + ' ' : '') + (entry.showChildren ? showChildrenClass : '')}"
				>
					<span
						id="${entry.geoResourceId}"
						class="draggable ${(entry.children ? hasChildrenClass + ' ' : '') + droppableClass}"
						draggable="true"
						@dragover=${(event) => onDragOver(event, entry)}
						@dragleave=${onDragLeave}
						@drop=${onDrop}
						@dragstart=${(event) => onDragStart(event, entry)}
						@dragend=${onDragEnd}
					>
						${entry.label} ${entry.geoResourceId ? '(' + entry.geoResourceId + ')' : ''}
					</span>
					${entry.children
						? html`
								<button @click="${(event) => handleEditClick(event)}">Edit</button>
								<button @click="${(event) => handleCopyClick(event, entry)}">Copy</button>
								<button @click="${(event) => handleDeleteClick(event, entry)}">X</button>
								<ul>
									${entry.children.map((child) => html`<li>${renderEntry(child)}</li>`)}
								</ul>
						  `
						: html`<button @click="${(event) => handleDeleteClick(event, entry)}">X</button>`}
					<i class="uil uil-draggabledots"></i>
				</li>
			`;
		};

		// <button @click="${handleNewClick}">New</button>			<button @click="${handleSaveClick(catalogWithResourceData)}">sichern</button>
		if (topics) {
			return html`
				<style>
					${css}
				</style>

				<div>
					<h2>Layer Tree - Ebenenbaum für Thema</h2>
					<button @click="${handleNewLayerGroupClick}">neue Ebenengruppe</button>
					<button @click="${handleSaveClick}">sichern</button>

					<select @change="${handleTopicChange}">
						${topics.map((topic) => html` <option value="${topic._id}">${topic._label}</option> `)}
					</select>
					<ul>
						${catalogWithResourceData.map((catalogEntry) => html`<li>${renderEntry(catalogEntry)}</li>`)}
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
