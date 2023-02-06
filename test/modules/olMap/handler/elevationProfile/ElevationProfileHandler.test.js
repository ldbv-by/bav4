import { Feature, View, Map, Observable } from 'ol';
import { click } from 'ol/events/condition';
import { LinearRing, LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { Modify, Select } from 'ol/interaction';
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

    describe('when map interactions changes', () => {

        const expectedListenerCount = 1 + 1; // ['add'listener] + ['remove'-listener]

        it('adds listener for select events', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const map = getSelectableMapWith([]);

            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();


            handler.register(map);
            map.addInteraction(select);


            expect(updateListenerSpy).toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(expectedListenerCount);
        });

        it('does NOT add listener for non-select events', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const map = setupMap();
            const vectorSource = new VectorSource({ wrapX: false, features: [] });
            const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

            map.addLayer(vectorLayer);

            const modify = new Modify({ source: vectorSource });
            const handler = new ElevationProfileHandler();
            const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();


            handler.register(map);
            map.addInteraction(modify);


            expect(updateListenerSpy).not.toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(0);
        });

        it('removes listener for select events', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const map = getSelectableMapWith([]);

            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

            handler.register(map);
            map.addInteraction(select);

            expect(updateListenerSpy).toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(expectedListenerCount);
            updateListenerSpy.calls.reset();

            map.removeInteraction(select);

            expect(updateListenerSpy).toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(0);
        });

        it('does NOT removes listener for non-select events', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const map = setupMap();
            const vectorSource = new VectorSource({ wrapX: false, features: [] });
            const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

            map.addLayer(vectorLayer);

            const select = new Select({ condition: click });
            const modify = new Modify({ source: vectorSource });
            const handler = new ElevationProfileHandler();
            const updateListenerSpy = spyOn(handler, '_updateListener').and.callThrough();

            handler.register(map);
            map.addInteraction(select);
            map.addInteraction(modify);

            expect(updateListenerSpy).toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(expectedListenerCount);
            updateListenerSpy.calls.reset();

            map.removeInteraction(modify);

            expect(updateListenerSpy).not.toHaveBeenCalled();
            expect(handler._listeners).toHaveSize(expectedListenerCount);
        });
    });

    describe('when map selections changes', () => {


        it('changes the elevationProfile store for Point geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const point = new Point(fromLonLat([11.59036, 48.14165]));
            const feature = new Feature({ geometry: point });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([]);
        });

        it('changes the elevationProfile store for LineString geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const lineString = new LineString([[2, 2], [3, 3]]);
            const feature = new Feature({ geometry: lineString });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([[2, 2], [3, 3]]);
        });

        it('changes the elevationProfile store for LinearRing geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const linearRing = new LinearRing([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
            const feature = new Feature({ geometry: linearRing });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
        });
        it('changes the elevationProfile store for Polygon geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
            const feature = new Feature({ geometry: polygon });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]);
        });

        it('changes the elevationProfile store for MultiPolygon geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const multiPolygon = new MultiPolygon([new Polygon([[[3, 3], [4, 4], [4, 3], [3, 3]]]), new Polygon([[[5, 5], [6, 6], [5, 6], [5, 5]]])]);
            const feature = new Feature({ geometry: multiPolygon });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([]);
        });

        it('changes the elevationProfile store for multi select geometry', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const lineString1 = new LineString([[2, 2], [3, 3]]);
            const lineString2 = new LineString([[4, 4], [5, 5]]);
            const feature1 = new Feature({ geometry: lineString1 });
            const feature2 = new Feature({ geometry: lineString2 });
            const map = getSelectableMapWith([feature1, feature2]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature1);
            select.getFeatures().push(feature2);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([]);
        });

        it('changes the elevationProfile store for deselect', () => {
            store = setup({ ...defaultState, coordinates: [[0, 0][1, 1]] });
            const lineString = new LineString([[2, 2], [3, 3]]);
            const feature = new Feature({ geometry: lineString });
            const map = getSelectableMapWith([feature]);
            const select = new Select({ condition: click });
            const handler = new ElevationProfileHandler();
            const updateCoordinatesSpy = spyOn(handler, '_updateCoordinates').and.callThrough();


            handler.register(map);
            map.addInteraction(select);

            select.getFeatures().push(feature);

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([[2, 2], [3, 3]]);

            updateCoordinatesSpy.calls.reset();
            select.getFeatures().clear();

            expect(updateCoordinatesSpy).toHaveBeenCalled();
            expect(store.getState().elevationProfile.coordinates).toEqual([]);
        });
    });

});
