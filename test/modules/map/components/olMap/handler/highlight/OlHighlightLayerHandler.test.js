import { TestUtils } from '../../../../../../test-utils';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';

import { OSM, TileDebug } from 'ol/source';
import { OlHighlightLayerHandler } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/OlHighlightLayerHandler';
describe('OlHighlightLayerHandler', () => {
    const initialCenter = fromLonLat([11.57245, 48.14021]);
    const initialState = {
        active: false,
        feature: null,
        temporaryFeature: null
    };

    const setup = (state = initialState) => {
        const highlightState = {
            highlight: state,
            pointer: { beingDragged: false }
        };
        TestUtils.setupStoreAndDi(highlightState, { highlight: highlightReducer });
    };

    const setupMap = () => {
        const container = document.createElement('div');
        return new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new TileLayer({
                    source: new TileDebug(),
                })],
            target: container,
            view: new View({
                center: initialCenter,
                zoom: 1,
            }),
        });

    };

    it('instantiates the handler', () => {
        setup();
        const handler = new OlHighlightLayerHandler();

        expect(handler).toBeTruthy();
        expect(handler.id).toBe('highlight_layer');
        expect(handler._storeService.getStore()).toBeDefined();
        expect(handler._unregister).toBeDefined();
    });
});