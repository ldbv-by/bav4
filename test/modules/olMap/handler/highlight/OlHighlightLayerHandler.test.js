import { TestUtils } from '../../../../test-utils';
import { highlightReducer } from '../../../../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, clearHighlightFeatures } from '../../../../../src/store/highlight/highlight.action';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';
import { OlHighlightLayerHandler } from '../../../../../src/modules/olMap/handler/highlight/OlHighlightLayerHandler';
import {
	highlightAnimatedCoordinateFeatureStyleFunction,
	highlightCoordinateFeatureStyleFunction,
	highlightGeometryOrCoordinateFeatureStyleFunction,
	highlightTemporaryCoordinateFeatureStyleFunction,
	highlightTemporaryGeometryOrCoordinateFeatureStyleFunction
} from '../../../../../src/modules/olMap/handler/highlight/styleUtils';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { $injector } from '../../../../../src/injection';
import { BaGeometry } from '../../../../../src/domain/geometry';
import { SourceType, SourceTypeName } from '../../../../../src/domain/sourceType';
import { HighlightFeatureType } from '../../../../../src/domain/highlightFeature';

describe('OlHighlightLayerHandler', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialState = {
		active: false,
		features: [],
		temporaryFeatures: []
	};
	const mapService = {
		getSrid: () => {}
	};

	const iconServiceMock = {
		getIconResult: (idOrBase64) => {
			return { id: idOrBase64, base64: 'data:image/svg+xml;base64,foo' };
		}
	};

	const setup = (state = initialState) => {
		const highlightState = {
			highlight: state
		};
		TestUtils.setupStoreAndDi(highlightState, { highlight: highlightReducer });
		$injector
			.registerSingleton('MapService', mapService)
			// implicitly required by highlightCoordinateFeatureStyleFunction & highlightTemporaryCoordinateFeatureStyleFunction
			.registerSingleton('IconService', iconServiceMock);
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
		expect(handler._unregister()).toEqual((() => {})());
		expect(handler._olMap).toBeNull();
		expect(handler._olLayer).toBeNull();
		expect(handler._animationListenerKeys).toHaveSize(0);
	});

	describe('when handler is activated', () => {
		it('updates olLayer and olMap fields', () => {
			const map = setupMap();
			setup();
			const handler = new OlHighlightLayerHandler();

			const olLayer = handler.activate(map);

			expect(handler._olMap).toEqual(map);
			expect(handler._olLayer).toEqual(olLayer);
		});

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
				const highlightFeatures = [
					{ type: HighlightFeatureType.DEFAULT, data: [1, 0] },
					{ type: HighlightFeatureType.DEFAULT, data: [2, 1] }
				];
				const temporaryFeatures = [{ type: HighlightFeatureType.TEMPORARY, data: [3, 4] }];
				const animatedFeatures = [{ type: HighlightFeatureType.QUERY_RUNNING, data: [5, 55] }];
				const state = { ...initialState, active: true, features: [...highlightFeatures, ...temporaryFeatures, ...animatedFeatures] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();

				const olLayer = handler.activate(map);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(4);
				expect(handler._animationListenerKeys).toHaveSize(1);
			});
		});

		describe('and highlight features are added', () => {
			it('adds ol features', () => {
				const map = setupMap();
				setup();
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				addHighlightFeatures([
					{ type: HighlightFeatureType.DEFAULT, data: [21, 42] },
					{ type: HighlightFeatureType.DEFAULT, data: [38, 57] },
					{ type: HighlightFeatureType.QUERY_RUNNING, data: [5, 55] }
				]);

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(3);
				expect(handler._animationListenerKeys).toHaveSize(1);
			});
		});

		describe('and highlight features are removed', () => {
			it('removes ol features', () => {
				const highlightFeature = { type: HighlightFeatureType.QUERY_RUNNING, data: [1, 0] };
				const state = { ...initialState, active: true, features: [highlightFeature], temporaryFeatures: [] };
				const map = setupMap();
				setup(state);
				const handler = new OlHighlightLayerHandler();
				const olLayer = handler.activate(map);

				clearHighlightFeatures();

				const olFeatures = olLayer.getSource().getFeatures();
				expect(olFeatures).toHaveSize(0);
				expect(handler._animationListenerKeys).toHaveSize(0);
			});
		});
	});

	describe('when deactivate', () => {
		it('updates olLayer and olMap fields', () => {
			const map = setupMap();
			setup();
			const handler = new OlHighlightLayerHandler();
			handler.activate(map);

			handler.deactivate(map);

			expect(handler._olMap).toBeNull();
			expect(handler._olLayer).toBeNull();
		});

		it('un-registers observer', () => {
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
		it('maps features containing a `Coordinate`', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const highlightCoordinateFeature = { id: 'id', data: [1, 0], label: 'label' };

			const olFeature = handler._toOlFeature(highlightCoordinateFeature);

			expect(olFeature.getGeometry().getCoordinates()).toEqual(highlightCoordinateFeature.data);
			expect(olFeature.get('name')).toBe('label');
			expect(olFeature.getId()).toBe('id');
			expect(appendStyleSpy).toHaveBeenCalledTimes(1);
		});

		it('maps features containing a `Geometry`', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			spyOn(mapService, 'getSrid').and.returnValue(3857);
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const highlightGeometryWktFeature = {
				id: 'id0',
				data: new BaGeometry(`SRID=3857;${new WKT().writeGeometry(new Point([21, 42]))}`, new SourceType(SourceTypeName.EWKT)),
				label: 'WKT'
			};
			const highlightGeometryGeoJsonFeature = {
				id: 'id1',
				data: new BaGeometry(JSON.stringify(new GeoJSON().writeGeometry(new Point([5, 10]))), new SourceType(SourceTypeName.GEOJSON)),
				label: 'GeoJSON'
			};

			const olFeature0 = handler._toOlFeature(highlightGeometryWktFeature);
			const olFeature1 = handler._toOlFeature(highlightGeometryGeoJsonFeature);

			expect(olFeature0.getGeometry().getCoordinates()).toEqual([21, 42]);
			expect(olFeature0.getId()).toBe('id0');
			expect(olFeature0.get('name')).toBe('WKT');
			expect(olFeature1.getGeometry().getCoordinates()).toEqual([5, 10]);
			expect(olFeature1.getId()).toBe('id1');
			expect(olFeature1.get('name')).toBe('GeoJSON');
			expect(appendStyleSpy).toHaveBeenCalledTimes(2);
		});

		describe('SourceType EWKT', () => {
			it('throws an error when the SRID of the HighlightGeometry is not supported', () => {
				setup();
				const handler = new OlHighlightLayerHandler();
				spyOn(mapService, 'getSrid').and.returnValue(3857);
				const highlightGeometryWktFeature = {
					data: new BaGeometry(`SRID=4326;${new WKT().writeGeometry(new Point([21, 42]))}`, new SourceType(SourceTypeName.EWKT)),
					label: 'WKT'
				};

				expect(() => handler._toOlFeature(highlightGeometryWktFeature)).toThrowError('Unsupported SRID 4326');
			});
		});

		it('maps features with an invalid type', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const appendStyleSpy = spyOn(handler, '_appendStyle').withArgs(jasmine.anything(), jasmine.any(Feature)).and.callThrough();
			const unknownHighlightFeatureType = {
				data: new BaGeometry(JSON.stringify(new GeoJSON().writeGeometry(new Point([5, 10]))), new SourceType(SourceTypeName.KML))
			};

			expect(() => handler._toOlFeature(unknownHighlightFeatureType)).toThrow('SourceType "kml" is currently not supported');
			expect(appendStyleSpy).not.toHaveBeenCalled();
		});
	});

	describe('_appendStyle', () => {
		it('sets the correct style features containing a HighlightCoordinate', () => {
			setup();
			const animatedFeature = new Feature(new Point([22, 44]));
			const handler = new OlHighlightLayerHandler();
			const animatePointFeatureSyp = spyOn(handler, '_animatePointFeature');
			const highlightCoordinateFeature0 = { data: [1, 0], type: HighlightFeatureType.MARKER };
			const highlightCoordinateFeature1 = { data: [1, 0], type: HighlightFeatureType.MARKER_TMP };
			const highlightCoordinateFeature2 = { data: [1, 0], type: HighlightFeatureType.QUERY_RUNNING };
			const highlightCoordinateFeature3 = { data: [1, 0], type: HighlightFeatureType.QUERY_SUCCESS };
			const highlightCoordinateFeature4 = { data: [1, 0], type: HighlightFeatureType.DEFAULT };
			const highlightCoordinateFeature5 = { data: [1, 0], type: HighlightFeatureType.DEFAULT_TMP };

			const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));
			const styledFeature1 = handler._appendStyle(highlightCoordinateFeature1, new Feature(new Point([5, 10])));
			handler._appendStyle(highlightCoordinateFeature2, animatedFeature);
			const styledFeature3 = handler._appendStyle(highlightCoordinateFeature3, new Feature(new Point([5, 10])));
			const styledFeature4 = handler._appendStyle(highlightCoordinateFeature4, new Feature(new Point([5, 10])));
			const styledFeature5 = handler._appendStyle(highlightCoordinateFeature5, new Feature(new Point([5, 10])));

			expect(styledFeature0.getStyle()()).toEqual(highlightCoordinateFeatureStyleFunction());
			expect(styledFeature1.getStyle()()).toEqual(highlightTemporaryCoordinateFeatureStyleFunction());
			expect(animatePointFeatureSyp).toHaveBeenCalledWith(animatedFeature);
			expect(styledFeature3.getStyle()()).toEqual(highlightAnimatedCoordinateFeatureStyleFunction());
			expect(styledFeature4.getStyle()()).toEqual(highlightGeometryOrCoordinateFeatureStyleFunction());

			expect(styledFeature5.getStyle()).toBe(highlightTemporaryGeometryOrCoordinateFeatureStyleFunction);
		});

		it('sets the correct style features containing a HighlightGeometry', () => {
			const olPoint = new Point([5, 10]);
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightGeometryGeoJsonFeature0 = {
				data: new BaGeometry(new GeoJSON().writeGeometry(olPoint), new SourceType(SourceTypeName.GEOJSON)),
				type: HighlightFeatureType.DEFAULT
			};
			const highlightGeometryGeoJsonFeature1 = {
				data: new BaGeometry(new GeoJSON().writeGeometry(olPoint), new SourceType(SourceTypeName.GEOJSON)),
				type: HighlightFeatureType.DEFAULT_TMP
			};

			const styledFeature0 = handler._appendStyle(highlightGeometryGeoJsonFeature0, new Feature(olPoint));
			const styledFeature1 = handler._appendStyle(highlightGeometryGeoJsonFeature1, new Feature(olPoint));

			expect(styledFeature0.getStyle()()).toEqual(highlightGeometryOrCoordinateFeatureStyleFunction());
			expect(styledFeature1.getStyle()).toBe(highlightTemporaryGeometryOrCoordinateFeatureStyleFunction);
		});

		it('sets NO style when feature type is missing', () => {
			setup();
			const handler = new OlHighlightLayerHandler();
			const highlightCoordinateFeature0 = { data: [1, 0] };

			const styledFeature0 = handler._appendStyle(highlightCoordinateFeature0, new Feature(new Point([5, 10])));

			expect(styledFeature0.getStyle()).toBeNull();
		});
	});

	describe('_animatePointFeature', () => {
		it('sets the correct style and setups the animation', () => {
			const animatedFeature = new Feature(new Point([22, 44]));
			const map = setupMap();
			setup();
			const handler = new OlHighlightLayerHandler();
			handler.activate(map);

			const id = handler._animatePointFeature(animatedFeature);

			expect(handler._animationListenerKeys).toEqual([id]);
		});
	});
});
