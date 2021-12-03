import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OlFeatureInfoHandler, OlFeatureInfoHandler_Query_Resolution_Delay_Ms } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/OlFeatureInfoHandler';
import { featureInfoReducer } from '../../../../../../../src/store/featureInfo/featureInfo.reducer';
import { TestUtils } from '../../../../../../test-utils';
import { abortOrReset, FeatureInfoGeometryTypes, startRequest } from '../../../../../../../src/store/featureInfo/featureInfo.action';
import { fromLonLat } from 'ol/proj';
import { createDefaultLayer, layersReducer } from '../../../../../../../src/store/layers/layers.reducer';
import { getBvvFeatureInfo } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/featureInfoItem.provider';
import { modifyLayer } from '../../../../../../../src/store/layers/layers.action';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { HighlightFeatureTypes, HighlightGeometryTypes } from '../../../../../../../src/store/highlight/highlight.action';
import GeoJSON from 'ol/format/GeoJSON';
import { $injector } from '../../../../../../../src/injection';
import { FEATURE_INFO_HIGHLIGHT_FEATURE_ID } from '../../../../../../../src/plugins/HighlightPlugin';

describe('OlFeatureInfoHandler_Query_Resolution_Delay', () => {

	it('determines amount of time query resolution delayed.', async () => {
		expect(OlFeatureInfoHandler_Query_Resolution_Delay_Ms).toBe(300);
	});
});

