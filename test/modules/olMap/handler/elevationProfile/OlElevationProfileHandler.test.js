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
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { Tools } from '../../../../../src/domain/tools';
import { $injector } from '../../../../../src/injection';
import { indicateChange } from '../../../../../src/store/elevationProfile/elevationProfile.action';

describe('OlElevationProfileHandler', () => {
	const initCoordinate = fromLonLat([11, 48]);
	const defaultState = {
		elevationProfile: {
			active: false,
			id: null
		},
		tools: {
			current: OlElevationProfileHandler.SUPPORTED_TOOL_IDS[0]
		}
	};
	const elevationService = {
		requestProfile() {}
	};

	let store;
	const setup = (state = defaultState) => {
		store = TestUtils.setupStoreAndDi(state, { elevationProfile: elevationProfileReducer, tools: toolsReducer });
		$injector.registerSingleton('ElevationService', elevationService);
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

	describe('class', () => {
		it('defines constant values', async () => {
			expect(OlElevationProfileHandler.SUPPORTED_TOOL_IDS).toEqual([Tools.DRAW, Tools.MEASURE]);
		});
	});

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
		describe('and a non-configured tool is active', () => {
			it('does NOT add a listener for select events', () => {
				setup({
					...defaultState,
					tools: {
						current: 'anyUnsupportedToolId'
					}
				});
				const map = getSelectableMapWith([]);

				const select = new Select({ condition: click });
				const handler = new OlElevationProfileHandler();
				const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

				handler.register(map);
				map.addInteraction(select);

				expect(updateListenerSpy).not.toHaveBeenCalled();
				expect(handler._mapListeners[InteractionStateType.SELECT]).toHaveSize(0);
			});

			it('does NOT add a listener for modify events', () => {
				setup({
					...defaultState,
					tools: {
						current: 'anyUnsupportedToolId'
					}
				});
				const map = setupMap();
				const vectorSource = new VectorSource({ wrapX: false, features: [] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

				map.addLayer(vectorLayer);

				const modify = new Modify({ source: vectorSource });
				const handler = new OlElevationProfileHandler();
				const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

				handler.register(map);
				map.addInteraction(modify);

				expect(updateListenerSpy).not.toHaveBeenCalled();
				expect(handler._mapListeners[InteractionStateType.MODIFY]).toHaveSize(0);
			});

			it('does NOT remove a listener for select events', () => {
				setup({
					...defaultState,
					tools: {
						current: 'anyUnsupportedToolId'
					}
				});
				const map = getSelectableMapWith([]);

				const select = new Select({ condition: click });
				const handler = new OlElevationProfileHandler();
				const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

				handler.register(map);
				map.addInteraction(select);

				map.removeInteraction(select);

				expect(updateListenerSpy).not.toHaveBeenCalled();
			});

			it('does NOT remove a listener for modify events', () => {
				setup({
					...defaultState,
					tools: {
						current: 'anyUnsupportedToolId'
					}
				});
				const map = setupMap();
				const vectorSource = new VectorSource({ wrapX: false, features: [] });
				const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

				map.addLayer(vectorLayer);

				const modify = new Modify({ source: vectorSource });
				const handler = new OlElevationProfileHandler();
				const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

				handler.register(map);
				map.addInteraction(modify);

				map.removeInteraction(modify);

				expect(updateListenerSpy).not.toHaveBeenCalled();
			});
		});

		describe('and a non-configured tool is active', () => {
			it('adds listener for select events', () => {
				const expectedListenerCount = 1 + 1; // ['add'listener] + ['remove'-listener]
				setup({ ...defaultState });
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
				setup({ ...defaultState });
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
				setup({ ...defaultState });
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
				setup({ ...defaultState });
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
				setup({ ...defaultState });
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
				setup({ ...defaultState, id: 'id' });
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

				expect(store.getState().elevationProfile.id).toBeNull();
			});

			it('does NOT removes listener for non-select events', () => {
				setup({ ...defaultState });
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
	});

	describe('when feature selections changes', () => {
		it('does NOT calls the ElevationService for selected Point geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).not.toHaveBeenCalled();
		});

		it('calls the ElevationService for selected LineString geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledOnceWith([
				[2, 2],
				[3, 3]
			]);
		});

		it('calls the ElevationService for selected LinearRing geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledOnceWith([
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0]
			]);
		});

		it('calls the ElevationService for selected Polygon geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledOnceWith([
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			]);
		});

		it('does NOT call the ElevationService for selected MultiPolygon geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).not.toHaveBeenCalled();
		});

		it('calls the ElevationService for multi select geometry for the first selected feature', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledWith([
				[2, 2],
				[3, 3]
			]);
		});

		it('does NOT calls the ElevationService for deselect, but updates store', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile').and.callFake(() => indicateChange('id'));
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalled();
			expect(store.getState().elevationProfile.id).toBe('id');

			updateCoordinatesSpy.calls.reset();
			elevationServiceSpy.calls.reset();
			select.getFeatures().clear();

			expect(updateCoordinatesSpy).toHaveBeenCalled();
			expect(elevationServiceSpy).not.toHaveBeenCalled();
			expect(store.getState().elevationProfile.id).toBeNull();
		});
	});

	describe('when feature modifications changes', () => {
		it('does NOT call the ElevationService for modified Point geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).not.toHaveBeenCalled();
		});

		it('calls the ElevationService for modified LineString geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledWith([
				[2, 2],
				[3, 3]
			]);
		});

		it('calls the ElevationService for modified Polygon geometry', () => {
			const elevationServiceSpy = spyOn(elevationService, 'requestProfile');
			setup({ ...defaultState });
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
			expect(elevationServiceSpy).toHaveBeenCalledWith([
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0]
			]);
		});
	});
});
