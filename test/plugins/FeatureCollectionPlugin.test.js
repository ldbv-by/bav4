import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { featureCollectionReducer } from '../../src/store/featureCollection/featureCollection.reducer.js';
import {
	FEATURE_COLLECTION_GEORESOURCE_ID,
	FEATURE_COLLECTION_LAYER_ID,
	FeatureCollectionPlugin
} from '../../src/plugins/FeatureCollectionPlugin.js';
import { createDefaultLayer, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { BaFeature } from '../../src/domain/feature.js';
import { addFeatures, clearFeatures } from '../../src/store/featureCollection/featureCollection.action.js';
import { BaGeometry } from '../../src/domain/geometry.js';
import { VectorGeoResource } from '../../src/domain/geoResources.js';
import { SourceType } from '../../src/domain/sourceType.js';
import { removeLayer } from '../../src/store/layers/layers.action.js';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../src/services/provider/attribution.provider.js';

describe('FeatureCollectionPlugin', () => {
	const geoResourceService = {
		addOrReplace: () => {}
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			featureCollection: featureCollectionReducer,
			layers: layersReducer
		});
		$injector.registerSingleton('GeoResourceService', geoResourceService).registerSingleton('TranslationService', { translate: (key) => key });
		return store;
	};

	describe('when featureCollection `entries` property changes', () => {
		it('removes an existing feature-collection layer', async () => {
			const store = setup({
				layers: {
					active: [createDefaultLayer(FEATURE_COLLECTION_LAYER_ID)]
				},
				featureCollection: {
					entries: [new BaFeature(new BaGeometry('data', SourceType.forGpx()), 'id')]
				}
			});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active).toHaveSize(1);

			clearFeatures();

			expect(store.getState().layers.active).toHaveSize(0);
		});

		it('preserves existing features', async () => {
			const store = setup({
				featureCollection: {
					entries: [new BaFeature(new BaGeometry('data', SourceType.forGpx()), 'id0')]
				}
			});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);

			addFeatures([
				new BaFeature(new BaGeometry('data0', SourceType.forGpx()), 'id1'),
				new BaFeature(new BaGeometry('data1', SourceType.forGpx()), 'id2')
			]);

			expect(store.getState().featureCollection.entries).toHaveSize(3);
		});

		it('adds a GeoResource for each feature and adds the feature-collection layer', async () => {
			const store = setup({});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);
			const feature0 = new BaFeature(new BaGeometry('data0', SourceType.forGpx()), 'id0');
			const feature1 = new BaFeature(new BaGeometry('data1', SourceType.forGpx()), 'id1');
			const geoResourceServiceAddOrReplaceSpy = spyOn(geoResourceService, 'addOrReplace');

			addFeatures([feature0, feature1]);

			expect(store.getState().layers.active).toHaveSize(1);
			expect(store.getState().layers.active[0].id).toBe(FEATURE_COLLECTION_LAYER_ID);
			expect(geoResourceServiceAddOrReplaceSpy).toHaveBeenCalledWith(
				new VectorGeoResource(FEATURE_COLLECTION_GEORESOURCE_ID, `global_featureCollection_layer_label (2)`)
					.setFeatures([feature0, feature1])
					.markAsLocalData(true)
					.setHidden(true)
					.setAttributionProvider(getAttributionForLocallyImportedOrCreatedGeoResource)
			);
		});
	});

	describe('when layers `removed` property changes', () => {
		describe('and the feature collection layer is removed', () => {
			it('clears the feature collection', async () => {
				const store = setup({});
				const instanceUnderTest = new FeatureCollectionPlugin();
				await instanceUnderTest.register(store);
				addFeatures([
					new BaFeature(new BaGeometry('data0', SourceType.forGpx()), 'id0'),
					new BaFeature(new BaGeometry('data1', SourceType.forGpx()), 'id1')
				]);

				expect(store.getState().featureCollection.entries).toHaveSize(2);

				removeLayer(FEATURE_COLLECTION_LAYER_ID);

				expect(store.getState().featureCollection.entries).toHaveSize(0);
			});
		});

		describe('and any other layer is removed', () => {
			it('does nothing', async () => {
				const layerId = 'someLayer';
				const store = setup({
					layers: {
						active: [createDefaultLayer(layerId)]
					}
				});
				const instanceUnderTest = new FeatureCollectionPlugin();
				await instanceUnderTest.register(store);
				addFeatures([
					new BaFeature(new BaGeometry('data0', SourceType.forGpx()), 'id0'),
					new BaFeature(new BaGeometry('data1', SourceType.forGpx()), 'id1')
				]);

				expect(store.getState().featureCollection.entries).toHaveSize(2);

				removeLayer(layerId);

				expect(store.getState().featureCollection.entries).toHaveSize(2);
			});
		});
	});
});
