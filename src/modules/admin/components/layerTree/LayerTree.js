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
	}
};

// const logXs = (arrayOfX, x) => {
// 	let xs = '';
// 	arrayOfX.forEach((item) => {
// 		if (item[x]) {
// 			xs += item[x] + ' ';
// 		}
// 	});
// 	console.log(xs);
// };

// logXs(data, 'geoResourceId');

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
			currentUid: null
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
		this._addGeoResourcePermanently = () => {};
		// eslint-disable-next-line no-unused-vars
		this._copyBranchRoot = (a, b) => {};
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
				console.log('🚀 ~ update ~ Update_CurrentGeoResourceId:', data);
				return { ...model, currentGeoResourceId: data };
			case Update_CurrentUid:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ update ~ Update_CurrentUid:', data);
				return { ...model, currentUid: data };
			case Update_Currents:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ update ~ Update_Currents:', data);
				return { ...model, currentUid: data.currentUid, currentGeoResourceId: data.currentGeoResourceId };
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData, currentGeoResourceId, currentUid } = model; // todo ?? , selectedTopicId

		if (
			catalogWithResourceData === null ||
			(catalogWithResourceData && catalogWithResourceData.length === 0) ||
			topics === null ||
			(topics && topics.length === 0)
		) {
			return nothing;
		}

		// const findGeoResourceIdIndex = (resourceId) => {
		// 	for (let i = 0; i < catalogWithResourceData.length; i++) {
		// 		const catalogEntry = catalogWithResourceData[i];

		// 		if (catalogEntry.geoResourceId === resourceId) {
		// 			// Found the geoResourceId in the top-level entries
		// 			return [i];
		// 		}

		// 		if (catalogEntry.children) {
		// 			// Check the children for the geoResourceId
		// 			for (let j = 0; j < catalogEntry.children.length; j++) {
		// 				if (catalogEntry.children[j].geoResourceId === resourceId) {
		// 					// Found the geoResourceId in the children
		// 					return [i, j];
		// 				}
		// 			}
		// 		}
		// 	}

		// 	// geoResourceId not found in the array
		// 	return null;
		// };

		// const insertDraggedGeoResource = (layerTreeCatalogEntry, georesourceIdFromList) => {
		// 	if (georesourceIdFromList) {
		// 		logOnce(georesourceIdFromList + ' georesourceIdFromList', '🚀 ~ LayerTree ~ onDragOver ~ georesourceIdFromList: ' + georesourceIdFromList);
		// 		logOnce(
		// 			'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
		// 				layerTreeCatalogEntry.label +
		// 				'  layerTreeCatalogEntry.uid: ' +
		// 				layerTreeCatalogEntry.uid
		// 		);
		// 		// if (currentGeoResourceId === georesourceIdFromList && currentUid === layerTreeCatalogEntry.uid) {
		// 		if (currentGeoResourceId === georesourceIdFromList) {
		// 			logOnce(
		// 				layerTreeCatalogEntry.uid + ' ' + georesourceIdFromList,
		// 				' 🚀 ~ nothing new - return (local label: ' + layerTreeCatalogEntry.label + ' georesourceIdFromList: ' + georesourceIdFromList + ')'
		// 			);
		// 			return;
		// 		}

		// 		// const newElementUid = this._addGeoResource(layerTreeCatalogEntry, georesourceIdFromList, [...catalogWithResourceData]);

		// 		// this.signal(Update_CurrentGeoResourceId, georesourceIdFromList);
		// 		// this.signal(Update_CurrentUid, newElementUid);
		// 		//
		// 		//
		// 		// if (currentGeoResourceId === newGeoresourceId) {
		// 		// 	logOnce('🚀 ~ nothing new - return (' + layerTreeCatalogEntry.label + ')');
		// 		// 	return;
		// 		// }
		// 		// logOnce('🚀 ~ new - GeoResourceId ' + layerTreeCatalogEntry.label);

		// 		if (layerTreeCatalogEntry.geoResourceId) {
		// 			logOnce('current ' + layerTreeCatalogEntry.geoResourceId, layerTreeCatalogEntry);
		// 			const currentLocationIndexArray = findGeoResourceIdIndex(layerTreeCatalogEntry.geoResourceId);
		// 			logOnce('currentLocationIndexArray ' + layerTreeCatalogEntry.geoResourceId, currentLocationIndexArray);

		// 			if (currentLocationIndexArray) {
		// 				if (currentLocationIndexArray.length === 1) {
		// 					logOnce('currentLocationIndexArray.length === 1 ' + layerTreeCatalogEntry.geoResourceId, '');
		// 					const currentIndex = currentLocationIndexArray[0];
		// 					let inBetween = 0;
		// 					if (currentIndex > 0) {
		// 						const priorCatalogEntry = catalogWithResourceData[currentIndex - 1];
		// 						inBetween = Math.round((layerTreeCatalogEntry.id + priorCatalogEntry.id) / 2);
		// 					} else {
		// 						inBetween = Math.round(layerTreeCatalogEntry.id / 2);
		// 					}
		// 					this._addGeoResource(georesourceIdFromList, inBetween);
		// 				}
		// 				if (currentLocationIndexArray.length === 2) {
		// 					logOnce('currentLocationIndexArray.length === 2 ' + layerTreeCatalogEntry.geoResourceId, '');
		// 					const currentIndex = currentLocationIndexArray[1];
		// 					let inBetween = 0;
		// 					if (currentIndex > 0) {
		// 						const priorCatalogEntry = catalogWithResourceData[(currentLocationIndexArray[0], currentIndex - 1)];
		// 						inBetween = Math.round((layerTreeCatalogEntry.id + priorCatalogEntry.id) / 2);
		// 					} else {
		// 						inBetween = Math.round(layerTreeCatalogEntry.id / 2);
		// 					}
		// 					this._addGeoResource(georesourceIdFromList, inBetween, currentLocationIndexArray[0]);
		// 				}
		// 			} else {
		// 				logOnce(layerTreeCatalogEntry.label, layerTreeCatalogEntry);
		// 			}
		// 		}
		// 		this.signal(Update_CurrentGeoResourceId, georesourceIdFromList);
		// 	}
		// };

		const insertDraggedGeoResource = (currentUid, newGeoResourceId) => {
			if (newGeoResourceId) {
				// logOnce(georesourceIdFromList + ' georesourceIdFromList', '🚀 ~ LayerTree ~ onDragOver ~ georesourceIdFromList: ' + georesourceIdFromList);
				// logOnce(
				// 	layerTreeCatalogEntry.uid + ' layerTreeCatalogEntry',
				// 	'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
				// 		layerTreeCatalogEntry.label +
				// 		'  layerTreeCatalogEntry.uid: ' +
				// 		layerTreeCatalogEntry.uid
				// );
				if (newGeoResourceId === currentGeoResourceId && currentUid === currentUid.uid) {
					// logOnce(
					// 	layerTreeCatalogEntry.uid + ' ' + georesourceIdFromList,
					// 	' 🚀 ~ nothing new - return (local label: ' + layerTreeCatalogEntry.label + ' georesourceIdFromList: ' + georesourceIdFromList + ')'
					// );
					return;
				}

				const newElementUid = this._addGeoResource(currentUid, newGeoResourceId, [...catalogWithResourceData]);
				logOnce('🚀 ~ insertDraggedGeoResource ~ newElementUid:', newElementUid);

				this.signal(Update_Currents, { currentGeoResourceId: newGeoResourceId, currentUid: newElementUid });
			}
		};

		// // todo const insertDraggedUid = (layerTreeCatalogEntry, newUid) => {
		// // };

		// todo in the workss
		const onDragStart = (event) => {
			console.log('🚀 ~ file: LayerTree.js:259 ~ onDragStart ~ e:', event);
			const target = event.target;
			const uid = event.target.uid;

			event.dataTransfer.clearData();
			event.dataTransfer.setData('UID' + uid, uid);

			this._removeEntry(uid);

			const addIsDragged = () => {
				target.classList.add('isdragged');
			};

			setTimeout(addIsDragged, 0);
		};

		const onDragEnd = (event) => {
			console.log('🚀 ~ file: LayerTree.js:276 ~ onDragEnd ~ event:', event);
			event.target.classList.remove('isdragged');
		};

		// todo ????
		// // expand children if any
		// const spanElement = e.target;
		// const liElement = spanElement.parentNode;
		// if (liElement.classList.contains(hasChildrenClass)) {
		// 	liElement.classList.add(showChildrenClass);
		// }

		// const onDragOver = (e, layerTreeCatalogEntry) => {
		// 	logOnce(
		// 		layerTreeCatalogEntry.uid + ' layerTreeCatalogEntry',
		// 		'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
		// 			layerTreeCatalogEntry.label +
		// 			'  ~ layerTreeCatalogEntry.children: ' +
		// 			layerTreeCatalogEntry.children
		// 	);
		// 	const types = e.dataTransfer.types;
		// 	const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
		// 	const georesourceIdFromList = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;

		// 	logOnce('newGeoresourceId', georesourceIdFromList);

		// 	insertDraggedGeoResource(layerTreeCatalogEntry, georesourceIdFromList);

		// 	const spanElement = e.target;

		// 	const liElement = spanElement.parentNode;

		// 	if (liElement.classList.contains(hasChildrenClass)) {
		// 		liElement.classList.add(showChildrenClass);
		// 	}
		// 	spanElement.classList.add('drag-over');

		// 	e.preventDefault();
		// };
		const onDragOver = (event, currentCatalogEntry) => {
			logOnce('🚀 ~ onDragOver ~ layerTreeCatalogEntry.uid:' + currentCatalogEntry.uid);
			logOnce('🚀 ~ onDragOver ~ layerTreeCatalogEntry.label:' + currentCatalogEntry.label);
			logOnce('🚀 ~ onDragOver ~ layerTreeCatalogEntry.geoResourceId:' + currentCatalogEntry.geoResourceId);
			// logOnce(
			// 	layerTreeCatalogEntry.uid + ' layerTreeCatalogEntry',
			// 	'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
			// 		layerTreeCatalogEntry.label +
			// 		'  ~ layerTreeCatalogEntry.children: ' +
			// 		layerTreeCatalogEntry.children
			// );

			const types = event.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoResourceId = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;
			logOnce('🚀 ~ onDragOver ~ newGeoResourceId: ' + newGeoResourceId);

			// todo look for uid and insert uid element (sort tree)

			if (newGeoResourceId === currentCatalogEntry.geoResourceId) {
				logOnce('🚀 ~ onDragOver ~ newGeoResourceId === currentCatalogEntry.geoResourceId -> return');
				event.preventDefault();
				return;
			}
			insertDraggedGeoResource(currentCatalogEntry.uid, newGeoResourceId);

			const spanElement = event.target;
			spanElement.classList.add('drag-over');
		};

		const onDrop = (event) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: LayerTree.js:348 ~ onDrop ~ event:', event);
			this._addGeoResourcePermanently();
		};

		const onDragLeave = (event) => {
			event.target.classList.add('isdragged');
			event.target.classList.remove('drag-over');
			event.preventDefault();

			this._removeEntry(currentUid);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ onDragLeave ~ this._removeEntry(lastUid): ', currentUid);

			this.signal(Update_CurrentUid, '');
		};

		const handleCategoryClick = (event) => {
			const li = event.currentTarget;
			const ul = li.querySelector('ul');
			const button = li.querySelector('button');
			console.log('🚀 ~ file: LayerTree.js:362 ~ handleCategoryClick ~ button:', button);

			event.stopPropagation();
			event.preventDefault();

			if (button.textContent === 'Save') {
				return;
			}

			if (ul) {
				li.classList.toggle(showChildrenClass);
			}
		};

		const handleEditClick = (event, catalogEntry) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: LayerTree.js:370 ~ handleEditClick ~ event:', event);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ catalogEntry:', catalogEntry);

			const button = event.target;
			const li = button.parentNode;

			if (button.textContent == 'Edit') {
				console.log('🚀 ~ file: LayerTree.js:376 ~ handleEditClick ~ li:', li);
				const span = li.firstElementChild;
				console.log('🚀 ~ file: LayerTree.js:378 ~ handleEditClick ~ span:', span);

				const input = document.createElement('input');
				input.type = 'text';
				input.value = span.textContent;
				li.insertBefore(input, span);
				li.removeChild(span);
				button.textContent = 'Save';
			} else if (button.textContent === 'Save') {
				// todo Save
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
			console.log('🚀 ~ LayerTree ~ handleDeleteClick ~ handleDeleteClick ~ catalogEntry:', catalogEntry);
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

		const renderEntry = (entry) => {
			return html`
				<li @click="${handleCategoryClick}" class="${entry.children ? hasChildrenClass : ''}">
					<span
						id="${entry.geoResourceId}"
						class="${entry.children ? hasChildrenClass + ' ' + droppableClass : droppableClass}"
						draggable="true"
						@dragover=${(event) => onDragOver(event, entry)}
						@dragleave=${onDragLeave}
						@drop=${onDrop}
						@dragstart=${onDragStart}
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
					<h2>Layer Tree</h2>
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
	 * @property {function} addGeoResource - Callback function
	 */
	set addGeoResource(callback) {
		this._addGeoResource = callback;
	}

	get addGeoResource() {
		return this._addGeoResource;
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

	static get tag() {
		return 'ba-layer-tree';
	}
}
