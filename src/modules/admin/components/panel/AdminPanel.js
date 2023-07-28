/**
 * @module modules/admin/components/panel/AdminPanel
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

			let topLevelCounter = 0;
			let withChildrenCounter = 0;
			const catalogWithResourceData = catalog.map((category) => {
				if (!category.children) {
					topLevelCounter += 100000;
					const georesource = georesources.find((geoResource) => geoResource.id === category.geoResourceId);
					if (georesource) {
						// Map the properties from georesource to category
						return { ...category, label: georesource.label, id: topLevelCounter };
					}
				} else {
					withChildrenCounter += 1000;
					let childrenCounter = 0;
					const updatedChildren = category.children.map((child) => {
						childrenCounter += 100;
						const georesource = georesources.find((geoResource) => geoResource.id === child.geoResourceId);
						if (georesource) {
							// Map the properties from georesource to child
							return { ...child, label: georesource.label, id: childrenCounter };
						}
						return child;
					});
					return { ...category, id: withChildrenCounter, children: updatedChildren };
				}
			});

			this.signal(Update_CatalogWithResourceData, catalogWithResourceData);
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
		const { currentTopicId, topics, catalogWithResourceData, geoResources } = model;

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
