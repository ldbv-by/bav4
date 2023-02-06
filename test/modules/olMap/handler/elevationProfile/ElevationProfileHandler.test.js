import { Feature, View } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { ElevationProfileHandler } from '../../../../../src/modules/olMap/handler/elevationProfile/ElevationProfileHandler';
import { elevationProfileReducer } from '../../../../../src/store/elevationProfile/elevationProfile.reducer';
import { TestUtils } from '../../../../test-utils';

describe('ElevationProfileHandler', () => {
    const initCoordinate = fromLonLat([11, 48]);
    let store;

    const setup = (state = {}) => {
        store = TestUtils.setupStoreAndDi(state, { elevationProfile: elevationProfileReducer });
        return new ElevationProfileHandler();
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
        const pointGeometry = new Point(fromLonLat([11.59036, 48.14165]));
        const vectorSource = new VectorSource({ wrapX: false, features: [new Feature({ geometry: pointGeometry })] });
        const vectorLayer = new VectorLayer({ id: 'foo', source: vectorSource });

        it('changes the elevationProfile store', () => {

        });
    });

});