describe('OlFeatureInfoHandler', () => {

	const TestDelay = OlFeatureInfoHandler_Query_Resolution_Delay_Ms + 100;

	const mockFeatureInfoProvider = (olFeature, layer) => {
		const geometry = { data: new GeoJSON().writeGeometry(olFeature.getGeometry()), geometryType: FeatureInfoGeometryTypes.GEOJSON };
		return { title: `${olFeature.get('name')}-${layer.id}`, content: `${olFeature.get('description')}`, geometry: geometry };
	};
	const mockNullFeatureInfoProvider = () => null;

	const matchingCoordinate = fromLonLat([11, 48]);
	const notMatchingCoordinate = fromLonLat([5, 12]);
	let store;

	const setup = (state = {}, featureInfoProvider = getBvvFeatureInfo) => {
		store = TestUtils.setupStoreAndDi(state, { featureInfo: featureInfoReducer, layers: layersReducer, highlight: highlightReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
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
			const customProvider = async () => { };
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
		let vectorLayer0;
		let vectorLayer1;

		beforeEach(() => {
			vectorLayer0 = new VectorLayer({ properties: { id: layerId0 } });
			vectorLayer1 = new VectorLayer({ properties: { id: layerId1 } });
		});

		it('registers and resolves a query', (done) => {
			const handler = setup({}, mockFeatureInfoProvider);
			const map = setupMap();
			handler.register(map);

			startRequest(matchingCoordinate);

			expect(store.getState().featureInfo.querying).toBeTrue();

			setTimeout(() => {
				expect(store.getState().featureInfo.querying).toBeFalse();
				done();
			}, TestDelay);
		});

		it('adds exactly one FeatureInfo and HighlightFeature per layer', (done) => {
			const handler = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0)
					]
				}
			}, mockFeatureInfoProvider);
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
			map.addLayer(vectorLayer0);

			handler.register(map);

			map.once('rendercomplete', () => {
				// safe to call map.getPixelFromCoordinate from now on
				startRequest(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(1);

				setTimeout(() => {

					expect(store.getState().highlight.features).toHaveSize(1);

					abortOrReset();
					startRequest(notMatchingCoordinate);

					expect(store.getState().featureInfo.current).toHaveSize(0);
					expect(store.getState().highlight.features).toHaveSize(0);
					done();
				}, TestDelay);
			});
		});

		it('removes outdated HighlightFeature items', (done) => {
			const handler = setup({
				highlight: {
					features: [
						{ id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID, type: HighlightFeatureTypes.DEFAULT, data: [21, 42] },
						{ id: 'foo', type: HighlightFeatureTypes.DEFAULT, data: [5, 55] }
					]
				}
			}, mockFeatureInfoProvider);
			const map = setupMap();
			handler.register(map);

			map.once('rendercomplete', () => {
				// safe to call map.getPixelFromCoordinate from now on
				startRequest(notMatchingCoordinate);

				setTimeout(() => {

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].id).toBe('foo');

					done();
				}, TestDelay);
			});
		});

		it('adds one FeatureInfo and HighlightFeature from each suitable layer', (done) => {
			const handler = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0),
						createDefaultLayer(layerId1)
					]
				}
			}, mockFeatureInfoProvider);
			const map = setupMap();
			const geometry = new Point(matchingCoordinate);
			const expectedFeatureInfoGeometry = { data: new GeoJSON().writeGeometry(geometry), geometryType: FeatureInfoGeometryTypes.GEOJSON };
			const expectedHighlightFeatureGeometry = { geometry: new GeoJSON().writeGeometry(geometry), geometryType: HighlightGeometryTypes.GEOJSON };
			const olVectorSource0 = new VectorSource();
			const feature0 = new Feature({ geometry: geometry });
			feature0.set('name', 'name0');
			feature0.set('description', 'description0');
			olVectorSource0.addFeature(feature0);
			vectorLayer0.setSource(olVectorSource0);
			map.addLayer(vectorLayer0);

			const olVectorSource1 = new VectorSource();
			const feature1 = new Feature({ geometry: geometry });
			feature1.set('name', 'name1');
			feature1.set('description', 'description1');
			olVectorSource1.addFeature(feature1);
			vectorLayer1.setSource(olVectorSource1);
			map.addLayer(vectorLayer1);

			handler.register(map);

			map.once('rendercomplete', () => {
				// safe to call map.getPixelFromCoordinate from now on
				startRequest(matchingCoordinate);

				//must be called within a timeout function cause implementation delays call of 'resolveQuery'
				setTimeout(() => {
					expect(store.getState().featureInfo.current).toHaveSize(2);
					// ensure correct order of LayerInfo items -> must correspond to layers.active ordering
					expect(store.getState().featureInfo.current[0]).toEqual({
						title: 'name1-layerId1',
						content: 'description1',
						geometry: expectedFeatureInfoGeometry
					});
					expect(store.getState().featureInfo.current[1]).toEqual({
						title: 'name0-layerId0',
						content: 'description0',
						geometry: expectedFeatureInfoGeometry
					});
					expect(store.getState().highlight.features).toHaveSize(2);
					expect(store.getState().highlight.features[0]).toEqual({
						id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID,
						type: HighlightFeatureTypes.DEFAULT,
						data: expectedHighlightFeatureGeometry
					});
					expect(store.getState().highlight.features[1]).toEqual({
						id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID,
						type: HighlightFeatureTypes.DEFAULT,
						data: expectedHighlightFeatureGeometry
					});

					//we update with non matching coordinates
					abortOrReset();
					startRequest(notMatchingCoordinate);

					expect(store.getState().featureInfo.current).toHaveSize(0);
					expect(store.getState().highlight.features).toHaveSize(0);

					startRequest(matchingCoordinate);

					setTimeout(() => {
						expect(store.getState().featureInfo.current).toHaveSize(2);
						expect(store.getState().highlight.features).toHaveSize(2);

						// we modify the first layer so that it is not queryable anymore
						modifyLayer(layerId0, { visible: false });
						abortOrReset();
						startRequest(matchingCoordinate);

						setTimeout(() => {
							expect(store.getState().featureInfo.current).toHaveSize(1);
							expect(store.getState().highlight.features).toHaveSize(1);

							//we modify the second layer so that it is not queryable anymore
							modifyLayer(layerId1, { constraints: { hidden: true } });
							abortOrReset();
							startRequest(matchingCoordinate);

							setTimeout(() => {
								expect(store.getState().featureInfo.current).toHaveSize(0);
								expect(store.getState().highlight.features).toHaveSize(0);

								done();
							}, TestDelay);
						}, TestDelay);
					}, TestDelay);
				}, TestDelay);
			});
		});

		it('adds \'Not_Available\' FeatureInfo items and NO HighlightFeatures when FeatureInfoProvider returns null', (done) => {
			const handler = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0),
						createDefaultLayer(layerId1)
					]
				}
			}, mockNullFeatureInfoProvider);
			const map = setupMap();

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

			map.once('rendercomplete', () => {
				// safe to call map.getPixelFromCoordinate from now on
				startRequest(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(2);
				expect(store.getState().featureInfo.current[0]).toEqual({ title: 'map_olMap_handler_featureInfo_not_available', content: '' });
				expect(store.getState().featureInfo.current[1]).toEqual({ title: 'map_olMap_handler_featureInfo_not_available', content: '' });
				expect(store.getState().highlight.features).toHaveSize(0);

				done();
			});
		});
	});
});
