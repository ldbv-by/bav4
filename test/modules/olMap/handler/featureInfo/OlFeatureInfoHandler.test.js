import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {
	OlFeatureInfoHandler,
	OlFeatureInfoHandler_Hit_Tolerance_Px,
	OlFeatureInfoHandler_Query_Resolution_Delay_Ms
} from '../../../../../src/modules/olMap/handler/featureInfo/OlFeatureInfoHandler';
import { featureInfoReducer } from '../../../../../src/store/featureInfo/featureInfo.reducer';
import { TestUtils } from '../../../../test-utils';
import { abortOrReset, startRequest } from '../../../../../src/store/featureInfo/featureInfo.action';
import { fromLonLat } from 'ol/proj';
import { createDefaultLayer, layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { getBvvFeatureInfo } from '../../../../../src/modules/olMap/handler/featureInfo/featureInfoItem.provider';
import { modifyLayer } from '../../../../../src/store/layers/layers.action';
import { highlightReducer } from '../../../../../src/store/highlight/highlight.reducer';
import { HighlightFeatureType } from '../../../../../src/store/highlight/highlight.action';
import GeoJSON from 'ol/format/GeoJSON';
import { $injector } from '../../../../../src/injection';
import { QUERY_RUNNING_HIGHLIGHT_FEATURE_ID } from '../../../../../src/plugins/HighlightPlugin';
import { Cluster } from 'ol/source';
import { FeatureInfoGeometryTypes } from '../../../../../src/domain/featureInfo';
import LayerGroup from 'ol/layer/Group';
import { VectorGeoResource, VectorSourceType } from '../../../../../src/domain/geoResources';

describe('OlFeatureInfoHandler_Query_Resolution_Delay', () => {
	it('determines amount of time query resolution delayed', async () => {
		expect(OlFeatureInfoHandler_Query_Resolution_Delay_Ms).toBe(300);
	});
});
describe('OlFeatureInfoHandler_Hit_Tolerance_Px', () => {
	it('determines hit-detection tolerance in css pixels', async () => {
		expect(OlFeatureInfoHandler_Hit_Tolerance_Px).toBe(10);
	});
});

describe('OlFeatureInfoHandler', () => {
	const TestDelay = OlFeatureInfoHandler_Query_Resolution_Delay_Ms + 100;

	const renderComplete = (map) => {
		return new Promise((resolve) => {
			map.on('rendercomplete', () => {
				resolve();
			});
		});
	};

	const mockFeatureInfoProvider = (olFeature, layer) => {
		const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
		return { title: `${olFeature.get('name')}-${layer.id}`, content: `${olFeature.get('description')}`, geometry: geometry };
	};
	const mockNullFeatureInfoProvider = () => null;

	const geoResourceService = {
		byId: () => {}
	};
	const matchingCoordinate = fromLonLat([11, 48]);
	const notMatchingCoordinate = fromLonLat([5, 12]);
	let store;

	const setup = (state = {}, featureInfoProvider = getBvvFeatureInfo) => {
		store = TestUtils.setupStoreAndDi(state, { featureInfo: featureInfoReducer, layers: layersReducer, highlight: highlightReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('GeoResourceService', geoResourceService);
		return new OlFeatureInfoHandler(featureInfoProvider);
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: matchingCoordinate,
				zoom: 1
			})
		});
	};

	describe('constructor', () => {
		it('initializes the service with custom provider', async () => {
			setup();
			const customProvider = async () => {};
			const instanceUnderTest = new OlFeatureInfoHandler(customProvider);
			expect(instanceUnderTest._featureInfoProvider).toEqual(customProvider);
		});

		it('initializes the service with default provider', async () => {
			const instanceUnderTest = setup();
			expect(instanceUnderTest._featureInfoProvider).toEqual(getBvvFeatureInfo);
		});
	});

	it('instantiates the handler', () => {
		setup();
		const handler = new OlFeatureInfoHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Feature_Info_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when featureInfo.coordinate property changes', () => {
		const layerId0 = 'layerId0';
		const layerId1 = 'layerId1';
		const layerId2 = 'layerId2';
		const layerId3 = 'layerId3';
		const geoResourceId0 = 'geoResourceId0';
		const geoResourceId1 = 'geoResourceId1';
		const geoResourceId2 = 'geoResourceId2';
		const geoResourceId3 = 'geoResourceId3';
		let vectorLayer0;
		let vectorLayer1;

		beforeEach(() => {
			vectorLayer0 = new VectorLayer({ properties: { id: layerId0, geoResourceId: geoResourceId0 } });
			vectorLayer1 = new VectorLayer({ properties: { id: layerId1, geoResourceId: geoResourceId1 } });
		});

		it('registers and resolves a query', async () => {
			const handler = setup({}, mockFeatureInfoProvider);
			const map = setupMap();
			handler.register(map);

			startRequest(matchingCoordinate);

			expect(store.getState().featureInfo.querying).toBeTrue();

			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.querying).toBeFalse();
		});

		it('adds exactly one FeatureInfo', async () => {
			const handler = setup(
				{
					layers: {
						active: [createDefaultLayer(layerId0, geoResourceId0)]
					}
				},
				mockFeatureInfoProvider
			);
			const olVectorSource = new VectorSource();
			const geometry = new Point(matchingCoordinate);
			const feature0 = new Feature({ geometry: geometry });
			feature0.set('name', 'name0');
			feature0.set('description', 'description0');
			olVectorSource.addFeature(feature0);
			const feature1 = new Feature({ geometry: geometry });
			feature1.set('name', 'name1');
			feature1.set('description', 'description1');
			olVectorSource.addFeature(feature1);
			vectorLayer0.setSource(olVectorSource);
			const map = setupMap();
			const forEachFeatureAtPixelSpy = spyOn(map, 'forEachFeatureAtPixel').and.callThrough();
			map.addLayer(vectorLayer0);

			handler.register(map);
			spyOn(geoResourceService, 'byId').and.returnValue(new VectorGeoResource(geoResourceId0, '', VectorSourceType.GEOJSON));

			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			startRequest(matchingCoordinate);

			expect(store.getState().featureInfo.current).toHaveSize(1);

			await TestUtils.timeout(TestDelay);

			abortOrReset();
			startRequest(notMatchingCoordinate);

			expect(store.getState().featureInfo.current).toHaveSize(0);
			expect(forEachFeatureAtPixelSpy).toHaveBeenCalledWith(
				jasmine.any(Object),
				jasmine.any(Function),
				jasmine.objectContaining({ hitTolerance: OlFeatureInfoHandler_Hit_Tolerance_Px })
			);
		});

		it('removes outdated HighlightFeature items', async () => {
			const handler = setup(
				{
					highlight: {
						features: [
							{ id: QUERY_RUNNING_HIGHLIGHT_FEATURE_ID, type: HighlightFeatureType.DEFAULT, data: [21, 42] },
							{ id: 'foo', type: HighlightFeatureType.DEFAULT, data: [5, 55] }
						]
					}
				},
				mockFeatureInfoProvider
			);
			const map = setupMap();
			handler.register(map);

			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			startRequest(notMatchingCoordinate);

			await TestUtils.timeout(TestDelay);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');
		});

		it('adds one FeatureInfo from each suitable layer', async () => {
			const handler = setup(
				{
					layers: {
						active: [
							createDefaultLayer(layerId0, geoResourceId0),
							createDefaultLayer(layerId1, geoResourceId1),
							createDefaultLayer(layerId2, geoResourceId2),
							createDefaultLayer(layerId3, geoResourceId3)
						]
					}
				},
				mockFeatureInfoProvider
			);
			const map = setupMap();
			const geometry = new Point(matchingCoordinate);
			const expectedFeatureInfoGeometry = { data: new GeoJSON().writeGeometry(geometry), geometryType: FeatureInfoGeometryTypes.GEOJSON };
			// 1. "default" vector layer
			const olVectorSource0 = new VectorSource();
			const feature0 = new Feature({ geometry: geometry });
			feature0.set('name', 'name0');
			feature0.set('description', 'description0');
			olVectorSource0.addFeature(feature0);
			vectorLayer0.setSource(olVectorSource0);
			map.addLayer(vectorLayer0);

			//2. vector layer containing a clustered source
			const olVectorSource1 = new VectorSource();
			const olClusteredVectorSource1 = new Cluster({ source: olVectorSource1 });
			const feature1 = new Feature({ geometry: geometry });
			feature1.set('name', 'name1');
			feature1.set('description', 'description1');
			olVectorSource1.addFeature(feature1);
			vectorLayer1.setSource(olClusteredVectorSource1);
			map.addLayer(vectorLayer1);

			//3. vector layer grouped in a layer group
			const olVectorSource2 = new VectorSource();
			const feature2 = new Feature({ geometry: geometry });
			feature2.set('name', 'name2');
			feature2.set('description', 'description2');
			olVectorSource2.addFeature(feature2);
			const vectorLayer2 = new VectorLayer({ properties: { geoResourceId: 'aggregateGeoResource' } });
			vectorLayer2.setSource(olVectorSource2);
			map.addLayer(new LayerGroup({ properties: { id: layerId2, geoResourceId: geoResourceId2 }, layers: [vectorLayer2] }));

			//4. referenced GeoResource is not queryable (see GeoResourceService syp below)
			const olVectorSource3 = new VectorSource();
			const feature3 = new Feature({ geometry: geometry });
			feature3.set('name', 'name03');
			feature3.set('description', 'description3');
			olVectorSource3.addFeature(feature3);
			const vectorLayer3 = new VectorLayer({ properties: { id: layerId3, geoResourceId: geoResourceId3 } });
			vectorLayer3.setSource(olVectorSource3);
			map.addLayer(vectorLayer3);

			spyOn(geoResourceService, 'byId').and.callFake((geoResourceId) =>
				new VectorGeoResource(geoResourceId, '', VectorSourceType.GEOJSON).setQueryable(geoResourceId !== geoResourceId3)
			);
			handler.register(map);

			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			startRequest(matchingCoordinate);

			//must be called within a timeout function cause implementation delays call of 'resolveQuery'
			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(3);
			// ensure correct order of LayerInfo items -> must correspond to layers.active ordering
			expect(store.getState().featureInfo.current[0]).toEqual({
				title: 'name2-layerId2',
				content: 'description2',
				geometry: expectedFeatureInfoGeometry
			});
			expect(store.getState().featureInfo.current[1]).toEqual({
				title: 'name1-layerId1',
				content: 'description1',
				geometry: expectedFeatureInfoGeometry
			});
			expect(store.getState().featureInfo.current[2]).toEqual({
				title: 'name0-layerId0',
				content: 'description0',
				geometry: expectedFeatureInfoGeometry
			});

			//we update with non matching coordinates
			abortOrReset();
			startRequest(notMatchingCoordinate);

			expect(store.getState().featureInfo.current).toHaveSize(0);

			startRequest(matchingCoordinate);

			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(3);

			// we modify the first layer so that it is not queryable anymore
			modifyLayer(layerId0, { visible: false });
			abortOrReset();
			startRequest(matchingCoordinate);

			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(2);

			//we modify the second layer so that it is not queryable anymore, but the feature1 has a name property
			modifyLayer(layerId1, { constraints: { hidden: true } });
			abortOrReset();
			startRequest(matchingCoordinate);

			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(2);

			//we modify feature1 by setting the name property to undefined
			feature1.set('name', undefined);
			abortOrReset();
			startRequest(matchingCoordinate);

			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(1);
		});

		it('ignores a clustered feature containing more than one features', async () => {
			const handler = setup(
				{
					layers: {
						active: [createDefaultLayer(layerId0, geoResourceId0), createDefaultLayer(layerId1, geoResourceId1)]
					}
				},
				mockFeatureInfoProvider
			);
			const map = setupMap();
			const geometry = new Point(matchingCoordinate);

			const olVectorSource1 = new VectorSource();
			// here we use a clustered VectorSource
			const olClusteredVectorSource1 = new Cluster({ source: olVectorSource1 });
			const feature0 = new Feature({ geometry: geometry });
			feature0.set('name', 'name0');
			feature0.set('description', 'description0');
			olVectorSource1.addFeature(feature0);
			const feature1 = new Feature({ geometry: geometry });
			feature0.set('name', 'name1');
			feature0.set('description', 'description1');
			olVectorSource1.addFeature(feature1);
			vectorLayer1.setSource(olClusteredVectorSource1);
			map.addLayer(vectorLayer1);

			handler.register(map);

			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			startRequest(matchingCoordinate);

			//must be called within a timeout function cause implementation delays call of 'resolveQuery'
			await TestUtils.timeout(TestDelay);
			expect(store.getState().featureInfo.current).toHaveSize(0);
		});

		it("adds 'Not_Available' FeatureInfo items and NO HighlightFeatures when FeatureInfoProvider returns null", async () => {
			const handler = setup(
				{
					layers: {
						active: [createDefaultLayer(layerId0, geoResourceId0), createDefaultLayer(layerId1, geoResourceId1)]
					}
				},
				mockNullFeatureInfoProvider
			);
			const map = setupMap();
			spyOn(geoResourceService, 'byId').and.callFake((geoResourceId) => new VectorGeoResource(geoResourceId, '', VectorSourceType.GEOJSON));
			const geometry = new Point(matchingCoordinate);
			const olVectorSource0 = new VectorSource();
			const feature0 = new Feature({ geometry: geometry });

			olVectorSource0.addFeature(feature0);
			vectorLayer0.setSource(olVectorSource0);
			map.addLayer(vectorLayer0);

			const olVectorSource1 = new VectorSource();
			const feature1 = new Feature({ geometry: geometry });

			olVectorSource1.addFeature(feature1);
			vectorLayer1.setSource(olVectorSource1);
			map.addLayer(vectorLayer1);

			handler.register(map);

			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			startRequest(matchingCoordinate);

			expect(store.getState().featureInfo.current).toHaveSize(2);
			expect(store.getState().featureInfo.current[0]).toEqual({ title: 'global_featureInfo_not_available', content: '' });
			expect(store.getState().featureInfo.current[1]).toEqual({ title: 'global_featureInfo_not_available', content: '' });
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
