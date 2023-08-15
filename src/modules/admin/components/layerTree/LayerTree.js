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

		this._addGeoResourcePermanently = () => {};
		this._copyBranchRoot = () => {};
	}

	onInitialize() {
		this._addGeoResource = () => {};
		this._removeEntry = () => {};
		// 	this.observeModel('catalogWithResourceData', () => {
		// 		this._initDragAndDrop();
		// 	});
	}

	// _initDragAndDrop() {
	// 	console.log('🚀 ~ LayerTree ~ _initDragAndDrop');
	// }

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
				return { ...model, currentGeoResourceId: data };
			case Update_CurrentUid:
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

		const findGeoResourceIdIndex = (resourceId) => {
			for (let i = 0; i < catalogWithResourceData.length; i++) {
				const catalogEntry = catalogWithResourceData[i];

				if (catalogEntry.geoResourceId === resourceId) {
					// Found the geoResourceId in the top-level entries
					return [i];
				}

				if (catalogEntry.children) {
					// Check the children for the geoResourceId
					for (let j = 0; j < catalogEntry.children.length; j++) {
						if (catalogEntry.children[j].geoResourceId === resourceId) {
							// Found the geoResourceId in the children
							return [i, j];
						}
					}
				}
			}

			// geoResourceId not found in the array
			return null;
		};

		const insertDraggedGeoResource = (layerTreeCatalogEntry, georesourceIdFromList) => {
			if (georesourceIdFromList) {
				logOnce(georesourceIdFromList + ' georesourceIdFromList', '🚀 ~ LayerTree ~ onDragOver ~ georesourceIdFromList: ' + georesourceIdFromList);
				logOnce(
					layerTreeCatalogEntry.uid + ' layerTreeCatalogEntry',
					'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
						layerTreeCatalogEntry.label +
						'  layerTreeCatalogEntry.uid: ' +
						layerTreeCatalogEntry.uid
				);
				// if (currentGeoResourceId === georesourceIdFromList && currentUid === layerTreeCatalogEntry.uid) {
				if (currentGeoResourceId === georesourceIdFromList) {
					logOnce(
						layerTreeCatalogEntry.uid + ' ' + georesourceIdFromList,
						' 🚀 ~ nothing new - return (local label: ' + layerTreeCatalogEntry.label + ' georesourceIdFromList: ' + georesourceIdFromList + ')'
					);
					return;
				}

				// const newElementUid = this._addGeoResource(layerTreeCatalogEntry, georesourceIdFromList, [...catalogWithResourceData]);

				// this.signal(Update_CurrentGeoResourceId, georesourceIdFromList);
				// this.signal(Update_CurrentUid, newElementUid);
				//
				//
				// if (currentGeoResourceId === newGeoresourceId) {
				// 	logOnce('🚀 ~ nothing new - return (' + layerTreeCatalogEntry.label + ')');
				// 	return;
				// }
				// logOnce('🚀 ~ new - GeoResourceId ' + layerTreeCatalogEntry.label);

				if (layerTreeCatalogEntry.geoResourceId) {
					logOnce('current ' + layerTreeCatalogEntry.geoResourceId, layerTreeCatalogEntry);
					const currentLocationIndexArray = findGeoResourceIdIndex(layerTreeCatalogEntry.geoResourceId);
					logOnce('currentLocationIndexArray ' + layerTreeCatalogEntry.geoResourceId, currentLocationIndexArray);

					if (currentLocationIndexArray) {
						if (currentLocationIndexArray.length === 1) {
							logOnce('currentLocationIndexArray.length === 1 ' + layerTreeCatalogEntry.geoResourceId, '');
							const currentIndex = currentLocationIndexArray[0];
							let inBetween = 0;
							if (currentIndex > 0) {
								const priorCatalogEntry = catalogWithResourceData[currentIndex - 1];
								inBetween = Math.round((layerTreeCatalogEntry.id + priorCatalogEntry.id) / 2);
							} else {
								inBetween = Math.round(layerTreeCatalogEntry.id / 2);
							}
							this._addGeoResource(georesourceIdFromList, inBetween);
						}
						if (currentLocationIndexArray.length === 2) {
							logOnce('currentLocationIndexArray.length === 2 ' + layerTreeCatalogEntry.geoResourceId, '');
							const currentIndex = currentLocationIndexArray[1];
							let inBetween = 0;
							if (currentIndex > 0) {
								const priorCatalogEntry = catalogWithResourceData[(currentLocationIndexArray[0], currentIndex - 1)];
								inBetween = Math.round((layerTreeCatalogEntry.id + priorCatalogEntry.id) / 2);
							} else {
								inBetween = Math.round(layerTreeCatalogEntry.id / 2);
							}
							this._addGeoResource(georesourceIdFromList, inBetween, currentLocationIndexArray[0]);
						}
					} else {
						logOnce(layerTreeCatalogEntry.label, layerTreeCatalogEntry);
					}
				}
				this.signal(Update_CurrentGeoResourceId, georesourceIdFromList);
			}
		};

		const onDragOver = (e, layerTreeCatalogEntry) => {
			logOnce(
				layerTreeCatalogEntry.uid + ' layerTreeCatalogEntry',
				'🚀 ~ LayerTree ~ onDragOver ~ layerTreeCatalogEntry.label: ' +
					layerTreeCatalogEntry.label +
					'  ~ layerTreeCatalogEntry.children: ' +
					layerTreeCatalogEntry.children
			);

			// todo ????
			// // expand children if any
			// const spanElement = e.target;
			// const liElement = spanElement.parentNode;
			// if (liElement.classList.contains(hasChildrenClass)) {
			// 	liElement.classList.add(showChildrenClass);
			// }

			const types = e.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const georesourceIdFromList = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;

			logOnce('newGeoresourceId', georesourceIdFromList);

			insertDraggedGeoResource(layerTreeCatalogEntry, georesourceIdFromList);

			const spanElement = e.target;

			const liElement = spanElement.parentNode;

			if (liElement.classList.contains(hasChildrenClass)) {
				liElement.classList.add(showChildrenClass);
			}
			spanElement.classList.add('drag-over');

			e.preventDefault();
		};

		const onDrop = () => {
			this.addGeoResourcePermanently();
		};

		const onDragLeave = (e) => {
			const lastGeoResourceId = currentGeoResourceId;
			this.signal(Update_CurrentGeoResourceId, '');

			this._removeEntry(lastGeoResourceId);

			e.target.classList.add('isdragged');
			e.target.classList.remove('drag-over');
			e.preventDefault();
		};

		const handleEditClick = (catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ createView ~ handleEditClick ~ catalogEntry:', catalogEntry);
		};
		const handleDeleteClick = (catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ handleDeleteClick ~ handleDeleteClick ~ catalogEntry:', catalogEntry);
		};

		const handleCopyClick = (catalogEntry) => {
			console.log('🚀 ~ LayerTree ~ handleDeleteClick ~ handleCopyClick ~ catalogEntry:', catalogEntry);
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

					<div class="tree">
						<ul>
							${catalogWithResourceData.map(
								(catalogEntry) => html`
									<li @click="${handleCategoryClick}" class="${catalogEntry.children ? hasChildrenClass : ''}">
										<span
											draggable="true"
											class="${catalogEntry.children ? hasChildrenClass + ' ' + droppableClass : droppableClass}"
											@dragover=${(e) => onDragOver(e, catalogEntry)}
											@drop=${onDrop}
											@dragleave=${onDragLeave}
											>${catalogEntry.label}</span
										>
										${catalogEntry.children
											? html`
													<button @click="${() => handleEditClick(catalogEntry)}">Edit</button>
													<button @click="${() => handleDeleteClick(catalogEntry)}">Copy</button>
													<button @click="${() => handleCopyClick(catalogEntry)}">X</button>
													<ul>
														${catalogEntry.children.map(
															(child) =>
																html`<li>
																	<span class="${droppableClass}" @dragover=${(e) => onDragOver(e, child)} @drop=${onDrop} @dragleave=${onDragLeave}
																		>${child.label}</span
																	>
																</li>`
														)}
													</ul>
											  `
											: html`<button @click="${() => handleDeleteClick(catalogEntry)}">X</button>`}

										<i class="uil uil-draggabledots"></i>
									</li>
								`
							)}
						</ul>
					</div>
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

	static get tag() {
		return 'ba-layer-tree';
	}
}
