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
import { End_Label } from '../layerTree/LayerTree';
// eslint-disable-next-line no-unused-vars
// import { logOnce, onlyOnce } from '../layerTree/LayerTree';

const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_Topics = 'update_topics';

/**
 * @class
 */
export class AdminPanel extends MvuElement {
	#catalog = [];
	#geoResources = [];
	#topics = []; // todo remove ???
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

	_addUniqueIds(catalogFromService) {
		const catalogWithUniqueId = catalogFromService.map((category) => {
			const uid = self.crypto.randomUUID();

			if (category.children) {
				const children = this._addUniqueIds(category.children);

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

	_enrichWithGeoResource = (obj, geoResources) => {
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
			result.children = obj.children.map((child) => this._enrichWithGeoResource(child, geoResources));
		}
		return result;
	};

	_extractOriginal(obj) {
		const result = {};
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		} else if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			result.children = obj.children.map((child) => this._extractOriginal(child));
		}
		return result;
	}

	_extractOriginalIncShowChildren = (obj) => {
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
			result.children = obj.children.map((child) => this._extractOriginalIncShowChildren(child));
		}
		return result;
	};

	_copyEverything = (obj) => {
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
			result.children = obj.children.map((child) => this._copyEverything(child));
		}
		return result;
	};

	_copyBranch(obj) {
		const result = { uid: self.crypto.randomUUID() };
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
			result.children = obj.children.map((child) => this._copyBranch(child));
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
			return extractFunction(item, geoResources);
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
		try {
			const catalogFromService = await this._catalogService.byId(currentTopicId);
			this.#catalog = this._addUniqueIds(catalogFromService);
			this._mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
		}
	}

	async loadGeoResources() {
		try {
			this.#geoResources = await this._geoResourceService.init();
		} catch (error) {
			console.warn(error.message);
		}
	}

	async onInitialize() {
		await this._topicsService.init();

		try {
			this.#topics = await this._topicsService.all();
		} catch (error) {
			console.warn(error.message);
		}

		await this.loadGeoResources();

		if (!this.#currentTopicId) {
			this.#currentTopicId = this._configService.getValue('DEFAULT_TOPIC_ID', 'ba');
			this._updateCatalog(this.#currentTopicId);
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_CatalogWithResourceData:
				// console.log('🚀🚀🚀🚀🚀🚀🚀 ~ AdminPanel ~ update Update_CatalogWithResourceData ~ data:', data);
				return { ...model, catalogWithResourceData: [...data], dummy: !model.dummy };
			case Update_Topics:
				return { ...model, topics: [...data], dummy: !model.dummy };
		}
	}

	createView(model) {
		const { catalogWithResourceData, dummy } = model;
		// console.log('🚀 ~ AdminPanel ~ createView ~ catalogWithResourceData:', catalogWithResourceData);

		const _refreshLayers = async () => {
			await this.loadGeoResources();
		};

		const findElementByUid = (uid, catalogEntry) => {
			for (let entryNumber = 0; entryNumber < catalogEntry.length; entryNumber++) {
				const childCatalogEntry = catalogEntry[entryNumber];

				if (childCatalogEntry.uid === uid) {
					return childCatalogEntry;
				}

				if (childCatalogEntry.children) {
					const element = findElementByUid(uid, childCatalogEntry.children);
					if (element) {
						return element;
					}
				}
			}
			return null;
		};

		const moveElement = (currentCatalogEntryUid, uidFromDrag_elementToMove) => {
			const elementToMove = findElementByUid(uidFromDrag_elementToMove, catalogWithResourceData);
			if (!elementToMove) {
				return;
			}

			const updatedCatalogWithResourceData = removeEntryRecursively(uidFromDrag_elementToMove, [...catalogWithResourceData]);

			addEntry(updatedCatalogWithResourceData, currentCatalogEntryUid, elementToMove);

			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const addEndLabels = () => {
			// console.trace('🚀 ~ AdminPanel ~ addEndLabels ');

			const newCatalogWithResourceData = JSON.parse(JSON.stringify(catalogWithResourceData));

			newCatalogWithResourceData.push({ uid: self.crypto.randomUUID(), label: End_Label });
			newCatalogWithResourceData.forEach((element) => {
				if (element.children) {
					// check if there is already an entry with label End_Label
					const found = element.children.find((child) => child.label === End_Label);
					if (found) {
						return;
					}

					element.children.push({ uid: self.crypto.randomUUID(), label: End_Label });
				}
			});

			this.signal(Update_CatalogWithResourceData, newCatalogWithResourceData);
		};

		const removeEndLabels = () => {
			// console.log('🚀 ~ AdminPanel ~ removeEndLabels ');
			// currentCatalogEntryUid, uidFromDrag_elementToMove

			// Remove entries with label End_Label
			const newCatalogWithResourceData = catalogWithResourceData.filter((element) => element.label !== End_Label);
			newCatalogWithResourceData.forEach((element) => {
				if (element.children) {
					element.children = element.children.filter((child) => child.label !== End_Label);
				}
			});

			this.signal(Update_CatalogWithResourceData, newCatalogWithResourceData);
		};

		const createNewGeoResourceEntry = (newGeoresourceId) => {
			const geoResource = this.#geoResources.find((georesource) => georesource.id === newGeoresourceId);
			const newUid = self.crypto.randomUUID();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: geoResource.label };
			return { newEntry, newUid };
		};

		const addEntryToChildrenRecursively = (catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			// console.group('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ');

			for (let n = 0; n < catalogEntry.length; n++) {
				const catalogEntryN = catalogEntry[n];
				// console.log(
				// 	'%c 🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ catalogEntryN:',
				// 	'color: red; background-color: lightblue; border: solid',
				// 	catalogEntryN
				// );
				// console.table(catalogEntryN);

				if (catalogEntryN.uid === currentCatalogEntryUid) {
					catalogEntry.splice(n, 0, newEntry);
					// removePossibleEmptyEntry(catalogEntry);
					// console.groupEnd();
					return true;
				}

				// check the children recursively, if any
				if (catalogEntryN.children) {
					const found = addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogEntryN.children, newEntry);
					if (found) {
						// console.groupEnd();
						return found;
					}
				}
			}
			// console.groupEnd();
			return false;
		};

		const addEntry = (catalogWithResourceData, currentCatalogEntryUid, newEntry) => {
			// console.groupCollapsed('addEntry');

			// console.log('🚀 ~ AdminPanel ~ addEntry ~ currentCatalogEntryUid:', currentCatalogEntryUid);
			// console.log('🚀 ~ AdminPanel ~ addEntry ~ newEntry:', newEntry);
			addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogWithResourceData, newEntry);
			// console.groupEnd();
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			// find georesource to add
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);
			// console.log('🚀 ~ AdminPanel ~ addGeoResource ~ newEntry:', newEntry);

			addEntry(catalogWithResourceDataFromTree, currentCatalogEntryUid, newEntry);
			this.signal(Update_CatalogWithResourceData, catalogWithResourceDataFromTree);

			return newUid;
		};

		// todo: check

		const removeEntryRecursively = (uid, catalogBranch) => {
			const indexToRemove = catalogBranch.findIndex((entry) => entry.uid === uid);

			// found in top level - done
			if (indexToRemove !== -1) {
				catalogBranch.splice(indexToRemove, 1);
				if (catalogBranch.length === 0) {
					catalogBranch.push({ label: End_Label });
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
			const updatedCatalogWithResourceData = removeEntryRecursively(uid, [...catalogWithResourceData]);
			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const toggleShowChildrenRecursive = (uid, catalogWithResourceData) => {
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
					const updatedChildren = toggleShowChildrenRecursive(uid, element.children);
					return { ...element, children: updatedChildren };
				}

				return element;
			});
			return updatedCatalog;
		};

		const toggleShowChildren = (uid) => {
			const updatedCatalogWithResourceData = toggleShowChildrenRecursive(uid, [...catalogWithResourceData]);
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

		// todo: check

		const addLayerGroup = () => {
			catalogWithResourceData.push({ uid: self.crypto.randomUUID(), label: ' ', children: [{ label: End_Label }] });
			this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
		};

		const updateTopic = (topicId) => {
			this.#currentTopicId = topicId;
			this._updateCatalog(this.#currentTopicId);
		};

		const deleteTopicLevelTree = (topic) => {
			// console.log('🚀 ~ AdminPanel ~ deleteTopicLevelTree ~ topic._id:', topic._id);
			// eslint-disable-next-line promise/prefer-await-to-then
			this._topicsService.delete(topic._id).then(
				() => {
					this.signal(Update_Topics, this.#topics);
				},
				(error) => {
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ deleteTopicLevelTree ~ error:', error);
				}
			);

			// this.#topics = this.#topics.filter((oneTopic) => oneTopic._id !== topic._id);
			// this.signal(Update_Topics, this.#topics);
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
				{ uid: self.crypto.randomUUID(), label: incrementStringDigit(catalogEntry.label), children: newBranch }
			]);
		};

		const saveCatalog = async () => {
			const catalogToSave = this._reduceData(catalogWithResourceData, this._extractOriginal);

			await this._catalogService.save(catalogToSave);
		};

		const resetCatalog = async () => {
			// console.log('🚀 ~ AdminPanel ~ resetCatalog');
			const catalogWithResourceData = this._reduceData(this.#catalog, this._enrichWithGeoResource, this.#geoResources);
			refreshCatalog(catalogWithResourceData);
		};

		const refreshCatalog = async (newCatalogWithResourceData) => {
			// console.log('🚀 ~ AdminPanel ~ refreshCatalog ~ newCatalogWithResourceData:', newCatalogWithResourceData);

			// todo hä? wieso?
			const catalog = this._reduceData(newCatalogWithResourceData, this._copyEverything);
			// const catalog = removePossibleEndEntry(this._reduceData(newCatalogWithResourceData, this._copyEverything));
			// console.log('🚀 ~ AdminPanel ~ refreshCatalog ~ catalog:', catalog);
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
							.toggleShowChildren="${toggleShowChildren}"
							.addGeoResourcePermanently="${addGeoResourcePermanently}"
							.resetCatalog="${resetCatalog}"
							.refreshCatalog="${refreshCatalog}"
							.addLayerGroup="${addLayerGroup}"
							.copyBranch="${copyBranch}"
							.saveCatalog="${saveCatalog}"
							.deleteTopicLevelTree="${deleteTopicLevelTree}"
							.disableTopicLevelTree="${toggleTopicLevelTreeDisabled}"
							.removeEndLabels="${removeEndLabels}"
							.addEndLabels="${addEndLabels}"
							.dummy="${dummy}"
						></ba-layer-tree>
					</div>

					<div>
						<ba-layer-list
							.geoResources=${this.#geoResources}
							.refreshLayers="${_refreshLayers}"
							.removeEndLabels="${removeEndLabels}"
							.addEndLabels="${addEndLabels}"
						></ba-layer-list>
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
