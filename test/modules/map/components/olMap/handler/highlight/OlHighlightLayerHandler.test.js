import { TestUtils } from '../../../../../../test-utils';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { removeHighlightFeature, removeTemporaryHighlightFeature, setHighlightFeature, setTemporaryHighlightFeature } from '../../../../../../../src/store/highlight/highlight.action';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OlHighlightLayerHandler } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/OlHighlightLayerHandler';
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';

describe('OlHighlightLayerHandler', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialState = {
		active: false,
		features: [],
		temporaryFeatures: []
	};

	const setup = (state = initialState) => {
		const highlightState = {
			highlight: state
		};
		TestUtils.setupStoreAndDi(highlightState, { highlight: highlightReducer });
	};

	const setupMap = () => {
		const container = document.createElement('div');
		return new Map({
			layers: [],
			target: container,
			view: new View({
				center: initialCenter,
				zoom: 1
			})
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

	describe('when handler is activated', () => {

		describe('and NO highlight features are available', () => {

			it('adds NO ol features', () => {
				const map = setupMap();
				setup();
				const handler = new OlHighlightLayerHandler();

				const olLayer = handler.activate(map);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(0);
			});
		});

		describe('and highlight features are available', () => {

			it('adds ol features', () => {
				const highlightFeature = { data: { coordinate: [1, 0] } };
				const temporaryFeature = { data: { coordinate: [3, 4] } };
				const state = { ...initialState, active: true, features: [highlightFeature], temporaryFeatures: [temporaryFeature] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();

				const olLayer = handler.activate(map);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(2);
				expect(olFeatures[0].getGeometry().getCoordinates()).toEqual([1, 0]);
				expect(olFeatures[0].getStyle()()).toEqual(highlightFeatureStyleFunction());
				expect(olFeatures[1].getGeometry().getCoordinates()).toEqual([3, 4]);
				expect(olFeatures[1].getStyle()()).toEqual(highlightTemporaryFeatureStyleFunction());
			});
		});

		describe('and highlight features are added', () => {

			it('add ol features', () => {
				const map = setupMap();
				setup();
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				setHighlightFeature({ data: { coordinate: [38, 57] } });
				setTemporaryHighlightFeature({ data: { coordinate: [57, 38] } });

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(2);
				expect(olFeatures[0].getGeometry().getCoordinates()).toEqual([38, 57]);
				expect(olFeatures[0].getStyle()()).toEqual(highlightFeatureStyleFunction());
				expect(olFeatures[1].getGeometry().getCoordinates()).toEqual([57, 38]);
				expect(olFeatures[1].getStyle()()).toEqual(highlightTemporaryFeatureStyleFunction());
			});
		});

		describe('and highlight features are removed', () => {

			it('removes ol features', () => {
				const highlightFeature = { data: { coordinate: [1, 0] } };
				const temporaryFeature = { data: { coordinate: [3, 4] } };
				const state = { ...initialState, active: true, features: [highlightFeature], temporaryFeatures: [temporaryFeature] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				removeHighlightFeature();

				let olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(1);

				removeTemporaryHighlightFeature();

				olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(0);
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
