import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { featureCollectionReducer } from '../../src/store/featureCollection/featureCollection.reducer.js';
import {
	FEATURE_COLLECTION_GEORESOURCE_ID,
	FEATURE_COLLECTION_LAYER_ID,
	FeatureCollectionPlugin
} from '../../src/plugins/FeatureCollectionPlugin.js';
import { createDefaultLayer, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { Feature } from '../../src/domain/feature.js';
import { addFeatures, clearFeatures } from '../../src/store/featureCollection/featureCollection.action.js';
import { Geometry } from '../../src/domain/geometry.js';
import { AggregateGeoResource } from '../../src/domain/geoResources.js';

describe('FeatureCollectionPlugin', () => {
	const geoResourceService = {
		addOrReplace: () => {}
	};

	const importVectorDataService = {
		forData: () => {}
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			featureCollection: featureCollectionReducer,
			layers: layersReducer
		});
		$injector
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('ImportVectorDataService', importVectorDataService)
			.registerSingleton('TranslationService', { translate: (key) => key });
		return store;
	};

	describe('when featureCollection `entries` property changes', () => {
		it('removes an existing feature-collection layer', async () => {
			const store = setup({
				layers: {
					active: [createDefaultLayer(FEATURE_COLLECTION_LAYER_ID)]
				},
				featureCollection: {
					entries: [new Feature(new Geometry('data'), 'id')]
				}
			});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().layers.active).toHaveSize(1);

			clearFeatures();

			expect(store.getState().layers.active).toHaveSize(0);
		});

		it('adds a GeoResource for each feature and adds the feature-collection layer', async () => {
			const store = setup({});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);

			const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forData');
			const geoResourceServiceSpy = spyOn(geoResourceService, 'addOrReplace');

			addFeatures([new Feature(new Geometry('data0'), 'id0'), new Feature(new Geometry('data1'), 'id1')]);

			expect(store.getState().layers.active).toHaveSize(1);
			expect(store.getState().layers.active[0].id).toBe(FEATURE_COLLECTION_LAYER_ID);
			expect(importVectorDataServiceSpy).toHaveBeenCalledTimes(2);
			expect(importVectorDataServiceSpy.calls.all()[0].args[0]).toBe('data0');
			expect(importVectorDataServiceSpy.calls.all()[0].args[1]).toEqual({ id: 'id0' });
			expect(importVectorDataServiceSpy.calls.all()[0].args[2]).toBeTrue();
			expect(importVectorDataServiceSpy.calls.all()[1].args[0]).toBe('data1');
			expect(importVectorDataServiceSpy.calls.all()[1].args[1]).toEqual({ id: 'id1' });
			expect(importVectorDataServiceSpy.calls.all()[1].args[2]).toBeTrue();
			expect(geoResourceServiceSpy).toHaveBeenCalledWith(
				new AggregateGeoResource(FEATURE_COLLECTION_GEORESOURCE_ID, `global_featureCollection_layer_label (2)`, ['id0', 'id1']).setHidden(true)
			);
		});
	});
});
