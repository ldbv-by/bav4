import { Feature } from 'ol';
import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils.js';
import { StyleService, StyleTypes } from '../../../../src/modules/olMap/services/StyleService';
import { OverlayService } from '../../../../src/modules/olMap/services/OverlayService';
import { Polygon, Point } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { Fill, Icon, Style, Text } from 'ol/style';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import VectorLayer from 'ol/layer/Vector';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);

describe('StyleTypes', () => {
	it('provides an enum of all valid StyleTypes', () => {
		expect(Object.keys(StyleTypes).length).toBe(12);

		expect(StyleTypes.NULL).toBe('null');
		expect(StyleTypes.DEFAULT).toBe('default');
		expect(StyleTypes.MEASURE).toBe('measure');
		expect(StyleTypes.HIGHLIGHT).toBe('highlight');
		expect(StyleTypes.HIGHLIGHT_TEMP).toBe('highlight_temp');
		expect(StyleTypes.DRAW).toBe('draw');
		expect(StyleTypes.MARKER).toBe('marker');
		expect(StyleTypes.TEXT).toBe('text');
		expect(StyleTypes.ANNOTATION).toBe('annotation');
		expect(StyleTypes.LINE).toBe('line');
		expect(StyleTypes.POLYGON).toBe('polygon');
		expect(StyleTypes.GEOJSON).toBe('geojson');
	});
});

