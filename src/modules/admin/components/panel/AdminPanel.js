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

const Update_Selected_Topic_Id = 'update_selected_topic_id';
// const Update_Selected_Topic = 'update_selected_topic';
const Update_Topics = 'update_topics';
const Update_Catalog = 'update_catalog';
const Update_GeoResources = 'update_georesources';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_All = 'update_all';

/**
 * @class
 */
export class AdminPanel extends MvuElement {
	constructor() {
		super({
			dummy: true,
			selectedTopicId: null,
			selectedTopic: null,
			topics: [],
			catalog: [],
			geoResources: [],
			catalogWithResourceData: []
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

	_enrichWithGeoResource = (catalog, geoResources) => {
		const result = { uid: catalog.uid };

		if (catalog.geoResourceId) {
			result.geoResourceId = catalog.geoResourceId;

			const geoResource = geoResources.find((georesource) => georesource.id === catalog.geoResourceId);

			if (geoResource) {
				result.label = geoResource.label;
			} else {
				result.label = ' ';
			}
		}
		if (catalog.label) {
			result.label = catalog.label;
		}
		if (catalog.children && catalog.children.length > 0) {
			if (catalog.showChildren) {
				result.showChildren = catalog.showChildren;
			}
			result.children = catalog.children.map((child) => this._enrichWithGeoResource(child, geoResources));
		}
		return result;
	};

	_extractOriginal = (obj) => {
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
	};

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

	_mergeCatalogWithResources(catalog, geoResources) {
		return this._reduceData(catalog, this._enrichWithGeoResource, geoResources);
	}

	async _loadTopics() {
		await this._topicsService.init();

		try {
			return await this._topicsService.all();
		} catch (error) {
			console.warn(error.message);
		}
	}

	async _loadCatalog(topicId) {
		if (!topicId) {
			return;
		}
		try {
			const catalogFromService = await this._catalogService.byId(topicId);
			const catalog = this._addUniqueIds(catalogFromService);
			return catalog;
		} catch (error) {
			console.warn(error.message);
		}
	}

	async _loadGeoResources() {
		try {
			const geoResourcesFromService = await this._geoResourceService.init();
			return geoResourcesFromService;
		} catch (error) {
			console.warn(error.message);
		}
	}

	_updateCatalogWithResourceData(catalog, geoResources) {
		if (!catalog || catalog.length === 0 || !geoResources || geoResources.length === 0) {
			return [];
		}
		try {
			const catalogWithResourceData = this._mergeCatalogWithResources(catalog, geoResources);
			if (catalogWithResourceData) {
				return catalogWithResourceData;
			}
			return [];
		} catch (error) {
			console.warn(error.message);
		}
	}

	getTopic(topics, topicId) {
		if (topicId && topics && topics.length > 0) {
			const topic = topics.find((topic) => topic.id === topicId);
			if (topic) {
				return topic;
			}
		}
		return null;
	}

	async onInitialize() {
		const selectedTopicId = this._configService.getValue('DEFAULT_TOPIC_ID', 'ba');

		const topics = await this._loadTopics();
		const catalog = await this._loadCatalog(selectedTopicId);
		const geoResources = await this._loadGeoResources();
		const catalogWithResourceData = this._updateCatalogWithResourceData(catalog, geoResources);

		const selectedTopic = this.getTopic(topics, selectedTopicId);

		this.signal(Update_All, {
			selectedTopicId,
			selectedTopic,
			topics,
			catalog,
			geoResources,
			catalogWithResourceData
		});
	}

	update(type, data, model) {
		const selectedTopicId = model.selectedTopicId;
		const topics = model.topics;
		switch (type) {
			case Update_Selected_Topic_Id:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_Selected_Topic_Id ~ data:', data);

				if (topics && topics.length > 0) {
					const selectedTopic = this.getTopic(data, topics);

					return { ...model, selectedTopicId: data, selectedTopic };
				}
				return { ...model, selectedTopicId, selectedTopic: null };

			case Update_Topics:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_Topics ~ data:', data);

				if (selectedTopicId) {
					const selectedTopic = this.getTopic(selectedTopicId, data);

					if (selectedTopic) {
						return { ...model, topics: data, selectedTopicId, selectedTopic };
					}
				}
				return { ...model, topics: data, selectedTopicId: data[0].id, selectedTopic: data[0] };

			case Update_Catalog:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_Catalog ~ data:', data);
				return { ...model, catalog: [...data], catalogWithResourceData: [], dummy: !model.dummy };
			case Update_GeoResources:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_Catalog ~ data:', data);
				return { ...model, geoResources: [...data], catalogWithResourceData: [], dummy: !model.dummy };
			case Update_CatalogWithResourceData:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_CatalogWithResourceData ~ data:', data);
				return { ...model, catalogWithResourceData: [...data], dummy: !model.dummy };
			case Update_All:
				// eslint-disable-next-line no-console
				console.log('🚀 ~ AdminPanel ~ update ~ Update_All ~ data:', data);
				return {
					...model,
					selectedTopicId: data.selectedTopicId,
					selectedTopic: data.selectedTopic,
					topics: [...data.topics],
					catalog: { ...data.catalog },
					geoResources: [...data.geoResources],
					catalogWithResourceData: [...data.catalogWithResourceData],
					dummy: !model.dummy
				};
		}
	}

	createView(model) {
		const { selectedTopicId, selectedTopic, topics, geoResources, catalogWithResourceData, dummy } = model;

		// if (!topics || topics.length === 0) {
		// 	this._loadTopics();
		// 	return html`<div>Loading Topics...</div>`;
		// }

		// if (!catalog || catalog.length === 0) {
		// 	this._loadCatalog(selectedTopicId);
		// 	return html`<div>Loading Catalog...</div>`;
		// }

		// if (!geoResources || geoResources.length === 0) {
		// 	this._loadGeoResources();
		// 	return html`<div>Loading GeoResources...</div>`;
		// }

		// if (!catalogWithResourceData || catalogWithResourceData.length === 0) {
		// 	this._updateCatalogWithResourceData();
		// 	// return html`<div>Updating Catalog with GeoResources ...</div>`;
		// }

		const _refreshLayers = async () => {
			await this._loadGeoResources();
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
			const geoResource = this.getModel().geoResources.find((georesource) => georesource.id === newGeoresourceId);
			const newUid = self.crypto.randomUUID();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: geoResource.label };
			return { newEntry, newUid };
		};

		const addEntryToChildrenRecursively = (catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			for (let n = 0; n < catalogEntry.length; n++) {
				const catalogEntryN = catalogEntry[n];

				if (catalogEntryN.uid === currentCatalogEntryUid) {
					catalogEntry.splice(n, 0, newEntry);
					return true;
				}

				if (catalogEntryN.children) {
					const found = addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogEntryN.children, newEntry);
					if (found) {
						return found;
					}
				}
			}
			return false;
		};

		const addEntry = (catalogWithResourceData, currentCatalogEntryUid, newEntry) => {
			addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogWithResourceData, newEntry);
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);
			addEntry(catalogWithResourceDataFromTree, currentCatalogEntryUid, newEntry);
			this.signal(Update_CatalogWithResourceData, catalogWithResourceDataFromTree);
			return newUid;
		};

