/**
 * @module modules/featureInfo/components/collection/FeatureCollectionPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection/index';
import { addFeatures, removeFeaturesById } from '../../../../store/featureCollection/featureCollection.action';
import { clearHighlightFeatures } from '../../../../store/highlight/highlight.action';
import { MvuElement } from '../../../MvuElement';
import { Feature } from '../../../../domain/feature';
import removeFromCollectionButton from '../assets/printer.svg';
import addToCollectionButton from '../assets/share.svg';

const Update_FeatureId = 'update_featureId';
const Update_Geometry = 'update_geometry';
/**
 * Component that offers the possibility to interact with selected features
 * @class
 * @property {String|null} featureId - The id of a selected feature
 * @property {Geometry|null} data - The id of a selected feature
 */
export class FeatureCollectionPanel extends MvuElement {
	#translationService;
	#storeService;
	constructor() {
		super({
			featureId: null,
			geometry: null
		});

		const { TranslationService: translationService, StoreService: storeService } = $injector.inject('TranslationService', 'StoreService');
		this.#translationService = translationService;
		this.#storeService = storeService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_FeatureId:
				return { ...model, featureId: data };
			case Update_Geometry:
				return { ...model, geometry: data };
		}
	}

	createView(model) {
		const { featureId, geometry } = model;
		if (featureId || geometry) {
			const translate = (key) => this.#translationService.translate(key);
			const partOfCollection = this.#storeService
				.getStore()
				.getState()
				.featureCollection.entries.map((f) => f.id)
				.includes(featureId);

			const removeFeature = () => {
				clearHighlightFeatures();
				removeFeaturesById(featureId);
			};

			const addFeature = () => {
				clearHighlightFeatures();
				addFeatures(new Feature(geometry));
				// setTab(TabIds.SEARCH);
			};

			if (partOfCollection) {
				return html`<div>
					<ba-icon
						.title=${translate('featureInfo_featureCollection_remove_feature')}
						.icon=${removeFromCollectionButton}
						@click=${removeFeature}
					></ba-icon>
				</div>`;
			} else if (geometry) {
				return html`<div>
					<ba-icon .title=${translate('featureInfo_featureCollection_add_feature')} .icon="${addToCollectionButton}" @click=${addFeature}></ba-icon>
				</div>`;
			}
		}

		return nothing;
	}

	set featureId(value) {
		this.signal(Update_FeatureId, value);
	}

	set geometry(value) {
		this.signal(Update_Geometry, value);
	}

	static get tag() {
		return 'ba-feature-info-collection-panel';
	}
}
