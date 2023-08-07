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

const hasChildrenClass = 'has-children';
const showChildrenClass = 'show-children';
const droppableClass = 'droppable';

const logOnceDictionary = {};
const logOnce = (key, objectToShow = 'nix') => {
	if (!logOnceDictionary[key]) {
		if (objectToShow === 'nix') {
			// eslint-disable-next-line no-console
			console.log(key);
		} else {
			// eslint-disable-next-line no-console
			console.log(key + ' : ', JSON.stringify(objectToShow));
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
			currentGeoResourceId: null
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			SecurityService: securityService
		} = $injector.inject('ConfigService', 'TranslationService', 'SecurityService');

		this._configService = configService;
		this._translationService = translationService;
		this._securityService = securityService;

		this._afterDrop = () => {};
	}

	onInitialize() {
		this._addGeoResource = () => {};
		this._removeGeoResource = () => {};
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
		}
	}

	createView(model) {
		const { topics, catalogWithResourceData, currentGeoResourceId } = model; // todo , selectedTopicId

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

			const ul = li.querySelector('ul'); // Get the child <ul> element

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

		const insertDraggedGeoResource = (layerTreeCatalogEntry, newGeoresourceId) => {
			if (currentGeoResourceId === newGeoresourceId) {
				logOnce('🚀 ~ nothing new - return (' + layerTreeCatalogEntry.label + ')');
				return;
			}
			logOnce('🚀 ~ new - GeoResourceId ' + layerTreeCatalogEntry.label);

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
						this._addGeoResource(newGeoresourceId, inBetween);
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
						this._addGeoResource(newGeoresourceId, inBetween, currentLocationIndexArray[0]);
					}
				} else {
					logOnce(layerTreeCatalogEntry.label, layerTreeCatalogEntry);
				}
			}
			this.signal(Update_CurrentGeoResourceId, newGeoresourceId);
		};

		const onDragOver = (e, layerTreeCatalogEntry) => {
			const types = e.dataTransfer.types;
			const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
			const newGeoresourceId = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;

			logOnce('newGeoresourceId', newGeoresourceId);

			insertDraggedGeoResource(layerTreeCatalogEntry, newGeoresourceId);

			const spanElement = e.target;

			const liElement = spanElement.parentNode;

			if (liElement.classList.contains(hasChildrenClass)) {
				liElement.classList.add(showChildrenClass);
			}
			spanElement.classList.add('drag-over');

			e.preventDefault();
		};

		const onDrop = () => {
			this.afterDrop();
		};

		const onDragLeave = (e) => {
			const lastGeoResourceId = currentGeoResourceId;
			this.signal(Update_CurrentGeoResourceId, '');

			this._removeGeoResource(lastGeoResourceId);

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
												<button @click="${() => handleDeleteClick(catalogEntry)}">X</button>
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
	 * @property {function} removeGeoResource - Callback function
	 */
	set removeGeoResource(callback) {
		this._removeGeoResource = callback;
	}

	get removeGeoResource() {
		return this._removeGeoResource;
	}

	/**
	 * @property {function} afterDrop - Callback function
	 */
	set afterDrop(callback) {
		this._afterDrop = callback;
	}

	get afterDrop() {
		return this._afterDrop;
	}

	static get tag() {
		return 'ba-layer-tree';
	}
}