		const removeEntryRecursively = (uid, catalogBranch) => {
			const indexToRemove = catalogBranch.findIndex((entry) => entry.uid === uid);

			if (indexToRemove !== -1) {
				catalogBranch.splice(indexToRemove, 1);
				if (catalogBranch.length === 0) {
					catalogBranch.push({ label: End_Label });
				}
				return catalogBranch;
			}

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
			this.signal(Update_Catalog, catalog);
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
			catalogWithResourceData.push({ uid: self.crypto.randomUUID(), label: ' ', children: [{ label: End_Label }] });
			this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
		};

		const updateSelectedTopic = (topicId) => {
			this.signal(Update_Selected_Topic_Id, topicId);
		};

		// todo
		const deleteTopicLevelTree = (topic) => {
			const newTopics = topics.filter((aTopic) => aTopic.id !== topic.id);

			if (selectedTopicId !== topic.id) {
				return;
			}
			this.signal(Update_Selected_Topic_Id, newTopics[0].id);

			// eslint-disable-next-line promise/prefer-await-to-then
			this._topicsService.delete(topic.id).then(
				() => {
					this.signal(Update_Topics, newTopics);
				},
				(error) => {
					console.error('🚀 ~ AdminPanel ~ deleteTopicLevelTree ~ error:', error);
				}
			);
		};

		const toggleTopicLevelTreeDisabled = (topic) => {
			const foundTopic = topics.find((oneTopic) => oneTopic.id === topic.id);

			if (foundTopic) {
				foundTopic._disabled = !foundTopic._disabled;

				// todo hä??
				this.signal(Update_Topics, topics);
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
			const catalog = this._reduceData(catalogWithResourceData, this._enrichWithGeoResource);
			refreshCatalog(catalog);
		};

		const refreshCatalog = async (newCatalogWithResourceData) => {
			const catalog = this._reduceData(newCatalogWithResourceData, this._copyEverything);

			this.signal(Update_CatalogWithResourceData, catalog);
		};

		if (selectedTopic && catalogWithResourceData) {
			return html`
				<style>
					${css}
				</style>

				<h1 id="admin-app-title">Admin App</h1>

				<div class="container">
					<div>
						<ba-layer-tree
							.selectedTopic="${selectedTopic}"
							.topics="${topics}"
							.updateSelectedTopic="${updateSelectedTopic}"
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
							.geoResources=${geoResources}
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
