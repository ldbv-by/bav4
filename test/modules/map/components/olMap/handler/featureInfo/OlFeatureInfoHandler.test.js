import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OlFeatureInfoHandler } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/OlFeatureInfoHandler';
import { featureInfoReducer } from '../../../../../../../src/store/featureInfo/featureInfo.reducer';
import { TestUtils } from '../../../../../../test-utils';
import { updateCoordinate } from '../../../../../../../src/store/featureInfo/featureInfo.action';
import { fromLonLat } from 'ol/proj';
import { createDefaultLayer, layersReducer } from '../../../../../../../src/store/layers/layers.reducer';

describe('OlFeatureInfoHandler', () => {

	const matchingCoordinate = fromLonLat([11, 48]);
	const notMatchingCoordinate = fromLonLat([5, 12]);

	const setup = (state = {}) => {
		return TestUtils.setupStoreAndDi(state, { featureInfo: featureInfoReducer, layers: layersReducer });
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

	it('instantiates the handler', () => {
		setup();
		const handler = new OlFeatureInfoHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Feature_Info_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when featureInfo store changes', () => {
		const layerId0 = 'layerId0';
		const layerId1 = 'layerId1';
		let vectorLayer0;
		let vectorLayer1;

		beforeEach(() => {
			vectorLayer0 = new VectorLayer({ properties: { id: layerId0 } });
			vectorLayer1 = new VectorLayer({ properties: { id: layerId1 } });
		});

		it('adds exactly one FeatureInfo per layer', () => {
			const store = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0)
					]
				}
			});
			const handler = new OlFeatureInfoHandler();
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

			map.once('postrender', () => {
				// safe to call map.getPixelFromCoordinate from now on
				updateCoordinate(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(1);

				updateCoordinate(notMatchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(0);
			});
		});

		it('adds one FeatureInfo from each layer', () => {
			const store = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0),
						createDefaultLayer(layerId1)
					]
				}
			});
			const handler = new OlFeatureInfoHandler();
			const map = setupMap();
			const geometry = new Point(matchingCoordinate);
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

			map.once('postrender', () => {
				// safe to call map.getPixelFromCoordinate from now on
				updateCoordinate(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(2);
				//ensure correct order of LayerInfo items, must correspond to layers.active
				expect(store.getState().featureInfo.current[0]).toEqual({ title: 'name1', content: 'description1' });
				expect(store.getState().featureInfo.current[1]).toEqual({ title: 'name0', content: 'description0' });

				updateCoordinate(notMatchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(0);
			});
		});

		it('adds NO FeatureInfo when properties are missing', () => {
			const store = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0),
						createDefaultLayer(layerId1)
					]
				}
			});
			const handler = new OlFeatureInfoHandler();
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

			map.once('postrender', () => {
				// safe to call map.getPixelFromCoordinate from now on
				updateCoordinate(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(0);
			});
		});

		it('adds FeatureInfo when feature contains a name  or a description property only', () => {
			const store = setup({
				layers: {
					active: [
						createDefaultLayer(layerId0),
						createDefaultLayer(layerId1)
					]
				}
			});
			const handler = new OlFeatureInfoHandler();
			const map = setupMap();
			const geometry = new Point(matchingCoordinate);
			const olVectorSource0 = new VectorSource();
			const feature0 = new Feature({ geometry: geometry });
			feature0.set('name', 'name0');
			olVectorSource0.addFeature(feature0);
			vectorLayer0.setSource(olVectorSource0);
			map.addLayer(vectorLayer0);

			const olVectorSource1 = new VectorSource();
			const feature1 = new Feature({ geometry: geometry });
			feature1.set('description', 'description1');
			olVectorSource1.addFeature(feature1);
			vectorLayer1.setSource(olVectorSource1);
			map.addLayer(vectorLayer1);

			handler.register(map);

			map.once('postrender', () => {
				// safe to call map.getPixelFromCoordinate from now on
				updateCoordinate(matchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(2);
				//ensure correct order of LayerInfo items, must correspond to layers.active
				expect(store.getState().featureInfo.current[0]).toEqual({ title: null, content: 'description1' });
				expect(store.getState().featureInfo.current[1]).toEqual({ title: 'name0', content: null });

				updateCoordinate(notMatchingCoordinate);

				expect(store.getState().featureInfo.current).toHaveSize(0);
			});
		});
	});
});
