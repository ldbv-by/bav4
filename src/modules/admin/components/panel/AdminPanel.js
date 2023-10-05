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
import { setCurrentTopicId as updateStore } from '../../../../store/admin/admin.action';
import { logOnce } from '../layerTree/LayerTree';

const Update_SelectedTopic = 'update_selectedtopic';
const Update_Topics = 'update_topics';
const Update_Catalog = 'update_catalog';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_GeoResources = 'update_geoResources';

/**
 * Contains a form for submitting a general feedback.
 * @property {Function} onSubmit
 * @class
 */
export class AdminPanel extends MvuElement {
	#uniqueIdCounter = 0;

	constructor() {
		super({
			currentTopicId: null,
			topics: [],
			catalog: [],
			geoResources: [],
			dummy: true,
			catalogWithResourceData: null
		});

		const {
			ConfigService: configService,
			TranslationService: translationService,
			FeedbackService: feedbackService,
			SecurityService: securityService,
			CatalogService: catalogService,
			GeoResourceService: geoResourceService,
			TopicsService: topicsService
		} = $injector.inject(
			'ConfigService',
			'TranslationService',
			'FeedbackService',
			'SecurityService',
			'CatalogService',
			'GeoResourceService',
			'TopicsService'
		);

		this._configService = configService;
		this._translationService = translationService;
		this._feedbackService = feedbackService;
		this._securityService = securityService;
		this._catalogService = catalogService;
		this._geoResourceService = geoResourceService;
		this._topicsService = topicsService;

		// this._onSubmit = () => {};
	}

	_generateUniqueId() {
		const timestamp = new Date().getTime();
		this.#uniqueIdCounter++;
		return `${timestamp}-${this.#uniqueIdCounter}`;
	}

	// todo ??
	// ?? First ensure that the sort order stays OK
	// ?? Then fill all the gaps
	// !! for now, I take the sorting as is, but provide my own UIDs and order
	// todo !! make recursive
	_insertFirstNodeWithChildrenIntoSecond(catalog) {
		// todo remove - only here to have themes in themes during testing
		let first = null;
		let second = false;
		const catalogWithSecondLevelChildren = catalog.map((category) => {
			if (category.children) {
				if (!second) {
					if (first) {
						category.children.push(first);
						second = true;
					} else {
						first = category;
					}
				}
				return { ...category }; // , children
			} else {
				return { ...category };
			}
		});
		return catalogWithSecondLevelChildren;
	}

	_checkAndAugmentPositioningInfo(catalog, position = 0) {
		const catalogWithPositioningInfo = catalog.map((category) => {
			position += 100000;
			const uid = this._generateUniqueId();

			if (category.children) {
				const children = this._checkAndAugmentPositioningInfo(category.children, position);

				return {
					uid,
					...category,
					children,
					position
					// ,
					// showChildren: true
				};
			} else {
				return { uid: uid, ...category, position: position };
			}
		});

		return catalogWithPositioningInfo;
	}

	_mergeCatalogWithResourcesRecursive(catalog, georesources) {
		const updatedCatalog = catalog.map((category) => {
			if (category.children) {
				const updatedChildren = this._mergeCatalogWithResourcesRecursive(category.children, georesources);
				return { ...category, children: updatedChildren };
			} else {
				const georesource = georesources.find((geoResource) => geoResource.id === category.geoResourceId);
				return { ...category, label: georesource.label };
			}
		});

		return updatedCatalog;
	}

	_mergeCatalogWithResources() {
		const catalog = this.getModel().catalog;
		const georesources = this.getModel().geoResources;

		if (georesources.length === 0 || catalog.length === 0) {
			return null;
		}

		const catalogWithResourceData = this._mergeCatalogWithResourcesRecursive(catalog, georesources);
		this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
	}

	async onInitialize() {
		const updateCatalog = async (currentTopicId) => {
			try {
				let catalogWithIds = [];
				if (currentTopicId) {
					const catalog = await this._catalogService.byId(currentTopicId);
					const catalogWithS = this._insertFirstNodeWithChildrenIntoSecond(catalog);
					catalogWithIds = this._checkAndAugmentPositioningInfo(catalogWithS);
				} else {
					const defaultCatalog = await this._catalogService.byId('ba');
					const catalogWithS = this._insertFirstNodeWithChildrenIntoSecond(defaultCatalog);
					catalogWithIds = this._checkAndAugmentPositioningInfo(catalogWithS);
				}
				this.signal(Update_Catalog, catalogWithIds);

				this._mergeCatalogWithResources();
			} catch (error) {
				console.warn(error.message);
			}
		};

		try {
			const topics = await this._topicsService.all();
			this.signal(Update_Topics, topics);
		} catch (error) {
			console.warn(error.message);
		}

		try {
			const geoResources = await this._geoResourceService.all();
			this.signal(Update_GeoResources, geoResources);

			this._mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
		}

		this.observe(
			(state) => state.admin.currentTopicId,
			(currentTopicId) => {
				if (!currentTopicId) {
					const defaultTopic = this._configService.getValue('DEFAULT_TOPIC_ID', 'ba');
					this.signal(Update_SelectedTopic, defaultTopic);
					return;
				}
				updateCatalog(currentTopicId);
			}
		);
	}

