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

		this._addGeoResource = (a, b, c) => {
			return '';
		};
		this._removeEntry = (a) => {};
		this._addGeoResourcePermanently = () => {};
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
				console.log('🚀 ~ update ~ Update_CurrentGeoResourceId:', data);
				return { ...model, currentGeoResourceId: data };
			case Update_CurrentUid:
				console.log('🚀 ~ update ~ Update_CurrentUid:', data);
				return { ...model, currentUid: data };
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

		const handleCategoryClick = (event) => {
			const li = event.currentTarget;
			const ul = li.querySelector('ul');

			if (ul) {
				li.classList.toggle(showChildrenClass);
			}
		};

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

				this.signal(Update_CurrentGeoResourceId, newGeoResourceId);
				this.signal(Update_CurrentUid, newElementUid);
			}
		};

		// // todo const insertDraggedUid = (layerTreeCatalogEntry, newUid) => {
		// // };

		// // todo in the works
		// const onDragStart = (e) => {
		// 	const target = e.target;
		// 	const uid = e.target.uid;

		// 	e.dataTransfer.clearData();
		// 	e.dataTransfer.setData('UID' + uid, uid);

		// 	this._removeEntry(uid);

		// 	const addIsDragged = () => {
		// 		target.classList.add('isdragged');
		// 	};

		// 	setTimeout(addIsDragged, 0);
		// };

		// const onDragEnd = (event) => {
		// 	event.target.classList.remove('isdragged');
		// };

		// todo ????
		// // expand children if any
		// const spanElement = e.target;
		// const liElement = spanElement.parentNode;
		// if (liElement.classList.contains(hasChildrenClass)) {
		// 	liElement.classList.add(showChildrenClass);
		// }
		const onDragOver = (e, currentCatalogEntry) => {
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

			const types = e.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoResourceId = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;
			logOnce('🚀 ~ onDragOver ~ newGeoResourceId: ' + newGeoResourceId);

			// todo look for uid and insert uid element (sort tree)

			if (newGeoResourceId === currentCatalogEntry.geoResourceId) {
				logOnce('🚀 ~ onDragOver ~ newGeoResourceId === currentCatalogEntry.geoResourceId -> return');
				return;
			}
			insertDraggedGeoResource(currentCatalogEntry.uid, newGeoResourceId);

			const spanElement = e.target;
			spanElement.classList.add('drag-over');
			e.preventDefault();
		};

		const onDrop = (e) => {
			this.addGeoResourcePermanently();
		};

		const onDragLeave = (e) => {
			const lastUid = currentUid;
			this.signal(Update_CurrentUid, '');

			this._removeEntry(lastUid);
			console.log('🚀 ~ onDragLeave ~ this._removeEntry(lastUid): ', lastUid);

			e.target.classList.add('isdragged');
			e.target.classList.remove('drag-over');
			e.preventDefault();
		};

		const handleEditClick = (catalogEntry) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ catalogEntry:', catalogEntry);
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
						@dragover=${(e) => onDragOver(e, entry)}
						@dragleave=${onDragLeave}
						@drop=${onDrop}
					>
						${entry.label}
					</span>
					${entry.children
						? html`
								<button @click="${() => handleEditClick(entry)}">Edit</button>
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