describe('StyleService', () => {
	const initialState = {
		active: false,
		statistic: { length: 0, area: 0 },
		selection: [],
		reset: null,
		fileSaveResult: { adminId: 'init', fileId: 'init' }
	};
	const mapServiceMock = { getSrid: () => 3857, getLocalProjectedSrid: () => 25832 };

	const environmentServiceMock = {
		isTouch() {},
		isStandalone: () => true
	};

	const unitsServiceMock = {
		// eslint-disable-next-line no-unused-vars
		formatDistance: (distance, decimals) => {
			return distance + ' m';
		},
		// eslint-disable-next-line no-unused-vars
		formatArea: (area, decimals) => {
			return area + ' m²';
		}
	};

	const iconServiceMock = { decodeColor: () => [0, 0, 0] };
	let instanceUnderTest;

	beforeAll(() => {
		const measurementState = {
			measurement: initialState
		};
		TestUtils.setupStoreAndDi(measurementState, { measurement: measurementReducer });
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock)
			.registerSingleton('IconService', iconServiceMock)
			.register('OverlayService', OverlayService);
	});

	beforeEach(() => {
		instanceUnderTest = new StyleService();
	});
	describe('detecting StyleTypes ', () => {
		it('detects measure as type from olFeature', () => {
			const feature = { getId: () => 'measure_123' };

			expect(instanceUnderTest._detectStyleType(feature)).toEqual(StyleTypes.MEASURE);
		});

		it('detects drawStyleTypes as type from olFeature', () => {
			const markerFeature = { getId: () => 'draw_marker_123', getKeys: () => [] };
			const textFeature = { getId: () => 'draw_text_123', getKeys: () => [] };
			const lineFeature = { getId: () => 'draw_line_123', getKeys: () => [] };
			const polygonFeature = { getId: () => 'draw_polygon_123', getKeys: () => [] };

			expect(instanceUnderTest._detectStyleType(markerFeature)).toEqual(StyleTypes.MARKER);
			expect(instanceUnderTest._detectStyleType(textFeature)).toEqual(StyleTypes.TEXT);
			expect(instanceUnderTest._detectStyleType(lineFeature)).toEqual(StyleTypes.LINE);
			expect(instanceUnderTest._detectStyleType(polygonFeature)).toEqual(StyleTypes.POLYGON);
		});

		it('detects geojson (simplestyle spec) as type from olFeature', () => {
			const feature1 = {
				getId: () => 'some',
				getStyle: () => null,
				getKeys: () => ['marker-symbol', 'marker-size', 'marker-color', 'stroke', 'stroke-opacity', 'stroke-width', 'fill', 'fill-opacity']
			};
			const feature2 = { getId: () => 'some', getStyle: () => null, getKeys: () => ['marker-symbol', 'marker-size', 'marker-color'] };
			const feature3 = { getId: () => 'some', getStyle: () => null, getKeys: () => ['marker-color'] };
			const feature4 = { getId: () => 'some', getStyle: () => null, getKeys: () => ['stroke', 'stroke-width', 'fill'] };
			expect(instanceUnderTest._detectStyleType(feature1)).toEqual(StyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature2)).toEqual(StyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature3)).toEqual(StyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature4)).toEqual(StyleTypes.GEOJSON);
		});

		it('detects type attribute as type from olFeature', () => {
			const getFeature = (typeName) => {
				return { getId: () => 'some', getStyle: () => null, getKeys: () => [], get: (key) => (key === 'type' ? typeName : null) };
			};

			expect(instanceUnderTest._detectStyleType(getFeature(StyleTypes.MARKER))).toEqual(StyleTypes.MARKER);
			expect(instanceUnderTest._detectStyleType(getFeature(StyleTypes.ANNOTATION))).toEqual(StyleTypes.ANNOTATION);
			expect(instanceUnderTest._detectStyleType(getFeature(StyleTypes.LINE))).toEqual(StyleTypes.LINE);
			expect(instanceUnderTest._detectStyleType(getFeature(StyleTypes.POLYGON))).toEqual(StyleTypes.POLYGON);
		});

		it('detects default as type from olFeature', () => {
			const feature = { getId: () => 'some', getStyle: () => null, getKeys: () => [], get: () => {} };

			expect(instanceUnderTest._detectStyleType(feature)).toEqual(StyleTypes.DEFAULT);
		});

		it('detects not the type from olFeature', () => {
			const feature1 = { getId: () => 'mea_sure_123', getStyle: () => {}, getKeys: () => [], get: () => {} };
			const feature2 = { getId: () => '123_measure_123', getStyle: () => {}, getKeys: () => [], get: () => {} };
			const feature3 = { getId: () => ' measure_123', getStyle: () => {}, getKeys: () => [], get: () => {} };
			const feature4 = { getId: () => '123measure_123', getStyle: () => {}, getKeys: () => [], get: () => {} };

			expect(instanceUnderTest._detectStyleType(undefined)).toBeNull();
			expect(instanceUnderTest._detectStyleType(null)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature1)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature2)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature3)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature4)).toBeNull();
		});
	});

	describe('add style', () => {
		it('adds measure-style to feature', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_123');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};
			const mapMock = {
				getView: () => viewMock,
				addOverlay: addOverlaySpy,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};

			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('adds text-style to feature', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({ text: new Text({ text: 'foo' }) });
			featureWithStyleArray.setId('draw_text_12345678');
			featureWithStyleFunction.setId('draw_text_9876543');
			featureWithoutStyle.setId('draw_text_noStyle');
			featureWithStyleArray.setStyle([style]);
			featureWithStyleFunction.setStyle(() => style);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};

			let textStyle = null;
			const styleSetterArraySpy = spyOn(featureWithStyleArray, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleArray, mapMock, layerMock);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));

			textStyle = null;
			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));

			textStyle = null;
			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addStyle(featureWithoutStyle, mapMock, layerMock);
			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));
		});

		it('adds text-style to annotation feature (type attribute)', () => {
			const feature = new Feature({ geometry: new Point([0, 0]), type: 'annotation' });
			const style = new Style({ text: new Text({ text: 'foo' }) });
			feature.setStyle(() => style);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};

			let textStyle = null;
			const styleSetterFunctionSpy = spyOn(feature, 'setStyle').and.callFake((f) => (textStyle = f()));
			const addTextStyleSpy = spyOn(instanceUnderTest, '_addTextStyle').and.callThrough();
			instanceUnderTest.addStyle(feature, mapMock, layerMock);
			expect(addTextStyleSpy).toHaveBeenCalledWith(feature);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));
		});

		it('adds text-style to feature without style but attribute', () => {
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			featureWithoutStyle.set('name', 'foo-name');
			featureWithoutStyle.setId('draw_text_noStyle');

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};
			let textStyle = null;

			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addStyle(featureWithoutStyle, mapMock, layerMock);

			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle[0].getText().getText()).toBe('foo-name');
		});

		it('adds marker-style to feature', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({ src: 'http://foo.bar/icon.png', anchor: [0.5, 1], anchorXUnits: 'fraction', anchorYUnits: 'fraction', color: '#ff0000' }),
				text: new Text({ text: 'foo' })
			});
			featureWithStyleArray.setId('draw_marker_12345678');
			featureWithStyleFunction.setId('draw_marker_9876543');
			featureWithoutStyle.setId('draw_marker_noStyle');
			featureWithStyleArray.setStyle([style]);
			featureWithStyleFunction.setStyle(() => [style]);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};

			let markerStyle = null;
			const styleSetterArraySpy = spyOn(featureWithStyleArray, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleArray, mapMock, layerMock);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addStyle(featureWithoutStyle, mapMock, layerMock);
			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));
		});

		it('adds marker-style with color from existing label-style to feature', () => {
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({ src: 'http://foo.bar/icon.png', anchor: [0.5, 1], anchorXUnits: 'fraction', anchorYUnits: 'fraction' }),
				text: new Text({
					text: 'foo',
					fill: new Fill({
						color: [42, 21, 0, 1]
					})
				})
			});
			featureWithStyleFunction.setId('draw_marker_9876543');
			featureWithStyleFunction.setStyle(() => [style]);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};
			spyOn(iconServiceMock, 'decodeColor').and.returnValue(null); //we simulate a local IconResult, which have no url property

			let markerStyle = null;
			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));
			expect(markerStyle[0].getText().getFill().getColor()).toEqual([42, 21, 0, 1]);
		});

		it('adds marker-style to feature without style but attribute', () => {
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			featureWithoutStyle.set('name', 'bar-name');
			featureWithoutStyle.setId('draw_marker_noStyle');

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};
			let markerStyle = null;

			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addStyle(featureWithoutStyle, mapMock, layerMock);

			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle[0].getText().getText()).toBe('bar-name');
		});

		it('adds NO style to feature with style-type of LINE or POLYGON', () => {
			const lineFeature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			const polygonFeature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			lineFeature.setId('draw_line_12345678');
			polygonFeature.setId('draw_polygon_9876543');
			const lineStyleSetterSpy = spyOn(lineFeature, 'setStyle');
			const polygonStyleSetterSpy = spyOn(polygonFeature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const layerMock = {};

			instanceUnderTest.addStyle(lineFeature, mapMock, layerMock, StyleTypes.LINE);
			instanceUnderTest.addStyle(polygonFeature, mapMock, layerMock, StyleTypes.POLYGON);

			expect(lineStyleSetterSpy).not.toHaveBeenCalled();
			expect(polygonStyleSetterSpy).not.toHaveBeenCalled();
		});

		it('adds geojson-style to feature with simpleStyle spec properties', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.set('fill', '#ff0000');
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.addStyle(feature, mapMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adds default-style to feature without initial style', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const layerMock = { ol_uid: 1 };
			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(addSpy).toHaveBeenCalledWith(feature, layerMock);
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adds default-style to feature without initial style and existing layer-color', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			const styleSetterSpy = spyOn(feature, 'setStyle').and.callThrough();
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const layerMock = { ol_uid: 'some' };
			instanceUnderTest._defaultColorByLayerId['some'] = [0, 0, 0, 1];
			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(addSpy).toHaveBeenCalledWith(feature, layerMock);
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(feature.getStyle()(feature)[0].getFill().getColor()).toEqual([0, 0, 0, 1]);
		});

		it('adds default-style to feature without initial style and layer', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			instanceUnderTest.addStyle(feature, mapMock);

			expect(addSpy).toHaveBeenCalledWith(feature, undefined);
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adding style to feature with unknown style-type fails', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setStyle(new Style());
			const addOverlaySpy = jasmine.createSpy();
			const warnSpy = spyOn(console, 'warn');
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};
			const mapMock = {
				getView: () => viewMock,
				addOverlay: addOverlaySpy,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const layerMock = {};

			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(styleSetterSpy).not.toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).not.toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type');
		});

		it('registers initial styling events for measure-feature without partition-delta property', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_12345678');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');

			const viewMock = {
				getResolution() {
					return 50;
				},
				once(eventName, callback) {
					callback();
				}
			};
			const onceOnViewSpy = spyOn(viewMock, 'once').and.callThrough();

			const mapMock = {
				getView: () => viewMock,
				addOverlay: addOverlaySpy,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				},
				once() {}
			};

			const layerMock = {};
			const eventMock = { map: mapMock };
			const onceOnMapSpy = spyOn(mapMock, 'once').and.callFake((eventName, callback) => callback(eventMock));

			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(onceOnViewSpy).toHaveBeenCalledWith('change:resolution', jasmine.any(Function));
			expect(onceOnMapSpy).toHaveBeenCalledWith('moveend', jasmine.any(Function));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('registers NOT initial styling events for measure-feature without partition-delta property', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_12345678');
			feature.set('partition_delta', 'something');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() {}
			};
			const onceSpy = spyOn(viewMock, 'once');

			const mapMock = {
				getView: () => viewMock,
				addOverlay: addOverlaySpy,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const layerMock = {};

			instanceUnderTest.addStyle(feature, mapMock, layerMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(onceSpy).not.toHaveBeenCalled();
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('add cluster style', () => {
		it('adds a style function to the cluster layer', () => {
			const clusterLayer = new VectorLayer({ id: 'foo' });
			const styleSpy = spyOn(clusterLayer, 'setStyle').and.callThrough();

			instanceUnderTest.addClusterStyle(clusterLayer);

			expect(styleSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});
	});

	describe('update style', () => {
		it('updates measure-style to feature with implicit style-type', () => {
			const measureOverlayMock = { style: { opacity: 1, display: '' } };
			const overlayMock = {
				getElement() {
					return measureOverlayMock;
				}
			};
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.setId('measure_123');
			feature.set('overlays', [overlayMock]);
			const viewMock = {
				getResolution() {
					return 50;
				}
			};

			const mapMock = {
				getView: () => viewMock,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.updateStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true });

			expect(measureOverlayMock).toEqual({ style: { opacity: 0.5, display: 'inherit' } });
			instanceUnderTest.updateStyle(feature, mapMock, { visible: false, top: true });
			expect(measureOverlayMock).toEqual({ style: { opacity: 1, display: 'none' } });
			instanceUnderTest.updateStyle(feature, mapMock, { top: false });
			expect(measureOverlayMock).toEqual({ style: { opacity: 1, display: 'none' } });
		});

		it('updates measure-style to feature with explicit style-type', () => {
			const measureOverlayMock = { style: { opacity: 1, display: '' } };
			const overlayMock = {
				getElement() {
					return measureOverlayMock;
				}
			};
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.set('overlays', [overlayMock]);
			const viewMock = {
				getResolution() {
					return 50;
				}
			};

			const mapMock = {
				getView: () => viewMock,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.updateStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true }, 'measure');

			expect(measureOverlayMock).toEqual({ style: { opacity: 0.5, display: 'inherit' } });
		});

		it('takes no action on non-measure-style features', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			const spy = spyOn(mapMock, 'getOverlays');
			instanceUnderTest.updateStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true }, 'foo');
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('getStyleFunction', () => {
		it('returns a StyleFunction for a valid StyleType', () => {
			expect(instanceUnderTest.getStyleFunction(StyleTypes.NULL)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.MEASURE)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.MARKER)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.TEXT)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.LINE)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.POLYGON)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.DRAW)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.DEFAULT)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.GEOJSON)).toEqual(jasmine.any(Function));
		});

		it('fails for a invalid StyleType', () => {
			const warnSpy = spyOn(console, 'warn');

			const styleFunction = instanceUnderTest.getStyleFunction('unknown');

			expect(styleFunction).toBeUndefined();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type:', 'unknown');
		});
	});

	describe('getFeatureStyleFunction', () => {
		describe('#getStyle returns a style function', () => {
			it('returns a style function', () => {
				const style = new Style();
				const feature = new Feature();
				const resolution = 42;
				const spy = jasmine.createSpy().and.returnValue(style);
				spyOn(instanceUnderTest, 'getStyleFunction').withArgs(StyleTypes.ROUTING).and.returnValue(spy);

				const result = instanceUnderTest.getFeatureStyleFunction(StyleTypes.ROUTING)(feature, resolution);

				expect(spy).toHaveBeenCalledOnceWith(feature, resolution);
				expect(result).toEqual(style);
			});
		});

		describe('#getStyle returns a style', () => {
			it('returns a style function', () => {
				const style = new Style();
				const feature = new Feature();
				const resolution = 42;
				spyOn(instanceUnderTest, 'getStyleFunction').withArgs(StyleTypes.ROUTING).and.returnValue(style);

				const result = instanceUnderTest.getFeatureStyleFunction(StyleTypes.ROUTING)(feature, resolution);

				expect(result).toEqual(style);
			});
		});
	});

	describe('removes styles', () => {
		it('removes a style from feature', () => {
			const feature = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			feature.set('overlays', [{}, {}]);
			const removeOverlaySpy = jasmine.createSpy();
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock,
				removeOverlay: removeOverlaySpy,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.removeStyle(feature, mapMock);

			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('tests if a style is required', () => {
		it('tests that a style is required', () => {
			const featureToBeStyled = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			featureToBeStyled.setId('measure_123');
			const featureNotToBeStyled = new Feature({
				geometry: new Polygon([
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0]
					]
				])
			});
			featureNotToBeStyled.setId('foo_123');
			featureNotToBeStyled.setStyle(new Style());

			expect(instanceUnderTest.isStyleRequired(featureToBeStyled)).toBeTrue();
			expect(instanceUnderTest.isStyleRequired(featureNotToBeStyled)).toBeFalse();
		});
	});

	describe('nextColor', () => {
		it('iterates through the predefined color-set', () => {
			const expectedColors = [
				[255, 0, 0, 0.8],
				[255, 165, 0, 0.8],
				[0, 0, 255, 0.8],
				[0, 255, 255, 0.8],
				[0, 255, 0, 0.8],
				[128, 0, 128, 0.8],
				[0, 128, 0, 0.8]
			];
			expectedColors.forEach((expectedColor) => {
				expect(instanceUnderTest._nextColor()).toEqual(expectedColor);
			});

			// restart, begin with first color again
			expect(instanceUnderTest._nextColor()).toEqual(expectedColors[0]);
		});
	});
});
