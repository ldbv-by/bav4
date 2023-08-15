/**
 * @module modules/admin/components/panel/AdminPanel
 */
import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './adminPanel.css';
import { $injector } from '../../../../injection/index';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';
import { setCurrentTopicId as updateStore } from '../../../../store/admin/admin.action';
import { GeoResource } from '../../../../domain/geoResources';
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

	_checkAndAugmentPositioningInfo(catalog) {
		// todo ??
		// ?? First ensure that the sort order stays OK
		// ?? Then fill all the gaps
		// !! for now, I take the sorting as is, but provide my own UIDs and order
		// todo !! make recursive
		let topLevelCounter = 0;
		const catalogWithPositioningInfo = catalog.map((category) => {
			topLevelCounter += 100000;
			const topLevelUid = this._generateUniqueId();
			if (category.children) {
				let childrenCounter = 0;
				const updatedChildren = category.children.map((child) => {
					childrenCounter += 100000;
					const childUid = this._generateUniqueId();
					// console.log("🚀 ~ AdminPanel ~ updatedChildren ~ { ...child, id: childrenCounter }:", { ...child, id: childrenCounter })
					return { ...child, uid: childUid, id: childrenCounter };
				});

				return { ...category, uid: topLevelUid, id: topLevelCounter, children: updatedChildren };
			} else {
				return { ...category, uid: topLevelUid, id: topLevelCounter };
			}
		});
		return catalogWithPositioningInfo;
	}

	_mergeCatalogWithResources() {
		const catalog = this.getModel().catalog;
		const georesources = this.getModel().geoResources;

		if (georesources.length === 0 || catalog.length === 0) {
			return null;
		}

		const catalogWithResourceData = catalog.map((category) => {
			if (!category.children) {
				const georesource = georesources.find((geoResource) => geoResource.id === category.geoResourceId);
				if (georesource) {
					return { ...category, label: georesource.label };
				}
				return { ...category, label: 'missing georesource.label' }; // todo ? missing georesource.label
			} else {
				const updatedChildren = category.children.map((child) => {
					const georesource = georesources.find((geoResource) => geoResource.id === child.geoResourceId);
					if (georesource) {
						return { ...child, label: georesource.label };
					} else {
						return { ...child, label: 'missing georesource.label' }; // todo ? missing georesource.label}
					}
				});
				return { ...category, children: updatedChildren };
			}
		});

		return catalogWithResourceData;
	}

	async onInitialize() {
		const updateCatalog = async (currentTopicId) => {
			try {
				let catalogWithIds = [];
				if (currentTopicId) {
					const catalog = await this._catalogService.byId(currentTopicId);
					catalogWithIds = this._checkAndAugmentPositioningInfo(catalog);
				} else {
					const defaultCatalog = await this._catalogService.byId('ba');
					catalogWithIds = this._checkAndAugmentPositioningInfo(defaultCatalog);
				}
				this.signal(Update_Catalog, catalogWithIds);

				const catalogWithResourceData = this._mergeCatalogWithResources();
				if (catalogWithResourceData) {
					this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
				}
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

			const catalogWithResourceData = this._mergeCatalogWithResources();
			if (catalogWithResourceData) {
				this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
			}
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
				entry.children.sort((a, b) => a.id - b.id);
				entry.children.forEach((child) => sortChildrenByIdRecursive(child)); // Recursively sort children's children
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

		switch (type) {
			case Update_Topics:
				return { ...model, topics: [...data] };

			case Update_GeoResources:
				return { ...model, geoResources: [...data] };

			case Update_Catalog:
				console.log('🚀 ~ update ~ Update_Catalog ~ data:', data);
				return { ...model, catalog: data };

			case Update_CatalogWithResourceData:
				// console.log('🚀 ~ update ~ Update_CatalogWithResourceData ~ data:', data);
				// console.log('🚀 ~ update ~ Update_CatalogWithResourceData: vor sort');
				// logIds(data);

				if (data && data.length > 0) {
					data.sort((a, b) => a.id - b.id);
					data.forEach((item) => sortChildrenByIdRecursive(item));
				}

				// console.log('🚀 ~ update ~ Update_Catalog: nach sort');
				// logXs(data, 'id');
				// logXs(data, 'geoResourceId');

				return { ...model, catalogWithResourceData: [...data] };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	createView(model) {
		const { currentTopicId, topics, catalogWithResourceData, geoResources } = model;
		// console.log('🚀 ~ createView ~ catalogWithResourceData:', catalogWithResourceData);

		const findUIdIndex = (uid, catalogWithResourceData) => {
			for (let i = 0; i < catalogWithResourceData.length; i++) {
				const catalogEntry = catalogWithResourceData[i];

				if (catalogEntry.uid === uid) {
					// Found the uid in the top-level entries
					// console.log('🚀 ~ findGeoResourceIdIndex ~ Found the geoResourceId in the top-level entries at i ', i);
					return [i];
				}

				if (catalogEntry.children) {
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

		const addGeoResource = (geoResourceId, position, childOf = null) => {
			console.log('🚀 ~ addGeoResource ~ geoResourceId:', geoResourceId);
			console.log('🚀 ~ addGeoResource ~ position:', position);
			console.log('🚀 ~ addGeoResource ~ childOf:', childOf);
			// reset
			const newCatalogWithResourceData = this._mergeCatalogWithResources();

			const georesource = geoResources.find((geoResource) => geoResource.id === geoResourceId);

			if (childOf) {
				const child = newCatalogWithResourceData[childOf];
				newCatalogWithResourceData.splice(childOf);
				child.children.push({ geoResourceId, label: georesource.label, id: position });
				this.signal(Update_CatalogWithResourceData, [...newCatalogWithResourceData, child]);
			} else {
				this.signal(Update_CatalogWithResourceData, [...newCatalogWithResourceData, { geoResourceId, label: georesource.label, id: position }]);
			}
		};

		const removeGeoResource = (geoResourceId) => {
			if (!geoResourceId) {
				return;
			}
			const newCatalogWithResourceData = [...catalogWithResourceData];
			const indexToRemove = newCatalogWithResourceData.findIndex((geoResource) => geoResource.geoResourceId === geoResourceId);

			if (indexToRemove !== -1) {
				newCatalogWithResourceData.splice(indexToRemove, 1);
				this.signal(Update_CatalogWithResourceData, newCatalogWithResourceData);
			}
		};

		const afterDrop = () => {
			// catalogWithResourceData;

			const catalogWithPositioningInfo = catalogWithResourceData.map((category) => {
				if (category.children) {
					const updatedChildren = category.children.map((child) => {
						return { uid: child.uid, geoResourceId: child.geoResourceId, id: child.id };
					});

					return { uid: category.uid, id: category.id, label: category.label, children: updatedChildren };
				} else {
					return { uid: category.uid, geoResourceId: category.geoResourceId, id: category.id };
				}
			});
			console.log('🚀 ~ catalogWithPositioningInfo ~ catalogWithPositioningInfo:', catalogWithPositioningInfo);

			this.signal(Update_Catalog, catalogWithPositioningInfo);
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
							.removeGeoResource="${removeGeoResource}"
							.afterDrop="${afterDrop}"
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
/*
todo




notes

dragenter
dragover
dragleave or drop



*/
