/**
 * @module modules/featureInfo/components/collection/FeatureCollectionPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { addFeatures, removeFeaturesById } from '../../../../store/featureCollection/featureCollection.action';
import { removeHighlightFeaturesByCategory } from '../../../../store/highlight/highlight.action';
import { MvuElement } from '../../../MvuElement';
import { abortOrReset } from '../../../../store/featureInfo/featureInfo.action';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import css from './featureCollectionPanel.css';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY } from '../../../../domain/highlightFeature';
import { FEATURE_COLLECTION_GEORESOURCE_ID } from '../../../../domain/geoResources';

/**
 * @typedef {Object} FeatureCollectionPanelConfig
 * @property {BaFeature} feature The feature
 * @property {string|null} geoResourceId The id of the corresponding GeoResource of the feature of `null`
 */

const Update_Configuration = 'update_configuration';
/**
 * Component that offers the possibility to interact with selected features
 * @class
 * @property {module:modules/featureInfo/components/collection/FeatureCollectionPanel~FeatureCollectionPanelConfig} configuration
 */
export class FeatureCollectionPanel extends MvuElement {
	#translationService;
	#storeService;
	#environmentService;
	constructor() {
		super({
			configuration: null
		});

		const {
			TranslationService: translationService,
			StoreService: storeService,
			EnvironmentService: environmentService
		} = $injector.inject('TranslationService', 'StoreService', 'EnvironmentService');
		this.#translationService = translationService;
		this.#storeService = storeService;
		this.#environmentService = environmentService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Configuration:
				return { ...model, configuration: data };
		}
	}

	createView(model) {
		const { configuration } = model;

		if (configuration && !this.#environmentService.isEmbeddedAsIframe()) {
			const { feature, geoResourceId } = configuration;
			const translate = (key) => this.#translationService.translate(key);
			const partOfCollection = this.#storeService
				.getStore()
				.getState()
				.featureCollection.entries.map((f) => f.id)
				.includes(feature.id);

			const removeFeature = () => {
				removeFeaturesById(feature.id);
				emitNotification(translate('global_featureCollection_remove_feature_notification'), LevelTypes.INFO);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			const addFeature = () => {
				removeHighlightFeaturesByCategory([SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY]);
				addFeatures(feature);
				emitNotification(translate('global_featureCollection_add_feature_notification'), LevelTypes.INFO);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			if (partOfCollection && geoResourceId === FEATURE_COLLECTION_GEORESOURCE_ID) {
				return html`<style>
						${css}
					</style>
					<button class="chips__button remove" .title=${translate('global_featureCollection_remove_feature_title')} @click=${removeFeature}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${translate('global_featureCollection_remove_feature')}</span>
					</button>`;
			} else if (!partOfCollection) {
				return html`<style>
						${css}
					</style>
					<button class="chips__button add" .title=${translate('global_featureCollection_add_feature_title')} @click=${addFeature}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${translate('global_featureCollection_add_feature')}</span>
					</button>`;
			}
		}

		return nothing;
	}

	set configuration(value) {
		this.signal(Update_Configuration, value);
	}

	static get tag() {
		return 'ba-feature-info-collection-panel';
	}
}
