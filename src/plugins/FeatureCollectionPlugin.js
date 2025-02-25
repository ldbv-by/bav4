/**
 * @module plugins/FeatureCollectionPlugin
 */
import { observe } from '../utils/storeUtils';
import { addLayer, removeLayer } from '../store/layers/layers.action';
import { BaPlugin } from './BaPlugin';
import { $injector } from '../injection/index';
import { AggregateGeoResource } from '../domain/geoResources';
/**
 * Id of the layer used for the visualization of a feature collection
 */
export const FEATURE_COLLECTION_LAYER_ID = 'feature_collection_layer';
/**
 * Id of the GeoResource used for the visualization of a feature collection
 */
export const FEATURE_COLLECTION_GEORESOURCE_ID = 'feature_collection';

/**
 *  This plugin observes the "featureCollection" slice-of-state.
 * @author taulinger
 */
export class FeatureCollectionPlugin extends BaPlugin {
	#geoResourceService;
	#importVectorDataService;
	#translationService;
	constructor() {
		super();
		const {
			GeoResourceService: geoResourceService,
			ImportVectorDataService,
			TranslationService
		} = $injector.inject('GeoResourceService', 'ImportVectorDataService', 'TranslationService');

		this.#geoResourceService = geoResourceService;
		this.#importVectorDataService = ImportVectorDataService;
		this.#translationService = TranslationService;
	}
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const translate = (key) => this.#translationService.translate(key);

		const onEntriesChanged = (entries) => {
			removeLayer(FEATURE_COLLECTION_LAYER_ID);
			if (entries.length > 0) {
				const geoResourceIds = entries.map((feature) => {
					const geoResourceId = feature.id;
					this.#importVectorDataService.forData(feature.geometry.data, { id: geoResourceId }, true);
					return geoResourceId;
				});

				this.#geoResourceService.addOrReplace(
					new AggregateGeoResource(FEATURE_COLLECTION_GEORESOURCE_ID, `${translate('global_featureCollection_layer_label')} (${entries.length})`, [
						...geoResourceIds
					]).setHidden(true)
				);
				addLayer(FEATURE_COLLECTION_LAYER_ID, { geoResourceId: FEATURE_COLLECTION_GEORESOURCE_ID });
			}
		};

		observe(store, (state) => state.featureCollection.entries, onEntriesChanged);
	}
}
