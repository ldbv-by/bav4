/**
 * @module modules/featureInfo/components/collection/FeatureCollectionPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { addFeatures, removeFeaturesById } from '../../../../store/featureCollection/featureCollection.action';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';
import { MvuElement } from '../../../MvuElement';
import { abortOrReset } from '../../../../store/featureInfo/featureInfo.action';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import css from './featureCollectionPanel.css';

const Update_FeatureId = 'update_featureId';
const Update_Feature = 'update_feature';
/**
 * Component that offers the possibility to interact with selected features
 * @class
 * @property {String|null} featureId - The id of a feature which can be removed from the collection
 * @property {Feature|null} feature - A features which can be added to the collection
 */
export class FeatureCollectionPanel extends MvuElement {
	#translationService;
	#storeService;
	constructor() {
		super({
			featureId: null,
			feature: null
		});

		const { TranslationService: translationService, StoreService: storeService } = $injector.inject('TranslationService', 'StoreService');
		this.#translationService = translationService;
		this.#storeService = storeService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_FeatureId:
				return { ...model, featureId: data };
			case Update_Feature:
				return { ...model, feature: data };
		}
	}

	createView(model) {
		const { featureId, feature } = model;
		if (featureId || feature) {
			const translate = (key) => this.#translationService.translate(key);
			const partOfCollection = this.#storeService
				.getStore()
				.getState()
				.featureCollection.entries.map((f) => f.id)
				.includes(featureId);

			const removeFeature = () => {
				clearHighlightFeatures();
				removeFeaturesById(featureId);
				emitNotification(translate('featureInfo_featureCollection_remove_feature_notification'), LevelTypes.INFO);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			const addFeature = () => {
				clearHighlightFeatures();
				addFeatures(feature);
				emitNotification(translate('featureInfo_featureCollection_add_feature_notification'), LevelTypes.INFO);
				// by calling the abortOrReset action, we restore the previous opened tab of the MainMenu
				abortOrReset();
			};

			if (partOfCollection) {
				return html`
					<style>
						${css}
					</style>
					<button class="chips__button remove" .title=${translate('featureInfo_featureCollection_remove_feature_title')} @click=${removeFeature}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${translate('featureInfo_featureCollection_remove_feature')}</span>
					</button>
				`;
			} else if (feature) {
				return html`
					<style>
						${css}
					</style>
					<button class="chips__button add" .title=${translate('featureInfo_featureCollection_add_feature_title')} @click=${addFeature}>
						<span class="chips__icon"></span>
						<span class="chips__button-text">${translate('featureInfo_featureCollection_add_feature')}</span>
					</button>
				`;
			}
		}

		return nothing;
	}

	set featureId(value) {
		this.signal(Update_FeatureId, value);
	}

	set feature(value) {
		this.signal(Update_Feature, value);
	}

	static get tag() {
		return 'ba-feature-info-collection-panel';
	}
}
