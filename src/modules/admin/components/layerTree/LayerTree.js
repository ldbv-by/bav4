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

import { setCurrentTopicId as updateStore } from '../../../../store/admin/admin.action';

const Update_SelectedTopic = 'update_selectedtopic';
const Update_Topics = 'update_topics';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Layers = 'update_layers';
const Update_CurrentGeoResourceId = 'update_currentGeoResourceId';
const Update_CurrentUid = 'update_currentUId';
const Update_Currents = 'update_currents';
const Update_Dummy = 'update_dummy';

const hasChildrenClass = 'has-children';
const showChildrenClass = 'show-children';
const droppableClass = 'droppable';

const logOnceDictionary = {};
export const logOnce = (key, objectToShow = 'nix') => {
	if (!logOnceDictionary[key]) {
		if (objectToShow === 'nix') {
			// eslint-disable-next-line no-console
			console.log(key);
		} else {
			if (typeof objectToShow === 'string') {
				// eslint-disable-next-line no-console
				console.log(objectToShow);
			} else {
				// eslint-disable-next-line no-console
				console.log(JSON.stringify(objectToShow));
			}
		}
		logOnceDictionary[key] = objectToShow;
		return true;
	}
	return false;
};

export const onlyOnce = (key) => {
	if (logOnceDictionary[key]) {
		return false;
	}
	logOnceDictionary[key] = key;
	return true;
};

/**
 * Contains
 *
 * @class
 */
