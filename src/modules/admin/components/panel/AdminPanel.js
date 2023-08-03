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

	_checkAndAugmentPositioningInfo(catalog) {
		// todo
		// First ensure that the sort order stays OK
		// Then fill all the gaps
		// for now, I take the sorting as is, but provide my own IDs
		let topLevelCounter = 0;
		const catalogWithPositioningInfo = catalog.map((category) => {
			topLevelCounter += 100000;
			if (category.children) {
				let childrenCounter = 0;
				const updatedChildren = category.children.map((child) => {
					childrenCounter += 100000;
					// console.log("🚀 ~ AdminPanel ~ updatedChildren ~ { ...child, id: childrenCounter }:", { ...child, id: childrenCounter })
					return { ...child, id: childrenCounter };
				});

				return { ...category, id: topLevelCounter, children: updatedChildren };
			} else {
				return { ...category, id: topLevelCounter };
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
		// const logIds = (catalog) => {
		// 	let xxx = '';
		// 	catalog.forEach((item) => {
		// 		xxx += item.id + ' ';
		// 	});
		// 	console.log(xxx);
		// };

		switch (type) {
			case Update_Topics:
				return { ...model, topics: [...data] };

			case Update_GeoResources:
				return { ...model, geoResources: [...data] };

			case Update_Catalog:
				return { ...model, catalog: data };

			case Update_CatalogWithResourceData:
				// console.log('🚀 ~ update ~ Update_Catalog: vor sort');
				// logIds(data);

				if (data && data.length > 0) {
					data.sort((a, b) => a.id - b.id);
					data.forEach((item) => sortChildrenByIdRecursive(item));
				}

				// console.log('🚀 ~ update ~ Update_Catalog: nach sort');
				// logIds(data);

				return { ...model, catalogWithResourceData: [...data] };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	createView(model) {
		const { currentTopicId, topics, catalogWithResourceData, geoResources } = model;

		// const onDrop = (e, catalogEntry) => {
		// 	console.log('🚀 ~ LayerTree ~ onDrop ~ e:', e);
		// 	console.log('🚀 ~ LayerTree ~ onDrop ~ catalogEntry:', catalogEntry);
		// 	// // const draggedData = e.dataTransfer.getData('georesourceid');
		// 	// // console.log('Dragged data:', draggedData);

		// 	// const types = e.dataTransfer.types;
		// 	// const matchedElement = types.find((element) => /georesourceid(.+)/i.test(element));
		// 	// const newGeoresourceId = matchedElement ? matchedElement.replace(/georesourceid/, '') : null;

		// 	// logOnce('newGeoresourceId', newGeoresourceId);

		// 	// if (catalogEntry.geoResourceId) {
		// 	// 	logOnce('current ' + catalogEntry.geoResourceId, catalogEntry);

		// 	// 	if (currentGeoResourceId !== newGeoresourceId) {
		// 	// 		this.signal(Update_CurrentGeoResourceId, newGeoresourceId);

		// 	// 		const currentLocationIndexArray = findGeoResourceIdIndex(catalogEntry.geoResourceId);
		// 	// 		//
		// 	// 		if (currentLocationIndexArray && currentLocationIndexArray.length === 1) {
		// 	// 			const currentIndex = currentLocationIndexArray[0];
		// 	// 			// const currentCatalogEntry = catalogWithResourceData[currentIndex];
		// 	// 			if (currentIndex > 0) {
		// 	// 				const priorCatalogEntry = catalogWithResourceData[currentIndex - 1];
		// 	// 				logOnce('prior ' + catalogEntry.geoResourceId, priorCatalogEntry);

		// 	// 				const inBetween = Math.round((catalogEntry.id + priorCatalogEntry.id) / 2);

		// 	// 				this._addGeoResource(newGeoresourceId, inBetween);
		// 	// 			}
		// 	// 		}
		// 	// 	}
		// 	// } else {
		// 	// 	logOnce(catalogEntry.label, catalogEntry);
		// 	// }

		// 	// const spanElement = e.target;

		// 	// const liElement = spanElement.parentNode;

		// 	// if (liElement.classList.contains('has-children')) {
		// 	// 	liElement.classList.add('show-children');
		// 	// }
		// 	// spanElement.classList.add('drag-over');

		// 	// e.preventDefault();
		// };

		const addGeoResource = (geoResourceId, topLevelPosition) => {
			console.log('🚀 ~ addGeoResource ~ geoResourceId:', geoResourceId);
			console.log('🚀 ~ addGeoResource ~ topLevelPosition:', topLevelPosition);
			const newCatalogWithResourceData = this._mergeCatalogWithResources();
			console.log('🚀 ~ addGeoResource ~ newCatalogWithResourceData:', newCatalogWithResourceData);
			const georesource = geoResources.find((geoResource) => geoResource.id === geoResourceId);
			console.log('🚀 ~ addGeoResource ~ georesource:', georesource);
			this.signal(Update_CatalogWithResourceData, [...newCatalogWithResourceData, { geoResourceId, label: georesource.label, id: topLevelPosition }]);
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
