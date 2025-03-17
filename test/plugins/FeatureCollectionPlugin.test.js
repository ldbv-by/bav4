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
import { SourceType, SourceTypeName } from '../../src/domain/sourceType.js';
import { removeLayer } from '../../src/store/layers/layers.action.js';
import { StyleHint } from '../../src/domain/styles.js';

describe('FeatureCollectionPlugin', () => {
	const geoResourceService = {
		addOrReplace: () => {},
		byId: () => {}
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
					entries: [new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id')]
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
					entries: [new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id0')]
				}
			});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);

			addFeatures([
				new Feature(new Geometry('data0', new SourceType(SourceTypeName.EWKT)), 'id1'),
				new Feature(new Geometry('data1', new SourceType(SourceTypeName.EWKT)), 'id2')
			]);

			expect(store.getState().featureCollection.entries).toHaveSize(3);
		});

		it('adds a GeoResource for each feature and adds the feature-collection layer', async () => {
			const store = setup({});
			const instanceUnderTest = new FeatureCollectionPlugin();
			await instanceUnderTest.register(store);
			const mockGeoResource = { setStyleHint: () => {} };
			const setStyleHintSpy = spyOn(mockGeoResource, 'setStyleHint');

			const importVectorDataServiceSpy = spyOn(importVectorDataService, 'forData');
			const geoResourceServiceAddOrReplaceSpy = spyOn(geoResourceService, 'addOrReplace');
			spyOn(geoResourceService, 'byId').and.returnValue(mockGeoResource);

			addFeatures([
				new Feature(new Geometry('data0', new SourceType(SourceTypeName.EWKT)), 'id0'),
				new Feature(new Geometry('data1', new SourceType(SourceTypeName.EWKT)), 'id1')
			]);

			expect(store.getState().layers.active).toHaveSize(1);
			expect(store.getState().layers.active[0].id).toBe(FEATURE_COLLECTION_LAYER_ID);
			expect(importVectorDataServiceSpy).toHaveBeenCalledTimes(2);
			expect(importVectorDataServiceSpy.calls.all()[0].args[0]).toBe('data0');
			expect(importVectorDataServiceSpy.calls.all()[0].args[1]).toEqual({ id: 'id0' });
			expect(importVectorDataServiceSpy.calls.all()[0].args[2]).toBeTrue();
			expect(importVectorDataServiceSpy.calls.all()[1].args[0]).toBe('data1');
			expect(importVectorDataServiceSpy.calls.all()[1].args[1]).toEqual({ id: 'id1' });
			expect(importVectorDataServiceSpy.calls.all()[1].args[2]).toBeTrue();
			expect(geoResourceServiceAddOrReplaceSpy).toHaveBeenCalledWith(
				new AggregateGeoResource(FEATURE_COLLECTION_GEORESOURCE_ID, `global_featureCollection_layer_label (2)`, ['id0', 'id1']).setHidden(true)
			);
			expect(setStyleHintSpy).toHaveBeenCalledTimes(2);
			expect(setStyleHintSpy).toHaveBeenCalledWith(StyleHint.HIGHLIGHT);
		});
	});

	describe('when layers `removed` property changes', () => {
		describe('and the feature collection layer is removed', () => {
			it('clears the feature collection', async () => {
				const store = setup({});
				const instanceUnderTest = new FeatureCollectionPlugin();
				await instanceUnderTest.register(store);
				addFeatures([
					new Feature(new Geometry('data0', new SourceType(SourceTypeName.EWKT)), 'id0'),
					new Feature(new Geometry('data1', new SourceType(SourceTypeName.EWKT)), 'id1')
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
					new Feature(new Geometry('data0', new SourceType(SourceTypeName.EWKT)), 'id0'),
					new Feature(new Geometry('data1', new SourceType(SourceTypeName.EWKT)), 'id1')
				]);

				expect(store.getState().featureCollection.entries).toHaveSize(2);

				removeLayer(layerId);

				expect(store.getState().featureCollection.entries).toHaveSize(2);
			});
		});
	});
});
