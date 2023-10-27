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
// eslint-disable-next-line no-unused-vars
import { logOnce, onlyOnce } from '../layerTree/LayerTree';

const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Empty_Label = ' ';

/**
 * Contains a form for submitting a general feedback.
 * @property {Function} onSubmit
 * @class
 */
export class AdminPanel extends MvuElement {
	#uniqueIdCounter = 0;
	#catalog = [];
	#geoResources = [];
	#topics = [];
	#currentTopicId = null;
	// #elementToMove = null;

	constructor() {
		super({
			dummy: true,
			catalogWithResourceData: null
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

	_generateUniqueId() {
		const timestamp = new Date().getTime();
		this.#uniqueIdCounter++;
		return `${timestamp}-${this.#uniqueIdCounter}`;
	}

	_insertFirstNodeWithChildrenIntoSecond(catalogFromService) {
		// todo remove - only here to have themes in themes during testing
		let first = null;
		let second = false;
		const catalogWithSecondLevelChildren = catalogFromService.map((category) => {
			if (category.children) {
				if (!second) {
					if (first) {
						category.children.push(first);
						second = true;
					} else {
						first = category;
					}
				}
				return { ...category };
			} else {
				return { ...category };
			}
		});
		return catalogWithSecondLevelChildren;
	}

	_checkAndAugmentPositioningInfo(catalogFromService, position = 0) {
		const catalogWithPositioningInfo = catalogFromService.map((category) => {
			position += 100000;
			const uid = this._generateUniqueId();

			if (category.children) {
				const children = this._checkAndAugmentPositioningInfo(category.children, position);

				return {
					uid,
					...category,
					children,
					position
				};
			} else {
				return { uid: uid, ...category, position: position };
			}
		});

		return catalogWithPositioningInfo;
	}

	_enrichWithGeoResource(obj, extractFunction, geoResources) {
		const result = { uid: obj.uid, position: obj.position };

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
			// for (let index = 0; index < obj.children.length; index++) {
			// 	const child = obj.children[index];
			// 	console.log('🚀 ~ AdminPanel ~ _enrichWithGeoResource ~ obj.child.label:', child.label);
			// }

			result.children = obj.children.map((child) => extractFunction(child, extractFunction, geoResources));
			// for (let index = 0; index < result.children.length; index++) {
			// 	const child = result.children[index];
			// 	console.log('🚀 ~ AdminPanel ~ _enrichWithGeoResource ~ result.child.label:', child.label);
			// }
		}
		return result;
	}

	// extract 'original data' recursively from the input object
	_extractOriginal(obj, extractFunction) {
		const result = {};
		if (obj.geoResourceId) {
			result.geoResourceId = obj.geoResourceId;
		}
		if (obj.label) {
			result.label = obj.label;
		}
		if (obj.children && obj.children.length > 0) {
			result.children = obj.children.map((child) => extractFunction(child, extractFunction));
		}
		return result;
	}

	// extract 'original data' recursively from the input object
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

	// reduce / enrich the JSON data to the desired format
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

		// const catalogWithResourceData = this._mergeCatalogWithResourcesRecursive(this.#catalog);

		this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
	}

	async _updateCatalog(currentTopicId) {
		try {
			const catalogFromService = await this._catalogService.byId(currentTopicId);
			const catalogFromServiceWithSecondLevel = this._insertFirstNodeWithChildrenIntoSecond(catalogFromService);
			this.#catalog = this._checkAndAugmentPositioningInfo(catalogFromServiceWithSecondLevel);
			this._mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
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
		}
	}

	_sortChildrenByPositionRecursive = (entry) => {
		if (entry.children) {
			entry.children.sort((a, b) => a.position - b.position);
			entry.children.forEach((child) => this._sortChildrenByPositionRecursive(child)); // Recursively sort children's children
		}
	};

	_sortCatalog(data) {
		if (data && data.length > 0) {
			data.sort((a, b) => a.position - b.position);
			data.forEach((item) => this._sortChildrenByPositionRecursive(item));
		}
	}

	async _refreshLayers() {
		// eslint-disable-next-line no-console
		console.log('🚀 ~ AdminPanel ~ _refreshLayers()');

		try {
			this.#geoResources = await this._geoResourceService.all();
			this._mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
		}
	}

	createView(model) {
		const { catalogWithResourceData, dummy } = model;

		const calcPosition = (index, arrayWithEntry) => {
			if (index > 0) {
				const priorCatalogEntry = arrayWithEntry[index - 1];
				const newPosition = Math.round((arrayWithEntry[index].position + priorCatalogEntry.position) / 2);
				return newPosition;
			} else {
				const newPosition = Math.round(arrayWithEntry[index].position / 2);
				return newPosition;
			}
		};

		const findElementRecursively = (uid, catalogEntry) => {
			// itterate over catalogEntry.children
			for (let n = 0; n < catalogEntry.children.length; n++) {
				// and look for currentUid
				const childCatalogEntry = catalogEntry.children[n];

				if (childCatalogEntry.uid === uid) {
					// found the uid in one of the children
					// // eslint-disable-next-line no-console
					// console.log('found the uid in one of the children');
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
			// itterate over catalogWithResourceData
			for (let entryNumber = 0; entryNumber < catalogWithResourceData.length; entryNumber++) {
				const catalogEntry = catalogWithResourceData[entryNumber];

				// and look for uid
				if (catalogEntry.uid === uid) {
					// found the uid in the top-level entries
					// // eslint-disable-next-line no-console
					// console.log('found the uid in the top-level entries --> return entry');
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
			// if (
			// 	logOnce(
			// 		'🚀 ~ AdminPanel ~ createView ~ moveElement ~ currentCatalogEntryUid: ' + currentCatalogEntryUid + currentCatalogEntryUid,
			// 		'🚀 ~ AdminPanel ~ createView ~ moveElement ~ currentCatalogEntryUid: ' + currentCatalogEntryUid
			// 	)
			// ) {
			// 	// eslint-disable-next-line no-console
			// 	console.log('      (for dragged element ~ uidFromDrag_elementToMove: ', uidFromDrag_elementToMove, ')');
			// }

			const elementToMove = findElement(uidFromDrag_elementToMove, catalogWithResourceData);
			// // eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ moveElement ~ elementToMove:', elementToMove);
			if (!elementToMove) {
				// // eslint-disable-next-line no-console
				// console.log('elementToMove not found --> return');
				return;
			}

			// // eslint-disable-next-line no-console
			// console.log('removeEntryRecursively');
			const updatedCatalogWithResourceData = removeEntryRecursively(uidFromDrag_elementToMove, [...catalogWithResourceData]);

			// // eslint-disable-next-line no-console
			// console.log('addEntry');
			addEntry(updatedCatalogWithResourceData, currentCatalogEntryUid, elementToMove);
			// // eslint-disable-next-line no-console
			// console.log('🚀 AdminPanel ~ moveElement ~ newCatalogWithResourceData:', updatedCatalogWithResourceData);

			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const createNewGeoResourceEntry = (newGeoresourceId) => {
			const geoResource = this.#geoResources.find((georesource) => georesource.id === newGeoresourceId);
			const newUid = this._generateUniqueId();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: geoResource.label };
			return { newEntry, newUid };
		};

		const addEntryToChildrenRecursively = (catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			// 	// eslint-disable-next-line no-console
			// 	console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ catalogWithResourceData:', catalogWithResourceData);
			// 	// eslint-disable-next-line no-console
			// 	console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ currentCatalogEntryUid:', currentCatalogEntryUid);
			// 	// eslint-disable-next-line no-console
			// 	console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ catalogEntry:', catalogEntry);
			// 	// eslint-disable-next-line no-console
			// 	console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ newEntry:', newEntry);
			// itterate over catalogEntry.children
			// // eslint-disable-next-line no-console
			// console.log('addEntryToChildrenRecursively - itterate over catalogEntry.children');
			// // eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ catalogEntry.children:', catalogEntry.children);
			for (let n = 0; n < catalogEntry.children.length; n++) {
				// and look for currentUid
				const childCatalogEntry = catalogEntry.children[n];
				// // eslint-disable-next-line no-console
				// console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ n:', n);
				// // eslint-disable-next-line no-console
				// console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ childCatalogEntry:', childCatalogEntry);

				if (childCatalogEntry.uid === currentCatalogEntryUid) {
					// found the uid in one of the children
					// // eslint-disable-next-line no-console
					// console.log('found the uid in one of the children');
					const inBetween = calcPosition(n, catalogEntry.children);
					// // eslint-disable-next-line no-console
					// console.log('🚀 ~ file: AdminPanel.js:344 ~ AdminPanel ~ addEntryToChildrenRecursively ~ inBetween:', inBetween);

					const newEntryWithPosition = { ...newEntry, position: inBetween };
					catalogEntry.children.push(newEntryWithPosition);

					removePossibleEmptyEntry(catalogEntry.children);

					this._sortCatalog(catalogWithResourceData);
					return true;
				}

				// check the children recursivly, if any
				if (childCatalogEntry.children) {
					// // eslint-disable-next-line no-console
					// console.log('recursivly check children');
					const found = addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, childCatalogEntry, newEntry);
					if (found) {
						return found;
					}
				}
			}
			return false;
		};

		const removePossibleEmptyEntry = (children) => {
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
			// // eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ addEntry ~   🚀 ~ 🚀 ~ insert newEntry:', newEntry);
			// // eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ addEntry ~   🚀 ~ 🚀 ~ before currentCatalogEntryUid:', currentCatalogEntryUid);
			// itterate over catalogWithResourceData
			// // eslint-disable-next-line no-console
			// console.log('addEntry - itterate over catalogWithResourceData');
			for (let entryNumber = 0; entryNumber < catalogWithResourceData.length; entryNumber++) {
				const catalogEntry = catalogWithResourceData[entryNumber];
				// // eslint-disable-next-line no-console
				// console.log('🚀 ~ AdminPanel ~ addEntry ~ entryNumber:', entryNumber, ' - ', catalogEntry.label);

				// and look for currentUid
				if (catalogEntry.uid === currentCatalogEntryUid) {
					// found the uid in the top-level entries
					// // eslint-disable-next-line no-console
					// console.log('found the uid in the top-level entries');
					const inBetween = calcPosition(entryNumber, catalogWithResourceData);

					const newEntryWithPosition = { ...newEntry, position: inBetween };
					catalogWithResourceData.push(newEntryWithPosition);

					// catalogWithResourceData = [...catalogWithResourceData, { ...newEntry, position: inBetween }];
					this._sortCatalog(catalogWithResourceData);
					return;
				}

				// check the children if any
				if (catalogEntry.children) {
					// // eslint-disable-next-line no-console
					// console.log('check children');
					// // eslint-disable-next-line no-console
					// console.log('🚀 ~ AdminPanel ~ addEntry ~ catalogEntry:', catalogEntry);
					const found = addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry);
					if (found) {
						return;
					}
				}
			}
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			// find georesource to add
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);

			addEntry(catalogWithResourceDataFromTree, currentCatalogEntryUid, newEntry);
			this._sortCatalog(catalogWithResourceDataFromTree);

			this.signal(Update_CatalogWithResourceData, catalogWithResourceDataFromTree);

			return newUid;
		};

		const removeEntryRecursively = (uid, catalogBranch) => {
			const newCatalogBranch = [...catalogBranch];
			const indexToRemove = newCatalogBranch.findIndex((entry) => entry.uid === uid);

			// found in top level - done
			if (indexToRemove !== -1) {
				newCatalogBranch.splice(indexToRemove, 1);
				if (newCatalogBranch.length === 0) {
					newCatalogBranch.push({ label: Empty_Label });
				}
				return newCatalogBranch;
			}

			// handle sublevels recursively
			const updatedCatalogBranch = newCatalogBranch.map((element) => {
				if (element.children) {
					// recurse
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
			const catalogWithPositioningInfo = catalogWithResourceData.map((category) => {
				if (category.children) {
					const updatedChildren = category.children.map((child) => {
						return { uid: child.uid, geoResourceId: child.geoResourceId, position: child.position };
					});

					return { uid: category.uid, position: category.position, label: category.label, children: updatedChildren };
				} else {
					return { uid: category.uid, position: category.position, geoResourceId: category.geoResourceId };
				}
			});

			this.#catalog = catalogWithPositioningInfo;
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

			catalog.push({ label: 'XXXXX', children: [{ label: Empty_Label }] });

			this.#catalog = this._checkAndAugmentPositioningInfo(catalog);
			this._mergeCatalogWithResources();
		};

		const updateTopic = (topicId) => {
			this.#currentTopicId = topicId;
			this._updateCatalog(this.#currentTopicId);
		};

		// todo parent
		// @ts-ignore
		const copyBranchRoot = (positionInCatalog, catalogWithResourceData, catalogEntry) => {
			// , parent = null
			// todo remove old calculation
			let inBetweenOld = 0;
			if (positionInCatalog > 0) {
				const priorCatalogEntry = catalogWithResourceData[positionInCatalog - 1];
				inBetweenOld = Math.round((catalogEntry.position + priorCatalogEntry.position) / 2);
			} else {
				inBetweenOld = Math.round(catalogEntry.position / 2);
			}
			const inBetween = calcPosition(positionInCatalog, catalogWithResourceData);

			if (inBetweenOld !== inBetween) {
				throw new Error(`inBetween wrong`);
			}

			this.signal(Update_CatalogWithResourceData, [
				...catalogWithResourceData,
				{ uid: this._generateUniqueId(), label: incrementStringDigit(catalogEntry.label), children: [], position: inBetween }
			]);
		};

		if (this.#currentTopicId) {
			return html`
				<style>
					${css}
				</style>

				<h1>Admin App</h1>

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
							.addLayerGroup="${addLayerGroup}"
							.copyBranchRoot="${copyBranchRoot}"
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