	update(type, data, model) {
		const sortChildrenByIdRecursive = (entry) => {
			if (entry.children) {
				entry.children.sort((a, b) => a.position - b.position);
				entry.children.forEach((child) => sortChildrenByIdRecursive(child)); // Recursively sort children's children
			}
		};

		switch (type) {
			case Update_Topics:
				return { ...model, topics: [...data] };

			case Update_GeoResources:
				return { ...model, geoResources: [...data] };

			case Update_Catalog:
				return { ...model, catalog: data };

			case Update_CatalogWithResourceData:
				if (data && data.length > 0) {
					data.sort((a, b) => a.position - b.position);
					data.forEach((item) => sortChildrenByIdRecursive(item));
				}
				return { ...model, catalogWithResourceData: [...data], dummy: !model.dummy };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	createView(model) {
		const { currentTopicId, topics, catalogWithResourceData, geoResources, dummy } = model;

		const calcPosition = (index, catalogEntry, arrayWithEntry) => {
			if (index > 0) {
				const priorCatalogEntry = arrayWithEntry[index - 1];
				const newPosition = Math.round((arrayWithEntry[index].position + priorCatalogEntry.position) / 2);
				return newPosition;
			} else {
				const newPosition = Math.round(arrayWithEntry[index].position / 2);
				return newPosition;
			}
		};

		const findElement = (uid, inArray) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ inArray:', inArray);

			for (let index = 0; index < inArray.length; index++) {
				const element = inArray[index];

				// eslint-disable-next-line no-console
				console.log('🚀 ~  AdminPanel ~ createView ~ inArray.forEach ~ element:', element);
				if (element.uid === uid) {
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ element.uid === uid');
					return element;
				}
				// if (element.children) {
				// 	// eslint-disable-next-line no-console
				// 	console.log(' 🚀 ~ AdminPanel ~ createView ~ findElement ~ 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 element.children found');
				// 	return findElement(uid, element.children);
				// }
			}
		};

		const moveElement = (currentUid, uidFromDrag) => {
			logOnce('🚀 ~ AdminPanel ~ createView ~ moveElement ~ uidFromDrag: ' + uidFromDrag);
			if (logOnce('🚀 ~ AdminPanel ~ createView ~ moveElement ~ currentUid: ' + currentUid)) {
				// eslint-disable-next-line no-console
				console.log('      (for dragged element ~ uidFromDrag: ', uidFromDrag, ')');
			}

			findElement(uidFromDrag, catalogWithResourceData);
			// const draggedElement = findElement(uidFromDrag, catalogWithResourceData);
			// // eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ createView ~ moveElement ~ draggedElement:', draggedElement);
		};

		const createNewGeoResourceEntry = (newGeoresourceId) => {
			const georesource = geoResources.find((geoResource) => geoResource.id === newGeoresourceId);
			const newUid = this._generateUniqueId();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: georesource.label };
			return { newEntry, newUid };
		};

		const addGeoResourceRecursivly = (copyOfCatalogWithResourceData, currentCatalogEntryUid, newEntry) => {
			// itterate over catalogWithResourceData
			for (
				let catalogEntryNumberIn__catalogWithResourceData = 0;
				catalogEntryNumberIn__catalogWithResourceData < copyOfCatalogWithResourceData.length;
				catalogEntryNumberIn__catalogWithResourceData++
			) {
				const catalogEntry = copyOfCatalogWithResourceData[catalogEntryNumberIn__catalogWithResourceData];

				// and look for currentUid
				if (catalogEntry.uid === currentCatalogEntryUid) {
					// Found the uid in the top-level entries
					const inBetween = calcPosition(catalogEntryNumberIn__catalogWithResourceData, catalogEntry, copyOfCatalogWithResourceData);

					this.signal(Update_CatalogWithResourceData, [...copyOfCatalogWithResourceData, { ...newEntry, position: inBetween }]);

					return;
				}

				// Check the children if any
				if (catalogEntry.children) {
					const found = addGeoResourceToChildren(copyOfCatalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry);
					if (found) {
						return;
					}
				}
			}

			// todo ??? nothing found - should never happen
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			const copyOfCatalogWithResourceData = [...catalogWithResourceDataFromTree];
			// find georesource to add
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);

			addGeoResourceRecursivly(copyOfCatalogWithResourceData, currentCatalogEntryUid, newEntry);

			return newUid;
		};