export class LayerTree extends MvuElement {
	constructor() {
		super({
			topics: [],
			catalogWithResourceData: [],
			layers: [],
			selectedTopicId: '',
			currentGeoResourceId: null,
			currentUid: null,
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
		this._addGeoResource = (a, b, c) => {
			return '';
		};
		// eslint-disable-next-line no-unused-vars
		this._removeEntry = (a) => {};
		// eslint-disable-next-line no-unused-vars
		this._showChildren = (a) => {};
		this._addGeoResourcePermanently = () => {};
		// eslint-disable-next-line no-unused-vars
		this._copyBranchRoot = (a, b) => {};
		this._moveElement = (a, b) => {};
	}

	update(type, data, model) {
		switch (type) {
			case Update_SelectedTopic:
				return { ...model, selectedTopicId: data };
			case Update_Topics:
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: data };
			case Update_Layers:
				return { ...model, layers: data };
			case Update_CurrentGeoResourceId:
				// eslint-disable-next-line no-console
				// console.log('🚀 ~ update ~ Update_CurrentGeoResourceId:', data);
				return { ...model, currentGeoResourceId: data };
			case Update_CurrentUid:
				// eslint-disable-next-line no-console
				// console.log('🚀 ~ update ~ Update_CurrentUid:', data);
				return { ...model, currentUid: data };
			case Update_Currents:
				// eslint-disable-next-line no-console
				// console.log('🚀 ~ update ~ Update_Currents:', data);
				return { ...model, currentUid: data.currentUid, currentGeoResourceId: data.currentGeoResourceId };
			case Update_Dummy:
				return { ...model, dummy: data };
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData, currentGeoResourceId, currentUid } = model; // todo ?? , selectedTopicId
		// // eslint-disable-next-line no-console
		// console.log('🚀 ~ LayerTree ~ createView ~ catalogWithResourceData ( from model ): ', catalogWithResourceData);

		if (
			catalogWithResourceData === null ||
			(catalogWithResourceData && catalogWithResourceData.length === 0) ||
			topics === null ||
			(topics && topics.length === 0)
		) {
			return nothing;
		}

		const insertDraggedGeoResource = (currentCatalogEntryUid, newGeoResourceIdFromList) => {
			console.log('🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ LayerTree ~ insertDraggedGeoResource()');
			logOnce(
				currentUid + currentCatalogEntryUid + currentGeoResourceId + newGeoResourceIdFromList + ' currentUid',
				'🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ currentUid: ' + currentUid
			);
			logOnce(
				currentUid + currentCatalogEntryUid + currentGeoResourceId + newGeoResourceIdFromList + ' currentCatalogEntryUid',
				'🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ currentCatalogEntryUid: ' + currentCatalogEntryUid
			);
			logOnce(
				currentUid + currentCatalogEntryUid + currentGeoResourceId + newGeoResourceIdFromList + ' currentGeoResourceId',
				'🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ currentGeoResourceId: ' + currentGeoResourceId
			);
			logOnce(
				currentUid + currentCatalogEntryUid + currentGeoResourceId + newGeoResourceIdFromList + ' newGeoResourceIdFromList',
				'🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ newGeoResourceIdFromList: ' + newGeoResourceIdFromList
			);
			if (newGeoResourceIdFromList === currentGeoResourceId && currentUid === currentCatalogEntryUid) {
				logOnce(currentUid + currentCatalogEntryUid + currentGeoResourceId + newGeoResourceIdFromList + ' return', '🚀 ~ nothing new - return ');
				return;
			}

			// eslint-disable-next-line no-console
			console.log('🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ this._addGeoResource()');
			const newElementUid = this._addGeoResource(currentCatalogEntryUid, newGeoResourceIdFromList, [...catalogWithResourceData]);
			// logOnce('logOnce 🚀 ~ LayerTree ~ createView ~ insertDraggedGeoResource ~ newElementUid: ' + newElementUid);

			this.signal(Update_Currents, { currentGeoResourceId: newGeoResourceIdFromList, currentUid: newElementUid });
		};

		// // todo const insertDraggedUid = (layerTreeCatalogEntry, newUid) => {
		// // };

		// todo in the workss
		const onDragStart = (event, entry) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: LayerTree.js:259 ~ onDragStart ~ e:', event);
			const target = event.target;
			const uid = entry.uid;
			logOnce('logOnce 🚀 ~ LayerTree ~ createView ~ onDragStart ~ uid: ' + uid);

			event.dataTransfer.clearData();
			event.dataTransfer.setData('UID' + uid, uid);

			this._removeEntry(uid);

			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: LayerTree.js:276 ~ onDragEnd ~ event:', event);
			event.target.classList.remove('isdragged');
		};

		const onDragOver = (event, currentCatalogEntry) => {
			logOnce(
				'🚀🚀🚀🚀🚀🚀🚀🚀 ~ LayerTree ~ createView ~ onDragOver ~ layerTreeCatalogEntry.uid: ' +
					currentCatalogEntry.uid +
					' (' +
					currentCatalogEntry.label +
					')'
			);
			// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ layerTreeCatalogEntry.label: ' + currentCatalogEntry.label);
			// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ layerTreeCatalogEntry.geoResourceId: ' + currentCatalogEntry.geoResourceId);

			const types = event.dataTransfer.types;
			// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ types: ' + types);
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoResourceIdFromList = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;
			// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ newGeoResourceId: ' + newGeoResourceId);

			const matchedElementUid = types.find((element) => /uid(.+)/i.test(element));
			// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ matchedElementUid: ' + matchedElementUid);
			const uidFromDrag = matchedElementUid ? matchedElementUid.replace(/uid/, '') : null;
			// todo look for uid and insert uid element (sort tree manually)

			if (newGeoResourceIdFromList) {
				// eslint-disable-next-line no-console
				console.log(
					'🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ LayerTree ~ createView ~ onDragOver ~ if (newGeoResourceIdFromList) newGeoResourceIdFromList: ' +
						newGeoResourceIdFromList +
						' - currentCatalogEntry.geoResourceId: ' +
						currentCatalogEntry.geoResourceId
				);
				if (newGeoResourceIdFromList === currentCatalogEntry.geoResourceId) {
					logOnce('🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ LayerTree ~ createView ~ onDragOver ~ newGeoResourceId === currentCatalogEntry.geoResourceId -> return');
					event.preventDefault();
					return;
				}
				insertDraggedGeoResource(currentCatalogEntry.uid, newGeoResourceIdFromList);
			}

			if (uidFromDrag) {
				// eslint-disable-next-line no-console
				logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ uidFromDrag: ' + uidFromDrag);

				// if (newGeoResourceId === currentCatalogEntry.geoResourceId) {
				// 	// logOnce('🚀 ~ LayerTree ~ createView ~ onDragOver ~ newGeoResourceId === currentCatalogEntry.geoResourceId -> return');
				// 	event.preventDefault();
				// 	return;
				// }
				this._moveElement(currentCatalogEntry.uid, uidFromDrag);
			}

			const spanElement = event.target;
			spanElement.classList.add('drag-over');
		};

		const onDrop = (event) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ LayerTree ~ createView ~ onDrop ~ event:', event);
			this._addGeoResourcePermanently();
		};

