import { TestUtils } from '../../../../../../test-utils';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { removeHighlightFeature, removeTemporaryHighlightFeature, setHighlightFeature, setTemporaryHighlightFeature } from '../../../../../../../src/store/highlight/highlight.action';
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

	describe('when activate', () => {


		it('registers observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlHighlightLayerHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._unregister).toBeDefined();
		});

		it('sets highlight feature', () => {
			const highlightFeature = { data: { coordinate: [1, 0] } };
			const state = { ...initialState, active: true, feature: highlightFeature };
			const map = setupMap();
			setup(state);

			const handler = new OlHighlightLayerHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._feature.getGeometry().getCoordinates()).toEqual([1, 0]);

		});

		it('sets temporary highlight feature', () => {
			const temporaryFeature = { data: { coordinate: [1, 0] } };
			const state = { ...initialState, active: true, temporaryFeature: temporaryFeature };
			const map = setupMap();
			setup(state);

			const handler = new OlHighlightLayerHandler();
			const actualLayer = handler.activate(map);

			expect(actualLayer).toBeTruthy();
			expect(handler._temporaryFeature.getGeometry().getCoordinates()).toEqual([1, 0]);

		});

		describe('when highlight-state changed', () => {
			const getStyles = (feature) => {
				const styleFunction = feature.getStyle();
				return styleFunction(feature);
			};

			it('positions highlight-features on position', () => {
				const map = setupMap();
				setup();

				const handler = new OlHighlightLayerHandler();
				handler.activate(map);

				setHighlightFeature({ data: { coordinate: [38, 57] } });
				setTemporaryHighlightFeature({ data: { coordinate: [57, 38] } });


				expect(handler._feature).toBeDefined();
				expect(handler._temporaryFeature).toBeDefined();
				expect(handler._feature.getGeometry().getCoordinates()).toEqual([38, 57]);
				expect(handler._temporaryFeature.getGeometry().getCoordinates()).toEqual([57, 38]);
			});

			it('remove styles of highlight-features', () => {
				const highlightFeature = { data: { coordinate: [1, 0] } };
				const temporaryFeature = { data: { coordinate: [0, 1] } };
				const state = { ...initialState, active: true, feature: highlightFeature, temporaryFeature: temporaryFeature };
				const map = setupMap();
				setup(state);

				const handler = new OlHighlightLayerHandler();
				handler.activate(map);

				expect(handler._feature).toBeDefined();
				expect(handler._temporaryFeature).toBeDefined();
				expect(handler._feature.getGeometry().getCoordinates()).toEqual([1, 0]);
				expect(handler._temporaryFeature.getGeometry().getCoordinates()).toEqual([0, 1]);

				removeHighlightFeature();
				removeTemporaryHighlightFeature();

				const featureStyle = getStyles(handler._feature)[0];
				const temporaryFeatureStyle = getStyles(handler._temporaryFeature)[0];

				expect(featureStyle.getFill()).toBeFalsy();
				expect(featureStyle.getStroke()).toBeFalsy();
				expect(featureStyle.getImage()).toBeFalsy();
				expect(temporaryFeatureStyle.getFill()).toBeFalsy();
				expect(temporaryFeatureStyle.getStroke()).toBeFalsy();
				expect(temporaryFeatureStyle.getImage()).toBeFalsy();
			});
		});
	});

	describe('when deactivate', () => {
		it('unregisters observer', () => {
			const map = setupMap();
			setup();

			const handler = new OlHighlightLayerHandler();
			handler.activate(map);
			const spyOnUnregister = spyOn(handler, '_unregister');

			handler.deactivate(map);

			expect(spyOnUnregister).toHaveBeenCalled();
		});


	});
});
