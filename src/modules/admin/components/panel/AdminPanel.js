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
// eslint-disable-next-line no-unused-vars
import { logOnce, onlyOnce } from '../layerTree/LayerTree';

const Update_SelectedTopic = 'update_selectedtopic';
// const Update_Topics = 'update_topics';
const Update_CatalogWithResourceData = 'update_catalogWithResourceData';
const Update_ElementToMove = 'update_elementToMove';

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

	constructor() {
		super({
			currentTopicId: null,
			dummy: true,
			catalogWithResourceData: null,
			elementToMove: null
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
					// ,
					// showChildren: true
				};
			} else {
				return { uid: uid, ...category, position: position };
			}
		});

		return catalogWithPositioningInfo;
	}

	_mergeCatalogWithResourcesRecursive(catalogBranch) {
		const updatedCatalogBranch = catalogBranch.map((category) => {
			if (category.children) {
				const updatedChildren = this._mergeCatalogWithResourcesRecursive(category.children);
				return { ...category, children: updatedChildren };
			} else {
				const geoResource = this.#geoResources.find((georesource) => georesource.id === category.geoResourceId);
				return { ...category, label: geoResource.label };
			}
		});

		return updatedCatalogBranch;
	}

	_mergeCatalogWithResources() {
		if (this.#geoResources.length === 0 || this.#catalog.length === 0) {
			return null;
		}

		const catalogWithResourceData = this._mergeCatalogWithResourcesRecursive(this.#catalog);
		this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
	}

	async onInitialize() {
		const updateCatalog = async (currentTopicId) => {
			console.log('🚀 ~ AdminPanel ~ onInitialize() ~ updateCatalog(currentTopicId) with currentTopicId: ', currentTopicId);
			try {
				const catalogFromService = await this._catalogService.byId(currentTopicId);

				const catalogFromServiceWithSecondLevel = this._insertFirstNodeWithChildrenIntoSecond(catalogFromService);
				this.#catalog = this._checkAndAugmentPositioningInfo(catalogFromServiceWithSecondLevel);

				this._mergeCatalogWithResources();
			} catch (error) {
				console.warn(error.message);
			}
		};

		await this._geoResourceService.init();
		await this._topicsService.init();

		try {
			this.#topics = await this._topicsService.all();
			// this.signal(Update_Topics, topics);
		} catch (error) {
			console.warn(error.message);
		}

		try {
			this.#geoResources = await this._geoResourceService.all();
		} catch (error) {
			console.warn(error.message);
		}

		this.observe(
			(state) => state.admin.currentTopicId,
			(currentTopicId) => {
				console.log('🚀 ~ AdminPanel ~ onInitialize ~ currentTopicId:', currentTopicId);
				if (!currentTopicId) {
					const defaultTopic = this._configService.getValue('DEFAULT_TOPIC_ID', 'ba');
					console.log('🚀 ~ AdminPanel ~ onInitialize ~ this.signal(Update_SelectedTopic, defaultTopic);');
					this.signal(Update_SelectedTopic, defaultTopic);
					return;
				}
				console.log('🚀 ~ AdminPanel ~ onInitialize ~ updateCatalog(currentTopicId);');
				updateCatalog(currentTopicId);
			}
		);
	}

	update(type, data, model) {
		switch (type) {
			// case Update_Topics:
			// 	return { ...model, topics: [...data] };

			case Update_ElementToMove:
				// eslint-disable-next-line no-console
				// console.log('🚀🚀🚀🚀🚀🚀🚀 ~ update ~ Update_ElementToMove:', data, '🚀🚀🚀🚀🚀🚀🚀');
				return { ...model, elementToMove: data };

			case Update_CatalogWithResourceData:
				// eslint-disable-next-line no-console
				// console.log('🚀🚀🚀🚀🚀🚀🚀 ~ update ~ Update_CatalogWithResourceData:', data, '🚀🚀🚀🚀🚀🚀🚀');
				return { ...model, catalogWithResourceData: [...data], dummy: !model.dummy };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	_sortChildrenByIdRecursive = (entry) => {
		if (entry.children) {
			entry.children.sort((a, b) => a.position - b.position);
			entry.children.forEach((child) => this._sortChildrenByIdRecursive(child)); // Recursively sort children's children
		}
	};

	_sortCatalog(data) {
		if (data && data.length > 0) {
			data.sort((a, b) => a.position - b.position);
			data.forEach((item) => this._sortChildrenByIdRecursive(item));
		}
	}

	createView(model) {
		const { currentTopicId, catalogWithResourceData, dummy } = model;

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

		// todo - in the making
		const findElement = (uid, inArray) => {
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ uid: ', uid);
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ inArray: ', inArray);

			for (let index = 0; index < inArray.length; index++) {
				const element = inArray[index];

				// eslint-disable-next-line no-console
				// console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ itterate over inArray ~ element:', element);
				if (element.uid === uid) {
					// eslint-disable-next-line no-console
					// console.log('🚀 ~ AdminPanel ~ createView ~ findElement ~ element.uid === uid');
					return element;
				}
				// if (element.children) {
				// 	// eslint-disable-next-line no-console
				// 	console.log(' 🚀 ~ AdminPanel ~ createView ~ findElement ~ 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 element.children found');
				// 	return findElement(uid, element.children);
				// }
			}
			// console.log('🚀 nach for 🚀 🚀 🚀 🚀 🚀 🚀 🚀 ');
		};

		const moveElement = (currentCatalogEntryUid, uidFromDrag_ElementToMove_) => {
			if (currentCatalogEntryUid === uidFromDrag_ElementToMove_) {
				return;
			}
			// logOnce('🚀 ~ AdminPanel ~ createView ~ moveElement ~ uidFromDrag_ElementToMove_: ' + uidFromDrag_ElementToMove_);
			// if (logOnce('🚀 ~ AdminPanel ~ createView ~ moveElement ~ currentCatalogEntryUid: ' + currentCatalogEntryUid)) {
			// 	// eslint-disable-next-line no-console
			// 	console.log('      (for dragged element ~ uidFromDrag_ElementToMove_: ', uidFromDrag_ElementToMove_, ')');
			// }

			const elementToMove = findElement(uidFromDrag_ElementToMove_, catalogWithResourceData);
			if (!elementToMove) {
				return;
			}

			const updatedCatalogWithResourceData = removeEntryRecursively(uidFromDrag_ElementToMove_, [...catalogWithResourceData]);

			const newCatalogWithResourceData = addEntry(updatedCatalogWithResourceData, currentCatalogEntryUid, elementToMove);
			// eslint-disable-next-line no-console
			// console.log('🚀 AdminPanel ~ moveElement ~ newCatalogWithResourceData:', newCatalogWithResourceData);

			this.signal(Update_CatalogWithResourceData, newCatalogWithResourceData);
		};

		const createNewGeoResourceEntry = (newGeoresourceId) => {
			const geoResource = this.#geoResources.find((georesource) => georesource.id === newGeoresourceId);
			const newUid = this._generateUniqueId();
			const newEntry = { uid: newUid, geoResourceId: newGeoresourceId, label: geoResource.label };
			return { newEntry, newUid };
		};

		const addEntryToChildrenRecursively = (copyOfCatalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ copyOfCatalogWithResourceData:', copyOfCatalogWithResourceData);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ currentCatalogEntryUid:', currentCatalogEntryUid);
			// console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ catalogEntry:', catalogEntry);
			// console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ newEntry:', newEntry);
			// itterate over catalogEntry.children
			for (let n = 0; n < catalogEntry.children.length; n++) {
				// and look for currentUid
				const childCatalogEntry = catalogEntry.children[n];
				// eslint-disable-next-line no-console
				console.log('addEntryToChildrenRecursively - look at ', childCatalogEntry);

				if (childCatalogEntry.uid === currentCatalogEntryUid) {
					// eslint-disable-next-line no-console
					console.log('addEntryToChildrenRecursively -  Found the uid in one of the children');
					// Found the uid in one of the children
					const inBetween = calcPosition(n, catalogEntry.children);

					const newEntryWithPosition = { ...newEntry, position: inBetween };
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ newEntryWithPosition:', newEntryWithPosition);
					catalogEntry.children.push(newEntryWithPosition);
					// this.signal(Update_CatalogWithResourceData, copyOfCatalogWithResourceData);
					// eslint-disable-next-line no-console
					this._sortCatalog(catalogWithResourceData);
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ copyOfCatalogWithResourceData:', copyOfCatalogWithResourceData);
					return copyOfCatalogWithResourceData;
				}

				// Check the children if any
				if (childCatalogEntry.children) {
					// eslint-disable-next-line no-console
					console.log('addEntryToChildrenRecursively   -   Looking in children   -   ');
					const returnCatalog = addEntryToChildrenRecursively(copyOfCatalogWithResourceData, currentCatalogEntryUid, childCatalogEntry, newEntry);
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ addEntryToChildrenRecursively ~ returnCatalog:', returnCatalog);
					return returnCatalog;
				}
			}
			return copyOfCatalogWithResourceData;
		};

		const addEntry = (catalogWithResourceData, currentCatalogEntryUid, newEntry) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addEntry ~ catalogWithResourceData:', catalogWithResourceData);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addEntry ~ currentCatalogEntryUid:', currentCatalogEntryUid);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addEntry ~ newEntry:', newEntry);
			// itterate over catalogWithResourceData
			for (let entryNumber = 0; entryNumber < catalogWithResourceData.length; entryNumber++) {
				const catalogEntry = catalogWithResourceData[entryNumber];

				// // eslint-disable-next-line no-console
				// console.log('addEntry - looking at ', catalogEntry);

				// and look for currentUid
				if (catalogEntry.uid === currentCatalogEntryUid) {
					// eslint-disable-next-line no-console
					console.log('Found the uid in the top-level entries');
					// Found the uid in the top-level entries
					const inBetween = calcPosition(entryNumber, catalogWithResourceData);

					catalogWithResourceData = [...catalogWithResourceData, { ...newEntry, position: inBetween }];
					// eslint-disable-next-line no-console
					console.log('🚀 ~ AdminPanel ~ addEntry ~ copyOfCatalogWithResourceData:', catalogWithResourceData);
					this._sortCatalog(catalogWithResourceData);
					return catalogWithResourceData;
				}

				// Check the children if any
				if (catalogEntry.children) {
					return addEntryToChildrenRecursively(catalogWithResourceData, currentCatalogEntryUid, catalogEntry, newEntry);
				}
			}

			// todo ??? nothing found - should never happen
		};

		const addGeoResource = (currentCatalogEntryUid, newGeoresourceId, catalogWithResourceDataFromTree) => {
			// eslint-disable-next-line no-console
			console.log('🚀 ~ here it begins ~ 🚀 ~ AdminPanel ~ addGeoResource ~ catalogWithResourceDataFromTree:', catalogWithResourceDataFromTree);
			// find georesource to add
			const { newEntry, newUid } = createNewGeoResourceEntry(newGeoresourceId);

			const copyOfCatalogWithResourceData = addEntry([...catalogWithResourceDataFromTree], currentCatalogEntryUid, newEntry);
			// eslint-disable-next-line no-console
			console.log('🚀 ~ AdminPanel ~ addGeoResource ~ copyOfCatalogWithResourceData:', copyOfCatalogWithResourceData);
			this._sortCatalog(copyOfCatalogWithResourceData);

			this.signal(Update_CatalogWithResourceData, copyOfCatalogWithResourceData);

			return newUid;
		};

		const removeEntryRecursively = (uid, catalogBranch) => {
			const newCatalogBranch = [...catalogBranch];
			const indexToRemove = newCatalogBranch.findIndex((entry) => entry.uid === uid);

			// found in top level - done
			if (indexToRemove !== -1) {
				newCatalogBranch.splice(indexToRemove, 1);
				return newCatalogBranch;
			}

			// handle sublevels recursively
			const updatedCatalogBranch = newCatalogBranch.map((element) => {
				if (element.children) {
					const indexToRemove = element.children.findIndex((child) => child.uid === uid);

					// found in children - done
					if (indexToRemove !== -1) {
						const updatedChildren = [...element.children];
						updatedChildren.splice(indexToRemove, 1);
						return { ...element, children: updatedChildren };
					}

					// recurse
					const updatedChildren = removeEntryRecursively(uid, element.children);
					return { ...element, children: updatedChildren };
				}

				return element;
			});
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ updatedCatalog ~ newCatalogWithResourceData:', newCatalogWithResourceData);

			return updatedCatalogBranch;
		};

		const removeEntry = (uid) => {
			if (!uid) {
				return;
			}

			const updatedCatalogWithResourceData = removeEntryRecursively(uid, [...catalogWithResourceData]);
			this.signal(Update_CatalogWithResourceData, updatedCatalogWithResourceData);
		};

		const showChildren = (uid) => {
			const updatedCatalogWithResourceData = showChildrenRecursive(uid, [...catalogWithResourceData]);
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
			// eslint-disable-next-line no-console
			// console.log('🚀 ~ AdminPanel ~ updatedCatalog ~ newCatalogWithResourceData:', newCatalogWithResourceData);

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

		if (currentTopicId) {
			return html`
				<style>
					${css}
				</style>

				<h1>Admin App</h1>

				<div class="container">
					<div>
						<ba-layer-tree
							.topics="${this.#topics}"
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
						<ba-layer-list .geoResources=${this.#geoResources}></ba-layer-list>
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