		const addGeoResourceToChildren = (copyOfCatalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			// itterate over catalogEntry.children
			for (
				let catalogEntryNumberIn__catalogEntryChildren = 0;
				catalogEntryNumberIn__catalogEntryChildren < catalogEntry.children.length;
				catalogEntryNumberIn__catalogEntryChildren++
			) {
				// and look for currentUid
				const childCatalogEntry = catalogEntry.children[catalogEntryNumberIn__catalogEntryChildren];

				if (childCatalogEntry.uid === currentCatalogEntryUid) {
					// Found the uid in one of the children
					const inBetween = calcPosition(catalogEntryNumberIn__catalogEntryChildren, catalogEntry, catalogEntry.children);

					const newEntryWithPosition = { ...newEntry, position: inBetween };
					catalogEntry.children.push(newEntryWithPosition);
					this.signal(Update_CatalogWithResourceData, copyOfCatalogWithResourceData);
					return true;
				}

				// Check the children if any
				if (childCatalogEntry.children) {
					const found = addGeoResourceToChildren(copyOfCatalogWithResourceData, currentCatalogEntryUid, childCatalogEntry, newEntry);
					if (found) {
						return true;
					}
				}
			}
			return false;
		};

		const removeEntry = (uid) => {
			const updatedCatalogWithResourceData = removeEntryRecursive(uid, [...catalogWithResourceData]);
			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const removeEntryRecursive = (uid, catalog) => {
			if (!uid) {
				return catalog;
			}

			const newCatalogWithResourceData = [...catalog];
			const indexToRemove = newCatalogWithResourceData.findIndex((geoResource) => geoResource.uid === uid);

			if (indexToRemove !== -1) {
				newCatalogWithResourceData.splice(indexToRemove, 1);
				return newCatalogWithResourceData;
			}

			// Handle sublevels recursively
			const updatedCatalog = newCatalogWithResourceData.map((element) => {
				if (element.children) {
					const indexToRemove = element.children.findIndex((child) => child.uid === uid);

					if (indexToRemove !== -1) {
						const updatedChildren = [...element.children];
						updatedChildren.splice(indexToRemove, 1);
						return { ...element, children: updatedChildren };
					}

					const updatedChildren = removeEntryRecursive(uid, element.children);
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

		const showChildrenRecursive = (uid, catalog) => {
			if (!uid) {
				return catalog;
			}

			const newCatalogWithResourceData = [...catalog];
			const indexWhereToShowChildren = newCatalogWithResourceData.findIndex((geoResource) => geoResource.uid === uid);

			if (indexWhereToShowChildren !== -1) {
				newCatalogWithResourceData[indexWhereToShowChildren].showChildren = !newCatalogWithResourceData[indexWhereToShowChildren].showChildren;
				return newCatalogWithResourceData;
			}

			// Handle sublevels recursively
			const updatedCatalog = newCatalogWithResourceData.map((element) => {
				if (element.children) {
					const indexWhereToShowChildren = element.children.findIndex((child) => child.uid === uid);

					if (indexWhereToShowChildren !== -1) {
						const updatedChildren = [...element.children];
						element.children[indexWhereToShowChildren].showChildren = !element.children[indexWhereToShowChildren].showChildren;
						return { ...element, children: updatedChildren };
					}

					const updatedChildren = showChildrenRecursive(uid, element.children);
					return { ...element, children: updatedChildren };
				}

				return element;
			});

			return updatedCatalog;
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

			this.signal(Update_Catalog, catalogWithPositioningInfo);
		};

		const incrementString = (str) => {
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

		// todo parent
		// @ts-ignore
		const copyBranchRoot = (positionInCatalog, catalogEntry) => {
			// , parent = null
			let inBetweenOld = 0;
			if (positionInCatalog > 0) {
				const priorCatalogEntry = catalogWithResourceData[positionInCatalog - 1];
				inBetweenOld = Math.round((catalogEntry.position + priorCatalogEntry.position) / 2);
			} else {
				inBetweenOld = Math.round(catalogEntry.position / 2);
			}
			const inBetween = calcPosition(positionInCatalog, catalogEntry);

			if (inBetweenOld !== inBetween) {
				throw new Error(`inBetween wrong`);
			}

			this.signal(Update_CatalogWithResourceData, [
				...catalogWithResourceData,
				{ uid: this._generateUniqueId(), label: incrementString(catalogEntry.label), children: [], position: inBetween }
			]);
		};

		if (currentTopicId) {
			return html`
				<style>
					${css}
				</style>

				<h1>Admin App</h1>

				<div class="container">
					<div>
						<ba-layer-tree
							.topics="${topics}"
							.selectedTheme="${currentTopicId}"
							.catalogWithResourceData="${catalogWithResourceData}"
							.addGeoResource="${addGeoResource}"
							.moveElement="${moveElement}"
							.removeEntry="${removeEntry}"
							.showChildren="${showChildren}"
							.addGeoResourcePermanently="${addGeoResourcePermanently}"
							.copyBranchRoot="${copyBranchRoot}"
							.dummy="${dummy}"
						></ba-layer-tree>
					</div>

					<div>
						<ba-layer-list .geoResources=${geoResources}></ba-layer-list>
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
