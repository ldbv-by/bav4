/**
 * @module modules/admin/components/panel/AdminPanel
 */
// @ts-ignore
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
// @ts-ignore
import css from './adminPanel.css';
import { $injector } from '../../../../injection/index';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';
import { Topic } from '../../../../domain/topic';
// // eslint-disable-next-line no-unused-vars
// import { logOnce, onlyOnce } from '../layerTree/LayerTree';

const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Topics = 'update_topics';

const Empty_Label = ' ';
const End_Label = '  ';

let _uniqueIdCounter = 0;
const _generateUniqueId = () => {
	const timestamp = new Date().getTime();
	_uniqueIdCounter++;
	return `${timestamp}-${_uniqueIdCounter}`;
};

/**
 * @class
 */
export class AdminPanel extends MvuElement {
	#catalog = [];
	#geoResources = [];
	#topics = []; // todo remove
	#currentTopicId = null;

	constructor() {
		super({
			dummy: true,
			catalogWithResourceData: null,
			topics: []
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			CatalogService: catalogService,
			GeoResourceService: geoResourceService,
			TopicsService: topicsService
		} = $injector.inject('ConfigService', 'TranslationService', 'CatalogService', 'GeoResourceService', 'TopicsService');

		this._configService = configService;
		this._translationService = translationService;
		this._catalogService = catalogService;
		this._geoResourceService = geoResourceService;
		this._topicsService = topicsService;
	}

	_addUniqueId(catalogFromService) {
		const catalogWithUniqueId = catalogFromService.map((category) => {
			const uid = _generateUniqueId();

			if (category.children) {
				const children = this._addUniqueId(category.children);

				return {
					uid,
					...category,
					children
				};
			} else {
				return { uid, ...category };
			}
		});

		return catalogWithUniqueId;
	}

	_enrichWithGeoResource(obj, extractFunction, geoResources) {
		const result = { uid: obj.uid };

		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;

			const geoResource = geoResources.find((georesource) => georesource.id === obj.geoResourceId);

			if (geoResource) {
				result.label = geoResource.label;
			} else {
				result.label = ' ';
			}
		}
		if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			if (obj.showChildren) {
				result.showChildren = obj.showChildren;
			}
			result.children = obj.children.map((child) => extractFunction(child, extractFunction, geoResources));
		}
		return result;
	}

	// extract 'original data' recursively from the input object
	_extractOriginal(obj, extractFunction) {
		const result = {};
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		} else if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			result.children = obj.children.map((child) => extractFunction(child, extractFunction));
		}
		return result;
	}

	// extract 'original data' recursively from the input object, but keep showChildren
	_extractOriginalIncShowChildren(obj, extractFunction) {
		const result = {};
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		}
		if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			if (obj.showChildren) {
				result.showChildren = obj.showChildren;
			}
			result.children = obj.children.map((child) => extractFunction(child, extractFunction));
		}
		return result;
	}

	_copyEverything(obj, extractFunction) {
		console.log('🚀 ~ AdminPanel ~ _copyEverything ~ obj:', obj);
		const result = { uid: obj.uid };
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		}
		if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			if (obj.showChildren) {
				result.showChildren = obj.showChildren;
			}
			result.children = obj.children.map((child) => extractFunction(child, extractFunction));
		}
		console.log('🚀 ~ AdminPanel ~ _copyEverything ~ result:', result);
		return result;
	}

	_copyBranch(obj, extractFunction) {
		const result = { uid: _generateUniqueId() };
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		}
		if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			if (obj.showChildren) {
				result.showChildren = obj.showChildren;
			}
			result.children = obj.children.map((child) => extractFunction(child, extractFunction));
		}
		return result;
	}

	/**
	 * reduce / enrich the JSON data to the desired format
	 *
	 * @param {*} obj
	 * @param {*} extractFunction
	 * @param {*} geoResources
	 * @return {*}
	 * @memberof AdminPanel
	 */
	_reduceData(obj, extractFunction, geoResources) {
		return obj.map((item) => {
			return extractFunction(item, extractFunction, geoResources);
		});
	}

	_mergeCatalogWithResources() {
		if (this.#geoResources.length === 0 || this.#catalog.length === 0) {
			return null;
		}

		const catalogWithResourceData = this._reduceData(this.#catalog, this._enrichWithGeoResource, this.#geoResources);
		this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
	}

	async _updateCatalog(currentTopicId) {
		// todo remove
		if (currentTopicId === 'newEntry') {
			this.#currentTopicId = currentTopicId;
			this.#catalog = [{ uid: '123123123', label: ' ' }];
			const existingTopic = this.#topics.find((topic) => topic.id === currentTopicId);
			if (!existingTopic) {
				const topic = new Topic(currentTopicId, currentTopicId, currentTopicId);
				this.#topics.unshift(topic);
			}

			this.signal(Update_CatalogWithResourceData, this.#catalog);
		} else {
			try {
				const catalogFromService = await this._catalogService.byId(currentTopicId);
				this.#catalog = this._addUniqueId(catalogFromService);
				this._mergeCatalogWithResources();
			} catch (error) {
				console.warn(error.message);
			}
		}
	}

	async onInitialize() {
		await this._geoResourceService.init();
		await this._topicsService.init();

		try {
			this.#topics = await this._topicsService.all();
		} catch (error) {
			console.warn(error.message);
		}

		try {
			this.#geoResources = await this._geoResourceService.all();
		} catch (error) {
			console.warn(error.message);
		}

		if (!this.#currentTopicId) {
			this.#currentTopicId = this._configService.getValue('DEFAULT_TOPIC_ID', 'ba');
			this._updateCatalog(this.#currentTopicId);
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: [...data], dummy: !model.dummy };
			case Update_Topics:
				return { ...model, topics: [...data], dummy: !model.dummy };
		}
	}

	async _refreshLayers() {
		try {
			this.#geoResources = await this._geoResourceService.all();
			this._mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
		}
	}

	createView(model) {
		const { catalogWithResourceData, dummy } = model;
		// console.log('🚀 ~ AdminPanel ~ createView ~ catalogWithResourceData:', catalogWithResourceData);

		const findElementRecursively = (uid, catalogEntry) => {
			for (let n = 0; n < catalogEntry.children.length; n++) {
				const childCatalogEntry = catalogEntry.children[n];

				if (childCatalogEntry.uid === uid) {
					return childCatalogEntry;
				}

				// Check the children if any
				if (childCatalogEntry.children) {
					const element = findElementRecursively(uid, childCatalogEntry);
					if (element) {
						// stop if found
						return element;
					}
				}
			}
			return null;
		};

		const findElement = (uid, catalogWithResourceData) => {
			for (let entryNumber = 0; entryNumber < catalogWithResourceData.length; entryNumber++) {
				const catalogEntry = catalogWithResourceData[entryNumber];

				if (catalogEntry.uid === uid) {
					// found the uid in the top-level entries
					return catalogEntry;
				}

				// Check the children if any
				if (catalogEntry.children) {
					const element = findElementRecursively(uid, catalogEntry);
					if (element) {
						// found the uid in children --> return entry
						return element;
					}
				}
			}
		};

		const moveElement = (currentCatalogEntryUid, uidFromDrag_elementToMove) => {
			const elementToMove = findElement(uidFromDrag_elementToMove, catalogWithResourceData);
			if (!elementToMove) {
				return;
			}

			const updatedCatalogWithResourceData = removeEntryRecursively(uidFromDrag_elementToMove, [...catalogWithResourceData]);

			addEntry(updatedCatalogWithResourceData, currentCatalogEntryUid, elementToMove);

			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const createNewGeoResourceEntry = (newGeoresourceId) => {
			const geoResource = this.#geoResources.find((georesource) => georesource.id === newGeoresourceId);
			const newUid = _generateUniqueId();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: geoResource.label };
			return { newEntry, newUid };
		};

		const addEntryToChildrenRecursively = (catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			for (let n = 0; n < catalogEntry.length; n++) {
				const catalogEntryN = catalogEntry[n];

				if (catalogEntryN.uid === currentCatalogEntryUid) {
					catalogEntry.splice(n, 0, newEntry);
					removePossibleEmptyEntry(catalogEntry);
					return true;
				}

				// check the children recursivly, if any
				if (catalogEntryN.children) {
					const found = addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogEntryN.children, newEntry);
					if (found) {
						return found;
					}
				}
			}
			return false;
		};

		const removePossibleEmptyEntry = (children) => {
			console.log('🚀 ~ AdminPanel ~ removePossibleEmptyEntry');
			for (let entryNumber = 0; entryNumber < children.length; entryNumber++) {
				const catalogEntry = children[entryNumber];
				// look for empty label
				if (catalogEntry.label === Empty_Label) {
					children = children.splice(entryNumber, 1);
					return;
				}
			}
		};

		const addEntry = (catalogWithResourceData, currentCatalogEntryUid, newEntry) => {
			addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogWithResourceData, newEntry);
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			// find georesource to add
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);
			// console.log('🚀 ~ AdminPanel ~ addGeoResource ~ newEntry:', newEntry);

			addEntry(catalogWithResourceDataFromTree, currentCatalogEntryUid, newEntry);
			this.signal(Update_CatalogWithResourceData, catalogWithResourceDataFromTree);

			return newUid;
		};

		const removeEntryRecursively = (uid, catalogBranch) => {
			const indexToRemove = catalogBranch.findIndex((entry) => entry.uid === uid);

			// found in top level - done
			if (indexToRemove !== -1) {
				catalogBranch.splice(indexToRemove, 1);
				if (catalogBranch.length === 0) {
					catalogBranch.push({ label: Empty_Label });
				}
				return catalogBranch;
			}

			// handle sublevels recursively
			const updatedCatalogBranch = catalogBranch.map((element) => {
				if (element.children) {
					const updatedChildren = removeEntryRecursively(uid, element.children);
					return { ...element, children: updatedChildren };
				}

				return element;
			});
			return updatedCatalogBranch;
		};

		const removeEntry = (uid) => {
			if (!uid) {
				return;
			}

			const updatedCatalogWithResourceData = removeEntryRecursively(uid, [...catalogWithResourceData]);
			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const showChildrenRecursive = (uid, catalogWithResourceData) => {
			if (!uid) {
				return catalogWithResourceData;
			}

			const newCatalogWithResourceData = [...catalogWithResourceData];
			const indexWhereToShowChildren = newCatalogWithResourceData.findIndex((geoResource) => geoResource.uid === uid);

			if (indexWhereToShowChildren !== -1) {
				newCatalogWithResourceData[indexWhereToShowChildren].showChildren = !newCatalogWithResourceData[indexWhereToShowChildren].showChildren;
				return newCatalogWithResourceData;
			}

			// Handle sublevels recursively
			const updatedCatalog = newCatalogWithResourceData.map((element) => {
				if (element.children) {
					const updatedChildren = showChildrenRecursive(uid, element.children);
					return { ...element, children: updatedChildren };
				}

				return element;
			});
			return updatedCatalog;
		};

		const showChildren = (uid) => {
			const updatedCatalogWithResourceData = showChildrenRecursive(uid, [...catalogWithResourceData]);
			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const addGeoResourcePermanently = () => {
			const catalog = this._reduceData(catalogWithResourceData, this._copyEverything);
			this.#catalog = catalog;
		};

		const incrementStringDigit = (str) => {
			// Find the position of the last digit in the string
			const lastDigitIndex = str.search(/\d(?!.*\d)/);

			if (lastDigitIndex === -1) {
				// If no digits found at the end, simply append '1'
				return str + '1';
			}

			// Extract the non-digit part and the digit part of the string
			const nonDigitPart = str.slice(0, lastDigitIndex);
			const digitPart = str.slice(lastDigitIndex);

			// Increment the digit part and pad with zeros if necessary
			const incrementedDigitPart = (parseInt(digitPart) + 1).toString().padStart(digitPart.length, '0');

			// Concatenate the non-digit part and the incremented digit part
			return nonDigitPart + incrementedDigitPart;
		};

		const addLayerGroup = () => {
			const catalog = this._reduceData(catalogWithResourceData, this._extractOriginalIncShowChildren);

			catalog.push({ label: ' ', children: [{ label: Empty_Label }] });

			this.#catalog = this._addUniqueId(catalog);
			this._mergeCatalogWithResources();
		};

		const updateTopic = (topicId) => {
			this.#currentTopicId = topicId;
			this._updateCatalog(this.#currentTopicId);
		};

		const deleteTopicLevelTree = (topic) => {
			this.#topics = this.#topics.filter((oneTopic) => oneTopic._id !== topic._id);
			this.signal(Update_Topics, this.#topics);
		};

		const toggleTopicLevelTreeDisabled = (topic) => {
			// console.log('🚀 ~ AdminPanel ~ toggleTopicLevelTreeDisabled ~ topic:', topic);
			// console.log('🚀 ~ AdminPanel ~ toggleTopicLevelTreeDisabled ~ topic._id:', topic._id);

			const foundTopic = this.#topics.find((oneTopic) => oneTopic._id === topic._id);

			if (foundTopic) {
				// console.log('🚀 ~ AdminPanel ~ toggleTopicLevelTreeDisabled ~ foundTopic:', foundTopic);
				foundTopic._disabled = !foundTopic._disabled;

				this.signal(Update_Topics, this.#topics);
			}
		};

		const copyBranch = (catalogWithResourceData, catalogEntry) => {
			const newBranch = this._reduceData(catalogEntry.children, this._copyBranch);
			this.signal(Update_CatalogWithResourceData, [
				...catalogWithResourceData,
				{ uid: _generateUniqueId(), label: incrementStringDigit(catalogEntry.label), children: newBranch }
			]);
		};

		// todo
		const saveCatalog = async () => {
			const catalogToSave = this._reduceData(catalogWithResourceData, this._extractOriginal);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ saveCatalog ~ catalogToSave:', catalogToSave);

			const xxx = await this._catalogService.save(catalogToSave);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: AdminPanel.js:458 ~ AdminPanel ~ saveCatalog ~ xxx:', xxx);
		};

		// todo recursive
		const removePossibleEndEntry = (children) => {
			console.log('🚀 ~ AdminPanel ~ removePossibleEndEntry ~ children:', children);
			for (let entryNumber = 0; entryNumber < children.length; entryNumber++) {
				const catalogEntry = children[entryNumber];
				// look for empty label
				if (catalogEntry.label === End_Label) {
					console.log('🚀 ~ AdminPanel ~ removePossibleEndEntry ~ catalogEntry:', catalogEntry);
					children.splice(entryNumber, 1);
					console.log('🚀 ~ AdminPanel ~ removePossibleEndEntry ~ children:', children);
					return children;
				}
			}
		};

		const resetCatalog = async () => {
			const catalogWithResourceData = this._reduceData(this.#catalog, this._enrichWithGeoResource, this.#geoResources);
			refreshCatalog(catalogWithResourceData);
		};

		const refreshCatalog = async (newCatalogWithResourceData) => {
			console.log('🚀 ~ AdminPanel ~ refreshCatalog ~ newCatalogWithResourceData:', newCatalogWithResourceData);
			// newCatalogWithResourceData.forEach((entry) => {
			// 	// console.log('🚀 ~ AdminPanel ~ newCatalogWithResourceData.forEach ~ entry:', entry);
			// 	const correspondingEntry = catalogWithResourceData.find((e) => e.uid === entry.uid);

			// 	// if (!correspondingEntry) {
			// 	// 	entry.label += ' - new';
			// 	// }
			// 	// if (correspondingEntry.label !== entry.label) {
			// 	// 	entry.label += ' - different';
			// 	// }
			// });

			const catalog = removePossibleEndEntry(this._reduceData(newCatalogWithResourceData, this._copyEverything));
			console.log('🚀 ~ AdminPanel ~ refreshCatalog ~ catalog:', catalog);
			this.#catalog = catalog;

			this.signal(Update_CatalogWithResourceData, catalog);
		};

		if (this.#currentTopicId) {
			return html`
				<style>
					${css}
				</style>

				<h1 id="admin-app-title">Admin App</h1>

				<div class="container">
					<div>
						<ba-layer-tree
							.topics="${this.#topics}"
							.selectedTopic="${this.#currentTopicId}"
							.updateTopic="${updateTopic}"
							.catalogWithResourceData="${catalogWithResourceData}"
							.addGeoResource="${addGeoResource}"
							.moveElement="${moveElement}"
							.removeEntry="${removeEntry}"
							.showChildren="${showChildren}"
							.addGeoResourcePermanently="${addGeoResourcePermanently}"
							.resetCatalog="${resetCatalog}"
							.refreshCatalog="${refreshCatalog}"
							.addLayerGroup="${addLayerGroup}"
							.copyBranch="${copyBranch}"
							.saveCatalog="${saveCatalog}"
							.deleteTopicLevelTree="${deleteTopicLevelTree}"
							.disableTopicLevelTree="${toggleTopicLevelTreeDisabled}"
							.dummy="${dummy}"
						></ba-layer-tree>
					</div>

					<div>
						<ba-layer-list .geoResources=${this.#geoResources} .refreshLayers="${this._refreshLayers}"></ba-layer-list>
					</div>
				</div>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-adminpanel';
	}
}
