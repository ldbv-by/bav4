import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OlFeatureInfoHandler } from '../../../../../../../src/modules/map/components/olMap/handler/featureInfo/OlFeatureInfoHandler';
import { featureInfoReducer } from '../../../../../../../src/store/featureInfo/featureInfo.reducer';
import { TestUtils } from '../../../../../../test-utils';
import { updateCoordinate } from '../../../../../../../src/store/featureInfo/featureInfo.action';
import { fromLonLat } from 'ol/proj';

describe('OlFeatureInfoHandler', () => {

	const coordinate = [11, 48];
	const setup = (state = {}) => {
		return TestUtils.setupStoreAndDi(state, { featureInfo: featureInfoReducer });
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: fromLonLat(coordinate),
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

		describe('and coordinate does NOT match', () => {

			it('adds no FeatureInfo', () => {
				const store = setup();
				const handler = new OlFeatureInfoHandler();
				const olVectorSource = new VectorSource();
				const geometry = new Point(fromLonLat(coordinate));
				const feature = new Feature({ geometry: geometry });
				feature.set('name', 'name');
				olVectorSource.addFeature(feature);
				const vectorLayer = new VectorLayer({ source: olVectorSource });
				const map = setupMap();
				map.addLayer(vectorLayer);
				handler.register(map);

				map.once('postrender', () => {
					// safe to call map.getPixelFromCoordinate from now on
					updateCoordinate(fromLonLat([21, 42]));

					expect(store.getState().featureInfo.current).toHaveSize(0);
				});

			});
		});

		describe('and coordinate does match', () => {

			it('adds exactly one FeatureInfo', () => {
				const store = setup();
				const handler = new OlFeatureInfoHandler();
				const olVectorSource = new VectorSource();
				const geometry = new Point(fromLonLat(coordinate));
				const feature0 = new Feature({ geometry: geometry });
				feature0.set('name', 'name0');
				feature0.set('description', 'description0');
				olVectorSource.addFeature(feature0);
				const feature1 = new Feature({ geometry: geometry });
				feature1.set('name', 'name1');
				feature1.set('description', 'description1');
				olVectorSource.addFeature(feature1);
				const vectorLayer = new VectorLayer({ source: olVectorSource });
				const map = setupMap();
				map.addLayer(vectorLayer);
				handler.register(map);

				map.once('postrender', () => {
					// safe to call map.getPixelFromCoordinate from now on
					updateCoordinate(fromLonLat(coordinate));

					expect(store.getState().featureInfo.current).toHaveSize(1);
				});
			});

			it('adds NO FeatureInfo when properties are missing', () => {
				const store = setup();
				const handler = new OlFeatureInfoHandler();
				const olVectorSource = new VectorSource();
				const geometry = new Point(fromLonLat(coordinate));
				const feature = new Feature({ geometry: geometry });
				olVectorSource.addFeature(feature);
				const vectorLayer = new VectorLayer({ source: olVectorSource });
				const map = setupMap();
				map.addLayer(vectorLayer);
				handler.register(map);

				map.once('postrender', () => {
					// safe to call map.getPixelFromCoordinate from now on
					updateCoordinate(fromLonLat(coordinate));

					expect(store.getState().featureInfo.current).toHaveSize(0);
				});
			});

			it('adds FeatureInfo when feature contains a name property only', () => {
				const store = setup();
				const handler = new OlFeatureInfoHandler();
				const olVectorSource = new VectorSource();
				const geometry = new Point(fromLonLat(coordinate));
				const feature = new Feature({ geometry: geometry });
				feature.set('name', 'name');
				olVectorSource.addFeature(feature);
				const vectorLayer = new VectorLayer({ source: olVectorSource });
				const map = setupMap();
				map.addLayer(vectorLayer);
				handler.register(map);

				map.once('postrender', () => {
					// safe to call map.getPixelFromCoordinate from now on
					updateCoordinate(fromLonLat(coordinate));

					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().featureInfo.current[0]).toEqual({ title: 'name', content: null });
				});
			});

			it('adds FeatureInfo when feature contains a description property only', () => {
				const store = setup();
				const handler = new OlFeatureInfoHandler();
				const olVectorSource = new VectorSource();
				const geometry = new Point(fromLonLat(coordinate));
				const feature = new Feature({ geometry: geometry });
				feature.set('description', 'description');
				olVectorSource.addFeature(feature);
				const vectorLayer = new VectorLayer({ source: olVectorSource });
				const map = setupMap();
				map.addLayer(vectorLayer);
				handler.register(map);

				map.once('postrender', () => {
					// safe to call map.getPixelFromCoordinate from now on
					updateCoordinate(fromLonLat(coordinate));

					expect(store.getState().featureInfo.current).toHaveSize(1);
					expect(store.getState().featureInfo.current[0]).toEqual({ title: null, content: 'description' });
				});
			});
		});
	});
});
