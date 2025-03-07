/**
 * @module modules/featureInfo/components/collection/FeatureCollectionPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { addFeatures, removeFeaturesById } from '../../../../store/featureCollection/featureCollection.action';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';
import { MvuElement } from '../../../MvuElement';
import removeFromCollectionButton from '../assets/printer.svg';
import addToCollectionButton from '../assets/share.svg';
import { abortOrReset } from '../../../../store/featureInfo/featureInfo.action';
import { FEATURE_COLLECTION_GEORESOURCE_ID } from '../../../../plugins/FeatureCollectionPlugin';

/**
 * @typedef {Object} FeatureCollectionPanelConfig
 * @property {Feature} feature The feature
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
	constructor() {
		super({
			configuration: null
		});

		const { TranslationService: translationService, StoreService: storeService } = $injector.inject('TranslationService', 'StoreService');
		this.#translationService = translationService;
		this.#storeService = storeService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Configuration:
				return { ...model, configuration: data };
		}
	}

	createView(model) {
		const { configuration } = model;

		if (configuration) {
			const { feature, geoResourceId } = configuration;
			const translate = (key) => this.#translationService.translate(key);
			const partOfCollection = this.#storeService
				.getStore()
				.getState()
				.featureCollection.entries.map((f) => f.id)
				.includes(feature.id);

			const removeFeature = () => {
				clearHighlightFeatures();
				removeFeaturesById(feature.id);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			const addFeature = () => {
				clearHighlightFeatures();
				addFeatures(feature);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			if (partOfCollection && geoResourceId === FEATURE_COLLECTION_GEORESOURCE_ID) {
				return html`<div>
					<ba-icon
						.title=${translate('featureInfo_featureCollection_remove_feature')}
						.icon=${removeFromCollectionButton}
						@click=${removeFeature}
					></ba-icon>
				</div>`;
			} else if (!partOfCollection) {
				return html`<div>
					<ba-icon .title=${translate('featureInfo_featureCollection_add_feature')} .icon="${addToCollectionButton}" @click=${addFeature}></ba-icon>
				</div>`;
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
