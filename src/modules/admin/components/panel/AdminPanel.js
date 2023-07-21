/**
 * @module modules/feedback/components/generalFeedback/GeneralFeedbackPanel
 */

import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import css from './adminPanel.css';
import { $injector } from '../../../../injection/index';
import { nothing } from '../../../../../node_modules/lit-html/lit-html';

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
			currentTopicId: 'ba',
			topics: null,
			catalog: null,
			geoResources: null,
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
			console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ catalog:', catalog);
			const georesources = this.getModel().georesources;
			console.log('🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ georesources:', georesources);

			const mergedData = {};
			if (georesources === null || catalog === null) {
				return;
			}
			console.log('🚀 ~ 🚀 ~ 🚀 ~ 🚀 ~ AdminPanel ~ mergeCatalogWithResources ~ OK');

			for (const georesource of georesources) {
				mergedData[georesource.id] = georesource;
			}
			for (let entry of catalog) {
				if (entry.geoResourceId) {
					entry = { ...entry, ...mergedData[entry.geoResourceId] };
				}
			}
			this.signal(Update_CatalogWithResourceData, catalog);
		};

		const updateCatalog = async (currentTopicId) => {
			console.log('🚀 ~ AdminPanel ~ updateCatalog ~ currentTopicId:', currentTopicId);
			try {
				if (currentTopicId) {
					const catalog = await this._catalogService.byId(currentTopicId);
					this.signal(Update_Catalog, catalog);
				} else {
					const defaultCatalog = await this._catalogService.default();
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
			console.log('🚀 ~ AdminPanel ~ onInitialize ~ geoResources:', geoResources);
			this.signal(Update_GeoResources, geoResources);

			mergeCatalogWithResources();
		} catch (error) {
			console.warn(error.message);
		}

		this.observe(
			(state) => state.admin.currentTopicId,
			(currentTopicId) => {
				updateCatalog(currentTopicId);
			}
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Catalog:
				return { ...model, topics: data };
			case Update_CatalogWithResourceData:
				return { ...model, catalogWithResourceData: data };
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
