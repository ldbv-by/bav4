/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */

import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './adminPanel.css';
import { $injector } from '../../../../injection/index';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';
import { setCurrentTopicId as updateStore } from '../../../../store/admin/admin.action';

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

	async onInitialize() {
		const mergeCatalogWithResources = () => {
			const catalog = this.getModel().catalog;
			const georesources = this.getModel().geoResources;

			if (georesources.length === 0 || catalog.length === 0) {
				return;
			}

			// // Define a mapping object for property name correspondence
			// const propertyMapping = {
			// 	id: 'geoResourceId',
			// 	label: '_label',
			// 	attribution: '_attribution',
			// 	url: '_url',
			// 	layers: '_layers',
			// 	format: '_format',
			// 	type: '_type',
			// 	sourceType: '_sourceType'
			// };

			// // Helper function to map properties
			// const mapProperties = (sourceObject, mapping) => {
			// 	return Object.entries(sourceObject).reduce((mappedObj, [key, value]) => {
			// 		const mappedKey = mapping[key] || key;
			// 		mappedObj[mappedKey] = value;
			// 		return mappedObj;
			// 	}, {});
			// };

			// Create the catalogWithResourceData array with the mapped properties
			const catalogWithResourceData = catalog.map((category) => {
				if (!category.children) {
					const georesource = georesources.find((geoResource) => geoResource.id === category.geoResourceId);
					if (georesource) {
						// Map the properties from georesource to category
						return { ...category, label: georesource.label };
					}
				} else {
					const updatedChildren = category.children.map((child) => {
						const georesource = georesources.find((geoResource) => geoResource.id === child.geoResourceId);
						if (georesource) {
							// Map the properties from georesource to child
							return { ...child, label: georesource.label };
						}
						return child;
					});
					return { ...category, children: updatedChildren };
				}
			});

			// const catalogWithResourceData = catalog.map((category) => {
			// 	if (!category.children) {
			// 		// If the category has no children, return the category with additional properties
			// 		const georesource = geoResources.find((geoResource) => geoResource.id === category.geoResourceId);
			// 		return georesource ? { ...category, ...georesource } : category;
			// 	} else {
			// 		// If the category has children, update each child with the corresponding georesource data
			// 		const updatedChildren = category.children.map((child) => {
			// 			const georesource = geoResources.find((geoResource) => geoResource.id === child.geoResourceId);

			// 			if (georesource) {
			// 				// If a matching georesource is found, merge it with the child and return the updated child object
			// 				return { ...child, ...georesource };
			// 			} else {
			// 				// If no matching georesource is found, return the original child object
			// 				return child;
			// 			}
			// 		});

			// 		// Return the updated category object with the updated children
			// 		return { ...category, children: updatedChildren };
			// 	}
			// });

			this.signal(Update_CatalogWithResourceData, catalogWithResourceData);

			// const catalogWithResources = [];
			// const geoResourceDictionary = {};
			// for (const geoResource of geoResources) {
			// 	geoResourceDictionary[geoResource.id] = geoResource;
			// }

			// for (const entry of catalog) {
			// 	if (entry.label) {
			// 		for (let child of entry.children) {
			// 			if (child.geoResourceId) {
			// 				child = { geoResourceId: child.geoResourceId, label: geoResourceDictionary[child.geoResourceId].label };
			// 				entry.children.push(child);
			// 			}
			// 			console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ entry:', entry);
			// 			catalogWithResources.push(entry);
			// 		}
			// 	}
			// }
			// console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ entry.geoResourceId:', entry.geoResourceId);
			// if (entry.geoResourceId) {
			// 	console.log(
			// 		'🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ mergedData[entry.geoResourceId].label:',
			// 		geoResourceDictionary[entry.geoResourceId].label
			// 	);
			// 	entry = { ...entry, label: geoResourceDictionary[entry.geoResourceId].label };
			// }
			// console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ mergedData:', geoResourceDictionary);
			// console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ catalog:', catalog);
		};

		const updateCatalog = async (currentTopicId) => {
			try {
				if (currentTopicId) {
					const catalog = await this._catalogService.byId(currentTopicId);
					this.signal(Update_Catalog, catalog);
				} else {
					const defaultCatalog = await this._catalogService.byId('ba');
					this.signal(Update_Catalog, defaultCatalog);
				}
				mergeCatalogWithResources();
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

			mergeCatalogWithResources();
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
		switch (type) {
			case Update_Topics:
				return { ...model, topics: [...data] };

			case Update_GeoResources:
				return { ...model, geoResources: [...data] };

			case Update_Catalog:
				return { ...model, catalog: [...data] };

			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: [...data] };

			case Update_SelectedTopic:
				updateStore(data);
				return { ...model, currentTopicId: data };
		}
	}

	createView(model) {
		const { currentTopicId, topics, catalogWithResourceData } = model;

		if (currentTopicId) {
			return html`
				<style>
					${css}
				</style>

				<h1>Admin App</h1>

				<div class="container">
					<ba-layer-tree .topics="${topics}" .selectedTheme="${currentTopicId}" .catalogWithResourceData="${catalogWithResourceData}"></ba-layer-tree>
				</div>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-adminpanel';
	}
}
