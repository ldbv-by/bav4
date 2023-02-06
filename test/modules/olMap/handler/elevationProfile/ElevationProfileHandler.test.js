import { Feature, View, Map } from 'ol';
import { click } from 'ol/events/condition';
import { Point } from 'ol/geom';
import { Select } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { ElevationProfileHandler } from '../../../../../src/modules/olMap/handler/elevationProfile/ElevationProfileHandler';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../../test-utils';

describe('ElevationProfileHandler', () => {
	const initCoordinate = fromLonLat([11, 48]);
	const defaultState = {
		elevationProfile: {
			active: false,
			coordinates: []
		}
	};

	let store;

	const setup = (state = defaultState) => {
		return TestUtils.setupStoreAndDi(state, { elevationProfile: elevationProfileReducer });
	};


	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: initCoordinate,
				zoom: 1
			})
		});
	};

	describe('constructor', () => {

		it('initializes listeners', async () => {
			setup();

			const instanceUnderTest = new ElevationProfileHandler();
			expect(instanceUnderTest._listeners).toEqual([]);
		});
	});

	it('instantiates the handler', () => {
		setup();
		const handler = new ElevationProfileHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Elevation_Profile_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when map selections changes', () => {

		const getSelectableMapWith = (feature) => {

			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [feature] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			return map;
		};

		it('changes the elevationProfile store for Point geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
			const pointGeometry = new Point(fromLonLat([11.59036, 48.14165]));
			const feature = new Feature({ geometry: pointGeometry });
			const map = getSelectableMapWith(feature);
			const select = new Select({ condition: click });
			const handler = new ElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});
	});

});
