import { TestUtils } from '../../../../../../test-utils';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, clearHighlightFeatures, HighlightFeatureTypes, HighlightGeometryTypes } from '../../../../../../../src/store/highlight/highlight.action';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OlHighlightLayerHandler } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/OlHighlightLayerHandler';
import { highlightCoordinateFeatureStyleFunction, highlightGeometryFeatureStyleFunction, highlightTemporaryCoordinateFeatureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/highlight/styleUtils';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';
import { Feature } from 'ol';

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
		expect(handler._unregister()).toEqual((() => { })());
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
				const highlightFeature = [{ type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [1, 0] } }, { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [2, 1] } }];
				const temporaryFeature = [{ type: HighlightFeatureTypes.TEMPORARY, data: { coordinate: [3, 4] } }];
				const state = { ...initialState, active: true, features: [...highlightFeature, ...temporaryFeature] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();

				const olLayer = handler.activate(map);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(3);
			});
		});

		describe('and highlight features are added', () => {

			it('add ol features', () => {
				const map = setupMap();
				setup();
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				addHighlightFeatures([{ type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } }, { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [38, 57] } }]);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(2);
			});
		});

		describe('and highlight features are removed', () => {

			it('removes ol features', () => {
				const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [1, 0] } };
				const state = { ...initialState, active: true, features: [highlightFeature], temporaryFeatures: [] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				clearHighlightFeatures();

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

		it('maps features containing data as HighlightCoordinate', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const highlightCoordinateFeature = { data: { coordinate: [1, 0] } };

			expect(handler._toOlFeature(highlightCoordinateFeature).getGeometry().getCoordinates()).toEqual(highlightCoordinateFeature.data.coordinate);
			expect(appendStyleSpy).toHaveBeenCalledTimes(1);
		});

		it('maps features containing data as HighlightGeometry', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const highlightGeometryWktFeature = { data: { geometry: new WKT().writeGeometry(new Point([21, 42])), geometryType: HighlightGeometryTypes.WKT } };
			const highlightGeometryGeoJsonFeature = { data: { geometry: new GeoJSON().writeGeometry(new Point([5, 10])), geometryType: HighlightGeometryTypes.GEOJSON } };

			expect(handler._toOlFeature(highlightGeometryWktFeature).getGeometry().getCoordinates()).toEqual([21, 42]);
			expect(handler._toOlFeature(highlightGeometryGeoJsonFeature).getGeometry().getCoordinates()).toEqual([5, 10]);
			expect(appendStyleSpy).toHaveBeenCalledTimes(2);
		});

		it('maps features with an invalid type', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const unknownHighlightFeatureType = { data: { geometry: new GeoJSON().writeGeometry(new Point([5, 10])), geometryType: -1 } };

			expect(handler._toOlFeature(unknownHighlightFeatureType)).toBeNull();
			expect(appendStyleSpy).not.toHaveBeenCalled();
		});
	});

	describe('_appendStyle', () => {

		it('sets the correct style features containing a HighlightCoordinate', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightCoordinateFeature0 = { data: { coordinate: [1, 0] }, type: HighlightFeatureTypes.DEFAULT };
			const highlightCoordinateFeature1 = { data: { coordinate: [1, 0] }, type: HighlightFeatureTypes.TEMPORARY };

			const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));
			const styledFeature1 = handler._appendStyle(highlightCoordinateFeature1, new Feature(new Point([5, 10])));

			expect(styledFeature0.getStyle()()).toEqual(highlightCoordinateFeatureStyleFunction());
			expect(styledFeature1.getStyle()()).toEqual(highlightTemporaryCoordinateFeatureStyleFunction());
		});

		it('sets the correct style features containing a HighlightGeometry', () => {
			const olPoint = new Point([5, 10]);
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightGeometryGeoJsonFeature = { data: { geometry: new GeoJSON().writeGeometry(olPoint), geometryType: HighlightGeometryTypes.GEOJSON } };

			const styledFeature0 = handler._appendStyle(highlightGeometryGeoJsonFeature, new Feature(olPoint));

			expect(styledFeature0.getStyle()()).toEqual(highlightGeometryFeatureStyleFunction());
		});

		it('sets NO style when feature type is missing', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightCoordinateFeature0 = { data: { coordinate: [1, 0] } };

			const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));

			expect(styledFeature0.getStyle()).toBeNull();
		});
	});
});
