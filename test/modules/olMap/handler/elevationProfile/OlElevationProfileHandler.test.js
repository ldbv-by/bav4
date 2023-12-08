import { Feature, View, Map, Collection } from 'ol';
import { click } from 'ol/events/condition';
import { LinearRing, LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { Draw, Modify, Select } from 'ol/interaction';
import { ModifyEvent } from 'ol/interaction/Modify';
import VectorLayer from 'ol/layer/Vector';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { OlElevationProfileHandler } from '../../../../../src/modules/olMap/handler/elevationProfile/OlElevationProfileHandler';
import { InteractionStateType } from '../../../../../src/modules/olMap/utils/olInteractionUtils';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../../test-utils';

describe('OlElevationProfileHandler', () => {
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

	const getSelectableMapWith = (features) => {
		const map = setupMap();
		const vectorSource = new VectorSource({ wrapX: false, features: features });
		const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

		map.addLayer(vectorLayer);

		return map;
	};

	describe('constructor', () => {
		it('initializes listeners', async () => {
			setup();

			const instanceUnderTest = new OlElevationProfileHandler();
			expect(instanceUnderTest._mapListeners[InteractionStateType.SELECT]).toEqual([]);
			expect(instanceUnderTest._mapListeners[InteractionStateType.MODIFY]).toEqual([]);
			expect(instanceUnderTest._map).toBeNull();
		});
	});

	it('instantiates the handler', () => {
		setup();
		const handler = new OlElevationProfileHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Elevation_Profile_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when map interactions changes', () => {
		it('adds listener for select events', () => {
			const expectedListenerCount = 1 + 1; // ['add'listener] + ['remove'-listener]
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const map = getSelectableMapWith([]);

			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(expectedListenerCount);
		});

		it('adds listener for modify events', () => {
			const expectedListenerCount = 1; // ['modifyend'listener]
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const modify = new Modify({ source: vectorSource });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

			handler.register(map);
			map.addInteraction(modify);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.MODIFY]).toHaveSize(expectedListenerCount);
		});

		it('does NOT add listener for other interaction events', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const draw = new Draw({ source: vectorSource, type: 'Polygon', minPoints: 2 });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callFake(() => {});

			handler.register(map);
			map.addInteraction(draw);

			expect(updateListenerSpy).not.toHaveBeenCalled();
		});

		it('removes listener for select events', () => {
			const expectedListenerCount = 1 + 1; // ['add'listener] + ['remove'-listener]
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const map = getSelectableMapWith([]);

			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(expectedListenerCount);
			updateListenerSpy.calls.reset();

			map.removeInteraction(select);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(0);
		});

		it('removes listener for modify events', () => {
			const expectedListenerCount = 1; // ['modifyend'listener]
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const modify = new Modify({ source: vectorSource });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

			handler.register(map);
			map.addInteraction(modify);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.MODIFY]).toHaveSize(expectedListenerCount);
			updateListenerSpy.calls.reset();

			map.removeInteraction(modify);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.MODIFY]).toHaveSize(0);
		});

		it('resets store when select interaction is removed', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const lineString = new LineString([
				[2, 2],
				[3, 3]
			]);
			const feature = new Feature({ geometry: lineString });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			handler.register(map);

			map.addInteraction(select);
			select.getFeatures().push(feature);
			map.removeInteraction(select);

			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});

		it('does NOT removes listener for non-select events', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const expectedListenerCount = 1 + 1; // ['add'listener] + ['remove'-listener]
			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const select = new Select({ condition: click });
			const draw = new Draw({ source: vectorSource, type: 'Polygon', minPoints: 2 });
			const handler = new OlElevationProfileHandler();
			const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

			handler.register(map);
			map.addInteraction(select);
			map.addInteraction(draw);

			expect(updateListenerSpy).toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(expectedListenerCount);
			updateListenerSpy.calls.reset();

			map.removeInteraction(draw);

			expect(updateListenerSpy).not.toHaveBeenCalled();
			expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(expectedListenerCount);
		});
	});

	describe('when feature selections changes', () => {
		it('changes the elevationProfile store for selected Point geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const point = new Point(fromLonLat([11.59036, 48.14165]));
			const feature = new Feature({ geometry: point });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});

		it('changes the elevationProfile store for selected LineString geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const lineString = new LineString([
				[2, 2],
				[3, 3]
			]);
			const feature = new Feature({ geometry: lineString });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[2, 2],
				[3, 3]
			]);
		});

		it('changes the elevationProfile store for selected LinearRing geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const linearRing = new LinearRing([
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]);
			const feature = new Feature({ geometry: linearRing });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]);
		});

		it('changes the elevationProfile store for selected Polygon geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const polygon = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]);
			const feature = new Feature({ geometry: polygon });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			]);
		});

		it('changes the elevationProfile store for selected MultiPolygon geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const multiPolygon = new MultiPolygon([
				new Polygon([
					[
						[3, 3],
						[4, 4],
						[4, 3],
						[3, 3]
					]
				]),
				new Polygon([
					[
						[5, 5],
						[6, 6],
						[5, 6],
						[5, 5]
					]
				])
			]);
			const feature = new Feature({ geometry: multiPolygon });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});

		it('changes the elevationProfile store for multi select geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const lineString1 = new LineString([
				[2, 2],
				[3, 3]
			]);
			const lineString2 = new LineString([
				[4, 4],
				[5, 5]
			]);
			const feature1 = new Feature({ geometry: lineString1 });
			const feature2 = new Feature({ geometry: lineString2 });
			const map = getSelectableMapWith([feature1, feature2]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature1);
			select.getFeatures().push(feature2);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});

		it('changes the elevationProfile store for deselect', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const lineString = new LineString([
				[2, 2],
				[3, 3]
			]);
			const feature = new Feature({ geometry: lineString });
			const map = getSelectableMapWith([feature]);
			const select = new Select({ condition: click });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateSelectCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(select);

			select.getFeatures().push(feature);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[2, 2],
				[3, 3]
			]);

			updateCoordinatesSpy.calls.reset();
			select.getFeatures().clear();

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});
	});

	describe('when feature modifications changes', () => {
		it('changes the elevationProfile store for modified Point geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const point = new Point(fromLonLat([11.59036, 48.14165]));
			const feature = new Feature({ geometry: point });
			const features = new Collection([feature]);
			const modifyEvent = new ModifyEvent('modifyend', features, new Event(MapBrowserEventType.POINTERUP));

			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [feature] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const modify = new Modify({ source: vectorSource });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateModifyCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(modify);
			modify.dispatchEvent(modifyEvent);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([]);
		});

		it('changes the elevationProfile store for modified LineString geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const lineString = new LineString([
				[2, 2],
				[3, 3]
			]);
			const feature = new Feature({ geometry: lineString });
			const features = new Collection([feature]);
			const modifyEvent = new ModifyEvent('modifyend', features, new Event(MapBrowserEventType.POINTERUP));

			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [feature] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const modify = new Modify({ source: vectorSource });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateModifyCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(modify);
			modify.dispatchEvent(modifyEvent);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[2, 2],
				[3, 3]
			]);
		});

		it('changes the elevationProfile store for modified Polygon geometry', () => {
			store = setup({ ...defaultState, coordinates: [[0, 0][(1, 1)]] });
			const polygon = new Polygon([
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]);
			const feature = new Feature({ geometry: polygon });
			const features = new Collection([feature]);
			const modifyEvent = new ModifyEvent('modifyend', features, new Event(MapBrowserEventType.POINTERUP));

			const map = setupMap();
			const vectorSource = new VectorSource({ wrapX: false, features: [feature] });
			const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

			map.addLayer(vectorLayer);

			const modify = new Modify({ source: vectorSource });
			const handler = new OlElevationProfileHandler();
			const updateCoordinatesSpy = spyOn(handler, '_updateModifyCoordinates').and.callThrough();

			handler.register(map);
			map.addInteraction(modify);
			modify.dispatchEvent(modifyEvent);

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.coordinates).toEqual([
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			]);
		});
	});
});
