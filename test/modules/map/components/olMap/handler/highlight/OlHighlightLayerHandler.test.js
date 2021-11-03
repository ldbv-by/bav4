import { TestUtils } from '../../../../../../test-utils';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, HighlightGeometryTypes, removeHighlightFeatures } from '../../../../../../../src/store/highlight/highlight.action';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OlHighlightLayerHandler } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/OlHighlightLayerHandler';
import { highlightFeatureStyleFunction, highlightTemporaryFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';

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
		expect(handler.options).toEqual({ preventDefaultClickHandling: false, preventDefaultContextClickHandling: false });
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
				const highlightFeature = [{ data: { coordinate: [1, 0] } }, { data: { coordinate: [2, 1] } }];
				const temporaryFeature = [{ data: { coordinate: [3, 4] } }];
				const state = { ...initialState, active: true, features: highlightFeature, temporaryFeatures: temporaryFeature };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();

				const olLayer = handler.activate(map);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(3);
				expect(olFeatures[0].getStyle()()).toEqual(highlightFeatureStyleFunction());
				expect(olFeatures[1].getStyle()()).toEqual(highlightFeatureStyleFunction());
				expect(olFeatures[2].getStyle()()).toEqual(highlightTemporaryFeatureStyleFunction());
			});
		});

		describe('and highlight features are added', () => {

			it('add ol features', () => {
				const map = setupMap();
				setup();
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				addHighlightFeatures([{ data: { coordinate: [21, 42] } }, { data: { coordinate: [38, 57] } }]);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(2);
				expect(olFeatures[0].getStyle()()).toEqual(highlightFeatureStyleFunction());
				expect(olFeatures[1].getStyle()()).toEqual(highlightFeatureStyleFunction());
			});
		});

		describe('and highlight features are removed', () => {

			it('removes ol features', () => {
				const highlightFeature = { data: { coordinate: [1, 0] } };
				const state = { ...initialState, active: true, features: [highlightFeature], temporaryFeatures: [] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				removeHighlightFeatures();

				const olFeatures = olLayer.getSource().getFeatures();
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


	describe('_toOlFeature', () => {

		it('maps different kind of highlight features to ol features', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightCoordinateFeature = { data: { coordinate: [1, 0] } };
			const highlightGeometryWktFeature = { data: { geometry: new WKT().writeGeometry(new Point([21, 42])), geometryType: HighlightGeometryTypes.WKT } };
			const highlightGeometryGeoJsonFeature = { data: { geometry: new GeoJSON().writeGeometry(new Point([5, 10])), geometryType: HighlightGeometryTypes.GEOJSON } };
			const unknownHighlightFeatureType = { data: { geometry: new GeoJSON().writeGeometry(new Point([5, 10])), geometryType: -1 } };

			expect(handler._toOlFeature(highlightCoordinateFeature).getGeometry().getCoordinates()).toEqual(highlightCoordinateFeature.data.coordinate);
			expect(handler._toOlFeature(highlightGeometryWktFeature).getGeometry().getCoordinates()).toEqual([21, 42]);
			expect(handler._toOlFeature(highlightGeometryGeoJsonFeature).getGeometry().getCoordinates()).toEqual([5, 10]);
			expect(handler._toOlFeature(unknownHighlightFeatureType)).toBeNull();
		});
	});
});
