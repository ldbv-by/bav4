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
					...category,
					uid,
					position,
					children
				};
			} else {
				return { ...category, uid: uid, position: position };
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
				return { ...model, catalogWithResourceData: [...data] };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	createView(model) {
		const { currentTopicId, topics, catalogWithResourceData, geoResources } = model;

		const findUIdIndex = (uid, catalogWithResourceData) => {
			for (let i = 0; i < catalogWithResourceData.length; i++) {
				const catalogEntry = catalogWithResourceData[i];

				if (catalogEntry.uid === uid) {
					// Found the uid in the top-level entries
					return [i];
				}

				if (catalogEntry.children) {
					// todo make recursive
					// Check the children for the geoResourceId
					for (let j = 0; j < catalogEntry.children.length; j++) {
						if (catalogEntry.children[j].uid === uid) {
							// Found the uid in one of the children
							return [i, j];
						}
					}
				}
			}

			// uid not found in the array
			return null;
		};

		const addGeoResource = (currentUid, newGeoresourceId, catalogWithResourceData) => {
			const georesource = geoResources.find((geoResource) => geoResource.id === newGeoresourceId);
			logOnce(
				newGeoresourceId + ' newGeoresourceId',
				'🚀 ~ AdminPanel ~ addGeoResource ~ newGeoresourceId: ' + newGeoresourceId + ' ' + georesource.label
			);

			let inBetween = 0;
			const newUid = this._generateUniqueId();
			logOnce('🚀 ~ AdminPanel ~ addGeoResource ~ newUid: ' + newUid);

			for (
				let catalogEntryNumberIn__catalogWithResourceData = 0;
				catalogEntryNumberIn__catalogWithResourceData < catalogWithResourceData.length;
				catalogEntryNumberIn__catalogWithResourceData++
			) {
				const catalogEntry = catalogWithResourceData[catalogEntryNumberIn__catalogWithResourceData];

				if (catalogEntry.uid === currentUid) {
					// Found the uid in the top-level entries
					if (catalogEntryNumberIn__catalogWithResourceData > 0) {
						const priorCatalogEntry = catalogWithResourceData[catalogEntryNumberIn__catalogWithResourceData - 1];
						inBetween = Math.round((catalogEntry.position + priorCatalogEntry.position) / 2);
					} else {
						inBetween = Math.round(catalogEntry.position / 2);
					}

					this.signal(Update_CatalogWithResourceData, [
						...catalogWithResourceData,
						{ uid: newUid, geoResourceId: newGeoresourceId, label: georesource.label, position: inBetween }
					]);

					return newUid;
				}

				if (catalogEntry.children) {
					// Check the children
					// todo make recursive
					for (
						let catalogEntryNumberIn__catalogEntryChildren = 0;
						catalogEntryNumberIn__catalogEntryChildren < catalogEntry.children.length;
						catalogEntryNumberIn__catalogEntryChildren++
					) {
						const childCatalogEntry = catalogEntry.children[catalogEntryNumberIn__catalogEntryChildren];
						if (childCatalogEntry.uid === currentUid) {
							// Found the uid in one of the children

							if (catalogEntryNumberIn__catalogEntryChildren > 0) {
								const priorCatalogEntry = catalogEntry.children[catalogEntryNumberIn__catalogEntryChildren - 1];
								inBetween = Math.round((childCatalogEntry.position + priorCatalogEntry.position) / 2);
							} else {
								inBetween = Math.round(childCatalogEntry.position / 2);
							}

							catalogWithResourceData.splice(catalogEntryNumberIn__catalogWithResourceData, 1);
							catalogEntry.children.push({ uid: newUid, geoResourceId: newGeoresourceId, label: georesource.label, position: inBetween });
							this.signal(Update_CatalogWithResourceData, [...catalogWithResourceData, catalogEntry]);
						}
					}
				}
			}

			return newUid;
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
		const copyBranchRoot = (positionInCatalog, catalogEntry, parent = null) => {
			let inBetween = 0;
			if (positionInCatalog > 0) {
				const priorCatalogEntry = catalogWithResourceData[positionInCatalog - 1];
				inBetween = Math.round((catalogEntry.position + priorCatalogEntry.position) / 2);
			} else {
				inBetween = Math.round(catalogEntry.position / 2);
			}

			this.signal(Update_CatalogWithResourceData, [
				...catalogWithResourceData,
				{ uid: this._generateUniqueId(), position: inBetween, label: incrementString(catalogEntry.label), children: [] }
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
							.removeEntry="${removeEntry}"
							.addGeoResourcePermanently="${addGeoResourcePermanently}"
							.copyBranchRoot="${copyBranchRoot}"
							.removeEntry="${removeEntry}"
							.addGeoResourcePermanently="${addGeoResourcePermanently}"
							.copyBranchRoot="${copyBranchRoot}"
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