		const onDragLeave = (event) => {
			event.target.classList.add('isdragged');
			event.target.classList.remove('drag-over');
			event.preventDefault();

			this._removeEntry(currentUid);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ LayerTree ~ createView ~ onDragLeave ~ this._removeEntry(lastUid): ', currentUid);

			this.signal(Update_CurrentUid, '');
		};

		const handleCategoryClick = (event, entry) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerTree ~ createView ~ handleCategoryClick ~ entry:', entry);
			const li = event.currentTarget;
			const button = li.querySelector('button');

			event.stopPropagation();
			event.preventDefault();

			if (button.textContent === 'Save') {
				return;
			}

			this._showChildren(entry.uid);

			// const ul = li.querySelector('ul');
			// if (ul) {
			// 	li.classList.toggle(showChildrenClass);
			// }
		};

		const handleEditClick = (event, catalogEntry) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ event:', event);
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ catalogEntry:', catalogEntry);

			const button = event.target;
			const li = button.parentNode;

			if (button.textContent === 'Edit') {
				// eslint-disable-next-line no-console
				// console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ li:', li);
				const span = li.firstElementChild;
				// eslint-disable-next-line no-console
				// console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ span:', span);

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

		const handleDeleteClick = (catalogEntry) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerTree ~ createView ~ handleDeleteClick ~ catalogEntry:', catalogEntry);
			this._removeEntry(catalogEntry.uid);
		};

		const handleCopyClick = (catalogEntry) => {
			let positionInCatalog = null;
			for (let i = 0; i < catalogWithResourceData.length; i++) {
				if (catalogEntry === catalogWithResourceData[i]) {
					positionInCatalog = i;
				}

				// if (catalogEntry.children) {
				// 	// Check the children for the geoResourceId
				// 	for (let j = 0; j < catalogEntry.children.length; j++) {
				// 		if (catalogEntry.children[j].geoResourceId === resourceId) {
				// 			// Found the geoResourceId in the children
				// 			return [i, j];
				// 		}
				// 	}
			}

			this.copyBranchRoot(positionInCatalog, catalogEntry);
		};

		const handleNewClick = (e) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ LayerTree. ~ handleNewClick ~ e:', e);
		};

		const renderEntry = (entry) => {
			// console.log('🚀 ~ file: LayerTree.js:438 ~ renderEntry ~ entry:', entry);
			return html`
				<li
					@click="${(event) => handleCategoryClick(event, entry)}"
					class="${(entry.children ? hasChildrenClass + ' ' : '') + (entry.showChildren ? showChildrenClass : '')}"
				>
					<span
						id="${entry.geoResourceId}"
						class="${(entry.children ? hasChildrenClass + ' ' : '') + droppableClass}"
						draggable="true"
						@dragover=${(event) => onDragOver(event, entry)}
						@dragleave=${onDragLeave}
						@drop=${onDrop}
						@dragstart=${(event) => onDragStart(event, entry)}
						@dragend=${onDragEnd}
					>
						${entry.label}
					</span>
					${entry.children
						? html`
								<button @click="${(event) => handleEditClick(event, entry)}">Edit</button>
								<button @click="${() => handleCopyClick(entry)}">Copy</button>
								<button @click="${() => handleDeleteClick(entry)}">X</button>
								<ul>
									${entry.children.map((child) => html`<li>${renderEntry(child)}</li>`)}
								</ul>
						  `
						: html`<button @click="${() => handleDeleteClick(entry)}">X</button>`}
					<i class="uil uil-draggabledots"></i>
				</li>
			`;
		};

		if (topics) {
			return html`
				<style>
					${css}
				</style>

				<div>
					<h2>Layer Tree - Ebenenbaum für Thema</h2>
					<button @click="${(event) => handleNewClick(event)}">New</button>

					<select @change="${this.handleTopicChange}">
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

	handleTopicChange(event) {
		const selectedTopicId = event.target.value;
		updateStore(selectedTopicId);
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
	 * @property {string} selectedTheme = []
	 */
	set selectedTopic(value) {
		this.signal(Update_SelectedTopic, value);
	}

	get selectedTopic() {
		return this.getModel().selectedTheme;
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
	 * @property {function} copyBranchRoot - Callback function
	 */
	set copyBranchRoot(callback) {
		this._copyBranchRoot = callback;
	}

	get copyBranchRoot() {
		return this._copyBranchRoot;
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

	static get tag() {
		return 'ba-layer-tree';
	}
}
