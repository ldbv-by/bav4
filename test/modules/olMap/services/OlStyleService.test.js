import { Collection, Feature, Map } from 'ol';
import { $injector } from '../../../../src/injection';
import { OlFeatureStyleTypes, OlStyleService } from '../../../../src/modules/olMap/services/OlStyleService';
import { measurementReducer } from '../../../../src/store/measurement/measurement.reducer';
import { TestUtils } from '../../../test-utils';
import { LineString, Point, Polygon } from 'ol/geom';
import { GEODESIC_FEATURE_PROPERTY, GeodesicGeometry } from '../../../../src/modules/olMap/ol/geodesic/geodesicGeometry';
import { Text as TextStyle, Fill, Icon, Style, Stroke } from 'ol/style';
import { VectorGeoResource, VectorSourceType } from '../../../../src/domain/geoResources';
import { StyleHint } from '../../../../src/domain/styles';
import { highlightGeometryOrCoordinateFeatureStyleFunction } from '../../../../src/modules/olMap/handler/highlight/styleUtils';
import VectorLayer from 'ol/layer/Vector';
import { defaultClusterStyleFunction } from '../../../../src/modules/olMap/utils/olStyleUtils';
import CircleStyle from 'ol/style/Circle';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { createDefaultLayer, layersReducer } from '../../../../src/store/layers/layers.reducer';
import { CollectionEvent } from 'ol/Collection';
import { asInternalProperty } from '../../../../src/utils/propertyUtils';

describe('OlFeatureStyleTypes', () => {
	it('provides an enum of all valid OlFeatureStyleTypes', () => {
		expect(Object.keys(OlFeatureStyleTypes).length).toBe(12);

		expect(OlFeatureStyleTypes.NULL).toBe('null');
		expect(OlFeatureStyleTypes.DEFAULT).toBe('default');
		expect(OlFeatureStyleTypes.MEASURE).toBe('measure');
		expect(OlFeatureStyleTypes.DRAW).toBe('draw');
		expect(OlFeatureStyleTypes.POINT).toBe('point');
		expect(OlFeatureStyleTypes.MARKER).toBe('marker');
		expect(OlFeatureStyleTypes.TEXT).toBe('text');
		expect(OlFeatureStyleTypes.ANNOTATION).toBe('annotation');
		expect(OlFeatureStyleTypes.LINE).toBe('line');
		expect(OlFeatureStyleTypes.POLYGON).toBe('polygon');
		expect(OlFeatureStyleTypes.GEOJSON).toBe('geojson');
		expect(OlFeatureStyleTypes.ROUTING).toBe('routing');
	});
});

describe('OlStyleService', () => {
	const initialState = {
		active: false,
		statistic: { geometryType: null, coordinate: null, azimuth: null, length: null, area: null },
		displayRuler: true,
		selection: [],
		reset: null
	};
	const mapServiceMock = {
		getSrid: () => 3857,
		getLocalProjectedSrid: () => 25832,
		calcLength: () => {}
	};

	const environmentServiceMock = {
		isTouch() {},
		isStandalone: () => true
	};

	const unitsServiceMock = {
		// eslint-disable-next-line no-unused-vars
		formatDistance: (distance, decimals) => {
			return { value: distance, localizedValue: distance, unit: 'm' };
		},
		// eslint-disable-next-line no-unused-vars
		formatArea: (area, decimals) => {
			return { value: area, localizedValue: area, unit: 'm²' };
		}
	};

	const geoResourceServiceMock = {
		byId() {}
	};

	const overlayServiceMock = {
		add: () => {},
		update: () => {},
		remove: () => {}
	};
	const iconServiceMock = { decodeColor: () => [0, 0, 0] };
	let instanceUnderTest;

	beforeAll(() => {
		const state = {
			measurement: initialState,
			layers: {
				active: [{ ...createDefaultLayer('id') }]
			}
		};
		TestUtils.setupStoreAndDi(state, { measurement: measurementReducer, layers: layersReducer });
		$injector
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('UnitsService', unitsServiceMock)
			.registerSingleton('IconService', iconServiceMock)
			.registerSingleton('GeoResourceService', geoResourceServiceMock)
			.registerSingleton('OverlayService', overlayServiceMock);
	});

	beforeEach(() => {
		instanceUnderTest = new OlStyleService();
	});

	describe('add feature style', () => {
		it('adds measure-style to feature with geodesic property', () => {
			const addSpy = spyOn(overlayServiceMock, 'add');
			const featureWithGeodesic = new Feature({
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
			featureWithGeodesic.setId('measure_123');
			featureWithGeodesic.set(GEODESIC_FEATURE_PROPERTY, new GeodesicGeometry(featureWithGeodesic));
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(featureWithGeodesic, 'setStyle');
			const propertySetterSpy = spyOn(featureWithGeodesic, 'set');

			const viewMock = {
				getResolution() {
					return 50;
				},
				on() {}
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

			instanceUnderTest.addFeatureStyle(featureWithGeodesic, mapMock, layerMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).not.toHaveBeenCalledWith(GEODESIC_FEATURE_PROPERTY, jasmine.any(Object));
			expect(addSpy).toHaveBeenCalledWith(featureWithGeodesic, mapMock, 'measure');
		});

		it('adds measure-style to feature WITHOUT geodesic property', () => {
			const addSpy = spyOn(overlayServiceMock, 'add');
			const featureWithoutGeodesic = new Feature({
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
			featureWithoutGeodesic.setId('measure_123');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(featureWithoutGeodesic, 'setStyle');
			const propertySetterSpy = spyOn(featureWithoutGeodesic, 'set');

			const viewMock = {
				getResolution() {
					return 50;
				},
				on() {}
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
			instanceUnderTest.addFeatureStyle(featureWithoutGeodesic, mapMock, layerMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith(GEODESIC_FEATURE_PROPERTY, jasmine.any(Object));
			expect(addSpy).toHaveBeenCalledWith(featureWithoutGeodesic, mapMock, 'measure');
		});

		it('adds text-style to feature', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({ text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }) }) });
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
			instanceUnderTest.addFeatureStyle(featureWithStyleArray, mapMock, layerMock);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));

			textStyle = null;
			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));

			textStyle = null;
			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (textStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithoutStyle, mapMock, layerMock);
			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));
		});

		it('adds default text-style to feature with empty text-style', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({ text: null });
			featureWithStyleArray.setId('draw_text_12345678');

			featureWithStyleArray.setStyle([style]);

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
			instanceUnderTest.addFeatureStyle(featureWithStyleArray, mapMock, layerMock);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle[0].getText().getText()).toBe('new text');
			expect(textStyle).toContain(jasmine.any(Style));
		});

		it('adds text-style to annotation feature (type attribute)', () => {
			const feature = new Feature({ geometry: new Point([0, 0]), type: 'annotation' });
			const styleFunction = () => new Style({ text: new TextStyle({ text: 'foo', fill: new Fill({ color: [255, 0, 0, 0.9] }) }) });
			feature.setStyle(styleFunction);

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
			const styleSetterFunctionSpy = spyOn(feature, 'setStyle').and.callFake((styleFunction) => (textStyle = styleFunction()));
			const addTextStyleSpy = spyOn(instanceUnderTest, '_addTextStyle').and.callThrough();
			instanceUnderTest.addFeatureStyle(feature, mapMock, layerMock);
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
			instanceUnderTest.addFeatureStyle(featureWithoutStyle, mapMock, layerMock);

			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle[0].getText().getText()).toBe('foo-name');
		});

		it('adds marker-style to feature', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithoutTextStyle = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			const featureWithEmptyStyle = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({ src: 'http://foo.bar/icon.png', anchor: [0.5, 1], anchorXUnits: 'fraction', anchorYUnits: 'fraction', color: '#ff0000' }),
				text: new TextStyle({ text: 'foo' })
			});
			const styleWithoutTextStyle = new Style({
				image: new Icon({ src: 'http://foo.bar/icon.png', anchor: [0.5, 1], anchorXUnits: 'fraction', anchorYUnits: 'fraction', color: '#ff0000' })
			});
			featureWithStyleArray.setId('draw_marker_12345678');
			featureWithoutTextStyle.setId('draw_marker_12withoutText');
			featureWithStyleFunction.setId('draw_marker_9876543');
			featureWithoutStyle.setId('draw_marker_noStyle');
			featureWithEmptyStyle.setId('draw_marker_emptyStyle');
			featureWithStyleArray.setStyle([style]);
			featureWithoutTextStyle.setStyle([styleWithoutTextStyle]);
			featureWithStyleFunction.setStyle(() => [style]);
			featureWithEmptyStyle.setStyle(new Style());

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
			instanceUnderTest.addFeatureStyle(featureWithStyleArray, mapMock, layerMock);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterWithoutTextStyleSpy = spyOn(featureWithoutTextStyle, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithoutTextStyle, mapMock, layerMock);
			expect(styleSetterWithoutTextStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterNoStyleSpy = spyOn(featureWithoutStyle, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithoutStyle, mapMock, layerMock);
			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			markerStyle = null;
			const styleSetterEmptyStyleSpy = spyOn(featureWithEmptyStyle, 'setStyle').and.callFake((f) => (markerStyle = f()));
			instanceUnderTest.addFeatureStyle(featureWithEmptyStyle, mapMock, layerMock);
			expect(styleSetterEmptyStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));
		});

		it('adds marker-style with color, anchor and size from existing label-style to feature', () => {
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const icon = new Icon({
				src: 'http://foo.bar/icon.png',
				anchor: [0.5, 1],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction'
			});

			const anchorSpy = spyOn(icon, 'getAnchor').and.callFake(() => {
				return [24, 48];
			});
			const sizeSpy = spyOn(icon, 'getSize').and.callFake(() => {
				return [48, 48];
			});
			const style = new Style({
				image: icon,
				text: new TextStyle({
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
			instanceUnderTest.addFeatureStyle(featureWithStyleFunction, mapMock, layerMock);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));
			// uses the existing color
			expect(markerStyle[0].getText().getFill().getColor()).toEqual([42, 21, 0, 1]);

			//...and the existing anchor/size
			expect(anchorSpy).toHaveBeenCalled();
			expect(sizeSpy).toHaveBeenCalled();
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
			instanceUnderTest.addFeatureStyle(featureWithoutStyle, mapMock, layerMock);

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

			instanceUnderTest.addFeatureStyle(lineFeature, mapMock, layerMock, OlFeatureStyleTypes.LINE);
			instanceUnderTest.addFeatureStyle(polygonFeature, mapMock, layerMock, OlFeatureStyleTypes.POLYGON);

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

			instanceUnderTest.addFeatureStyle(feature, mapMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adds routing-style to feature routing intermediate id', () => {
			const routingFeature = new Feature({ geometry: new Point([0, 0]) });
			routingFeature.set('Routing_Feature_Type', 'intermediate');
			routingFeature.set('Routing_Feature_Index', 42);
			routingFeature.setId('routing_42');

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

			const styleSetterNoStyleSpy = spyOn(routingFeature, 'setStyle').and.callThrough();
			const addRoutingStyleSpy = spyOn(instanceUnderTest, '_addRoutingStyle').withArgs(routingFeature).and.callThrough();
			instanceUnderTest.addFeatureStyle(routingFeature, mapMock, layerMock);

			expect(addRoutingStyleSpy).toHaveBeenCalled();
			expect(styleSetterNoStyleSpy).toHaveBeenCalledWith(jasmine.any(Function));
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

			const layerMock = { ol_uid: 1, get: () => 'fooId' };
			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			instanceUnderTest.addFeatureStyle(feature, mapMock, layerMock);

			expect(addSpy).toHaveBeenCalledWith(feature, layerMock);
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adds default-style to GPX feature without initial style', () => {
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

			const layerMock = { ol_uid: 1, get: () => 'gpxGeoResourceId' };
			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			const geoResourceServiceSpy = spyOn(geoResourceServiceMock, 'byId')
				.withArgs('gpxGeoResourceId')
				.and.returnValue({ sourceType: VectorSourceType.GPX });
			instanceUnderTest.addFeatureStyle(feature, mapMock, layerMock);

			expect(addSpy).toHaveBeenCalledWith(feature, layerMock);
			expect(geoResourceServiceSpy).toHaveBeenCalled();
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adds default-style to feature without initial style and existing layer-color', () => {
			const feature1 = new Feature({
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
			const feature2 = new Feature({
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
			const styleSetterSpy = spyOn(feature2, 'setStyle').and.callThrough();
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

			const layerMock = { ol_uid: 'some', get: () => 'fooId' };
			const addSpy = spyOn(instanceUnderTest, '_addDefaultStyle').and.callThrough();
			instanceUnderTest.addFeatureStyle(feature1, mapMock, layerMock);
			instanceUnderTest.addFeatureStyle(feature2, mapMock, layerMock);

			expect(addSpy).toHaveBeenCalledWith(feature2, layerMock);
			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(feature1.getStyle()(feature1)[0].getFill().getColor()).toEqual([255, 0, 0, 0.8]);
			expect(feature2.getStyle()(feature2)[0].getFill().getColor()).toEqual([255, 0, 0, 0.8]);
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
			instanceUnderTest.addFeatureStyle(feature, mapMock);

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

			instanceUnderTest.addFeatureStyle(feature, mapMock, layerMock);

			expect(styleSetterSpy).not.toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).not.toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type');
		});

		describe('checks the `styleHint` property of an ol.Feature', () => {
			it('does nothing when a StyleHint is not available', () => {
				const olFeature = new Feature({ geometry: new Point([0, 0]) });
				spyOn(instanceUnderTest, '_detectStyleType').and.returnValue(null);

				instanceUnderTest.addFeatureStyle(olFeature, {}, {});

				expect(olFeature.getStyle()).toBeNull();
			});

			it('sets the correct style for `StyleHint.HIGHLIGHT`', () => {
				const olFeature = new Feature({ geometry: new Point([0, 0]) });
				olFeature.set(asInternalProperty('styleHint'), StyleHint.HIGHLIGHT);
				spyOn(instanceUnderTest, '_detectStyleType').and.returnValue(null);

				instanceUnderTest.addFeatureStyle(olFeature, {}, {});

				expect(olFeature.getStyle()).toEqual(highlightGeometryOrCoordinateFeatureStyleFunction());
			});
		});
	});

	describe('update feature style', () => {
		it('updates measure-style to feature with implicit style-type', () => {
			const measureOverlayMock = { style: { opacity: 1, display: '' } };
			const overlayMock = {
				getElement() {
					return measureOverlayMock;
				},
				getPosition: () => [0, 0]
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
				},
				calculateExtent: () => [0, 0, 1, 1]
			};

			const mapMock = {
				getView: () => viewMock,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				},
				getSize: () => {}
			};
			const updateSpy = spyOn(overlayServiceMock, 'update');

			instanceUnderTest.updateFeatureStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true });

			expect(updateSpy).toHaveBeenCalledWith(feature, mapMock, 'measure', { visible: true, opacity: 0.5, top: true });
		});

		it('updates measure-style to feature with explicit style-type', () => {
			const updateSpy = spyOn(overlayServiceMock, 'update');

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
				},
				calculateExtent: () => [0, 0, 1, 1]
			};

			const mapMock = {
				getView: () => viewMock,
				getOverlays() {
					return [];
				},
				getInteractions() {
					return { getArray: () => [] };
				},
				getSize: () => {}
			};

			instanceUnderTest.updateFeatureStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true }, 'measure');

			expect(updateSpy).toHaveBeenCalledWith(feature, mapMock, 'measure', { visible: true, opacity: 0.5, top: true });
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
			instanceUnderTest.updateFeatureStyle(feature, mapMock, { visible: true, opacity: 0.5, top: true }, 'foo');
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('removes feature styles', () => {
		it('removes a style from measure feature', () => {
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
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const removeSpy = spyOn(overlayServiceMock, 'remove');

			instanceUnderTest.removeFeatureStyle(feature, mapMock);

			expect(removeSpy).toHaveBeenCalledWith(feature, mapMock, 'measure');
		});

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
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			const removeSpy = spyOn(overlayServiceMock, 'remove');

			instanceUnderTest.removeFeatureStyle(feature, mapMock);

			expect(removeSpy).toHaveBeenCalledWith(feature, mapMock, 'default');
		});
	});

	describe('applyStyle', () => {
		it('calls return the ol.Layer', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML);
			const olMap = new Map();

			const result = instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(result).toEqual(olLayer);
		});
		it('calls _sanitizeStyles', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML);
			const olMap = new Map();
			const sanitizeStylesSpy = spyOn(instanceUnderTest, '_sanitizeStyles');

			instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(sanitizeStylesSpy).toHaveBeenCalledWith(olLayer);
		});

		it('handles a clustered VectorGeoResource', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML).setClusterParams({ foo: 'bar' });
			const olMap = new Map();
			const applyStyleHintSpy = spyOn(instanceUnderTest, '_applyStyleHint');

			instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(applyStyleHintSpy).toHaveBeenCalledWith(StyleHint.CLUSTER, olLayer);
		});

		it('handles a VectorGeoResource containing a StyleHint', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML).setStyleHint(StyleHint.HIGHLIGHT);
			const olMap = new Map();
			const applyStyleHintSpy = spyOn(instanceUnderTest, '_applyStyleHint').and.callThrough();
			const setLayerStyleSpy = spyOn(olLayer, 'setStyle');

			instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(applyStyleHintSpy).toHaveBeenCalledWith(StyleHint.HIGHLIGHT, olLayer);
			expect(setLayerStyleSpy).toHaveBeenCalledWith(highlightGeometryOrCoordinateFeatureStyleFunction());
		});

		it('handles a VectorGeoResource without any StyleHints', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML);
			const applyStyleHintSpy = spyOn(instanceUnderTest, '_applyStyleHint').and.callThrough();
			const setLayerStyleSpy = spyOn(olLayer, 'setStyle');
			const olMap = new Map();

			instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(applyStyleHintSpy).toHaveBeenCalledWith(null, olLayer);
			expect(setLayerStyleSpy).not.toHaveBeenCalled();
		});

		it('handles the feature specific styles of the VectorGeoResource containing a StyleHint', () => {
			const olLayer = new VectorLayer({ source: new VectorSource() });
			const vectorGeoResource = new VectorGeoResource('geoResourceId', 'geoResourceLabel', VectorSourceType.KML).setStyleHint(StyleHint.HIGHLIGHT);
			const applyFeatureSpecificStylesSpy = spyOn(instanceUnderTest, '_applyFeatureSpecificStyles').and.callThrough();
			const olMap = new Map();

			instanceUnderTest.applyStyle(olLayer, olMap, vectorGeoResource);

			expect(applyFeatureSpecificStylesSpy).toHaveBeenCalledWith(olLayer, olMap);
		});
	});

	describe('apply feature specific styles', () => {
		it('returns the olLayer ', () => {
			const olMap = new Map();
			const olSource = new VectorSource();
			const olLayer = new VectorLayer({ source: olSource });

			const result = instanceUnderTest._applyFeatureSpecificStyles(olLayer, olMap);

			expect(result).toBe(olLayer);
		});

		describe('when feature that does not needs a specific styling', () => {
			it('does nothing', () => {
				const olMap = new Map();
				const olFeature = new Feature();
				const olSource = new VectorSource();
				const olLayer = new VectorLayer({ source: olSource });
				spyOn(instanceUnderTest, '_detectStyleType').and.returnValue(null);
				const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
				const styleServiceAddSpy = spyOn(instanceUnderTest, 'addFeatureStyle');

				instanceUnderTest._applyFeatureSpecificStyles(olLayer, olMap);
				olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

				expect(styleServiceAddSpy).not.toHaveBeenCalledWith(olFeature, olMap, olLayer);
				expect(registerStyleEventListenersSpy).not.toHaveBeenCalledWith(olSource, olMap);
			});
		});

		describe('checks if a feature needs a specific styling', () => {
			it('adds a style and registers style event listeners', () => {
				const olMap = new Map();
				const olFeature0 = new Feature();
				const olFeature1 = new Feature();
				const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
				const olLayer = new VectorLayer({ source: olSource });
				spyOn(instanceUnderTest, '_detectStyleType').and.returnValue(OlFeatureStyleTypes.NULL);
				const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
				const addFeatureStyleSpy = spyOn(instanceUnderTest, 'addFeatureStyle');
				const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');

				instanceUnderTest._applyFeatureSpecificStyles(olLayer, olMap);

				expect(addFeatureStyleSpy).toHaveBeenCalledWith(olFeature0, olMap, olLayer);
				expect(addFeatureStyleSpy).toHaveBeenCalledWith(olFeature1, olMap, olLayer);
				expect(updateFeatureStyleSpy).toHaveBeenCalledWith(
					olFeature0,
					olMap,
					jasmine.objectContaining({ top: jasmine.any(Boolean), opacity: jasmine.any(Number) })
				);
				expect(updateFeatureStyleSpy).toHaveBeenCalledWith(
					olFeature1,
					olMap,
					jasmine.objectContaining({ top: jasmine.any(Boolean), opacity: jasmine.any(Number) })
				);
				expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
			});

			it('does NOT add a style and does NOT registers style event listeners', () => {
				const olMap = new Map();
				const olFeature0 = new Feature();
				const olFeature1 = new Feature();
				const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
				const olLayer = new VectorLayer({ source: olSource });
				spyOn(instanceUnderTest, '_detectStyleType').and.returnValue(null);
				const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
				const addFeatureStyleSpy = spyOn(instanceUnderTest, 'addFeatureStyle');
				const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');

				instanceUnderTest._applyFeatureSpecificStyles(olLayer, olMap);

				expect(addFeatureStyleSpy).not.toHaveBeenCalled();
				expect(updateFeatureStyleSpy).not.toHaveBeenCalled();
				expect(registerStyleEventListenersSpy).not.toHaveBeenCalled();
			});

			it("does NOT apply style to features when they don't need them", () => {
				const olMap = new Map();
				const olFeature0 = new Feature();
				const olFeature1 = new Feature();
				const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
				const olLayer = new VectorLayer({ source: olSource });
				let firstTimeCall = true;
				spyOn(instanceUnderTest, '_detectStyleType').and.callFake(() => {
					if (firstTimeCall) {
						firstTimeCall = false;
						return OlFeatureStyleTypes.DEFAULT;
					}
					return null;
				});
				const registerStyleEventListenersSpy = spyOn(instanceUnderTest, '_registerStyleEventListeners');
				const addFeatureStyleSpy = spyOn(instanceUnderTest, 'addFeatureStyle');
				const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');

				instanceUnderTest._applyFeatureSpecificStyles(olLayer, olMap);

				expect(addFeatureStyleSpy).not.toHaveBeenCalled();
				expect(updateFeatureStyleSpy).not.toHaveBeenCalled();
				expect(registerStyleEventListenersSpy).toHaveBeenCalledOnceWith(olSource, olLayer, olMap);
			});
		});
	});

	describe('register style events', () => {
		it('adds five listeners', () => {
			const map = new Map();
			spyOn(map, 'getLayers').and.returnValue(new Collection([new VectorLayer()]));
			const { addFeatureListenerKey, removeFeatureListenerKey, clearFeaturesListenerKey, layerChangeListenerKey, layerListChangedListenerKey } =
				instanceUnderTest._registerStyleEventListeners(new VectorSource(), new VectorLayer(), map);

			expect(addFeatureListenerKey).toBeDefined();
			expect(removeFeatureListenerKey).toBeDefined();
			expect(clearFeaturesListenerKey).toBeDefined();
			expect(layerChangeListenerKey).toBeDefined();
			expect(layerListChangedListenerKey).toBeDefined();
		});

		it('calls addFeatureStyle on "addFeature"', () => {
			const id = 'id';
			const olMap = new Map();
			const olSource = new VectorSource();
			const olLayer = new VectorLayer({ id: id });
			const olFeature = new Feature();
			const styleServiceSpy = spyOn(instanceUnderTest, 'addFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

			expect(styleServiceSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
		});

		it('calls updateFeatureStyle on "addFeature" when layer is attached', () => {
			const olMap = new Map();
			const olSource = new VectorSource();
			const olFeature = new Feature();
			const addFeatureStyleSpy = spyOn(instanceUnderTest, 'addFeatureStyle');
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');
			const olLayer = new VectorLayer();
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olSource.dispatchEvent(new VectorSourceEvent('addfeature', olFeature));

			expect(addFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, olLayer);
			expect(updateFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, jasmine.any(Object));
		});

		it('calls #removeStyle on "removeFeature"', () => {
			const olMap = new Map();
			const olSource = new VectorSource();
			const olFeature = new Feature();
			const removeFeatureStyleSpy = spyOn(instanceUnderTest, 'removeFeatureStyle');
			const olLayer = new VectorLayer();
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olSource.dispatchEvent(new VectorSourceEvent('removefeature', olFeature));

			expect(removeFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap);
		});

		it('calls #removeStyle on "clearFeatures"', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const removeFeatureStyleSpy = spyOn(instanceUnderTest, 'removeFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olSource.dispatchEvent(new VectorSourceEvent('clear'));

			expect(removeFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap);
		});

		it('calls #updateFeatureStyle on layer "change:visible"', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olLayer.setVisible(false);

			expect(updateFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, jasmine.any(Object));
		});

		it('calls #updateFeatureStyle on layer "change:opacity"', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olLayer.setOpacity(0.42);

			expect(updateFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, jasmine.any(Object));
		});

		it('calls #updateFeatureStyle on layer "change:zIndex"', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olLayer.setZIndex(1);

			expect(updateFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, jasmine.any(Object));
		});

		it('calls #updateFeatureStyle when layers are added', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const otherOlLayer = new VectorLayer();
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle');
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olMap.getLayers().dispatchEvent(new CollectionEvent('add', otherOlLayer));

			expect(updateFeatureStyleSpy).toHaveBeenCalledWith(olFeature, olMap, jasmine.any(Object));
		});

		it('calls #updateFeatureStyle when layers are removed', () => {
			const olMap = new Map();
			const olFeature = new Feature();
			const olSource = new VectorSource({ features: [olFeature] });
			const olLayer = new VectorLayer();
			const otherOlLayer = new VectorLayer();
			const updateFeatureStyleSpy = spyOn(instanceUnderTest, 'updateFeatureStyle')
				.withArgs(olFeature, olMap, jasmine.any(Object))
				.and.callFake(() => {});
			instanceUnderTest._registerStyleEventListeners(olSource, olLayer, olMap);

			olMap.addLayer(otherOlLayer);
			olMap.removeLayer(otherOlLayer);

			expect(updateFeatureStyleSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('apply style hint', () => {
		it('applies a style function to the cluster layer', () => {
			const layer = new VectorLayer({ id: 'foo' });
			const feature1 = new Feature({ geometry: new Point([0, 0]) });
			const feature2 = new Feature({ geometry: new Point([0, 0]) });
			const clusterFeature = new Feature({ geometry: new Point([0, 0]), features: [feature1, feature2] });

			expect(instanceUnderTest._applyStyleHint(StyleHint.CLUSTER, layer).getStyle()(clusterFeature)).toEqual(
				defaultClusterStyleFunction()(clusterFeature)
			);
			expect(instanceUnderTest._applyStyleHint(StyleHint.HIGHLIGHT, layer).getStyle()).toEqual(highlightGeometryOrCoordinateFeatureStyleFunction());
		});
	});

	describe('detecting StyleTypes ', () => {
		it('detects measure as type from olFeature', () => {
			const feature = { getId: () => 'measure_123' };

			expect(instanceUnderTest._detectStyleType(feature)).toEqual(OlFeatureStyleTypes.MEASURE);
		});

		it('detects drawStyleTypes as type from olFeature', () => {
			const markerFeature = { getId: () => 'draw_marker_123', getKeys: () => [] };
			const textFeature = { getId: () => 'draw_text_123', getKeys: () => [] };
			const lineFeature = { getId: () => 'draw_line_123', getKeys: () => [] };
			const polygonFeature = { getId: () => 'draw_polygon_123', getKeys: () => [] };

			expect(instanceUnderTest._detectStyleType(markerFeature)).toEqual(OlFeatureStyleTypes.MARKER);
			expect(instanceUnderTest._detectStyleType(textFeature)).toEqual(OlFeatureStyleTypes.TEXT);
			expect(instanceUnderTest._detectStyleType(lineFeature)).toEqual(OlFeatureStyleTypes.LINE);
			expect(instanceUnderTest._detectStyleType(polygonFeature)).toEqual(OlFeatureStyleTypes.POLYGON);
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
			expect(instanceUnderTest._detectStyleType(feature1)).toEqual(OlFeatureStyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature2)).toEqual(OlFeatureStyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature3)).toEqual(OlFeatureStyleTypes.GEOJSON);
			expect(instanceUnderTest._detectStyleType(feature4)).toEqual(OlFeatureStyleTypes.GEOJSON);
		});

		it('detects routing as type from olFeature', () => {
			const feature = { getId: () => 'routing_123' };

			expect(instanceUnderTest._detectStyleType(feature)).toEqual(OlFeatureStyleTypes.ROUTING);
		});

		it('detects type attribute as type from olFeature', () => {
			const getFeature = (typeName) => {
				return { getId: () => 'some', getStyle: () => null, getKeys: () => [], get: (key) => (key === 'type' ? typeName : null) };
			};

			expect(instanceUnderTest._detectStyleType(getFeature(OlFeatureStyleTypes.MARKER))).toEqual(OlFeatureStyleTypes.MARKER);
			expect(instanceUnderTest._detectStyleType(getFeature(OlFeatureStyleTypes.ANNOTATION))).toEqual(OlFeatureStyleTypes.ANNOTATION);
			expect(instanceUnderTest._detectStyleType(getFeature(OlFeatureStyleTypes.LINE))).toEqual(OlFeatureStyleTypes.LINE);
			expect(instanceUnderTest._detectStyleType(getFeature(OlFeatureStyleTypes.POLYGON))).toEqual(OlFeatureStyleTypes.POLYGON);
		});

		it('detects default as type from olFeature', () => {
			const feature = { getId: () => 'some', getStyle: () => null, getKeys: () => [], get: () => {} };

			expect(instanceUnderTest._detectStyleType(feature)).toEqual(OlFeatureStyleTypes.DEFAULT);
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

	describe('sanitize Styles', () => {
		it('sanitize each present feature of a layer ', () => {
			const olFeature0 = new Feature();
			const olFeature1 = new Feature();
			const olSource = new VectorSource({ features: [olFeature0, olFeature1] });
			const olLayer = new VectorLayer({ source: olSource });
			const spy = spyOn(instanceUnderTest, '_sanitizeStyleFor')
				.withArgs(jasmine.any(Feature))
				.and.callFake(() => {});

			instanceUnderTest._sanitizeStyles(olLayer);

			expect(spy).toHaveBeenCalledTimes(2);
		});
	});

	describe('sanitize feature style', () => {
		it('does nothing on a feature without a style', () => {
			const featureWithoutStyle = new Feature({ geometry: new Point([0, 0]) });
			const spy = spyOn(featureWithoutStyle, 'setStyle').and.callThrough(() => {});

			instanceUnderTest._sanitizeStyleFor(featureWithoutStyle);

			expect(spy).not.toHaveBeenCalled();
		});

		it('removes the text style on a point feature without a name', () => {
			const feature = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({
					size: [42, 42],
					anchor: [42, 42],
					anchorXUnits: 'pixels',
					anchorYUnits: 'pixels',
					src: 'https://some.url/to/image/foo.png'
				}),
				text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }), scale: 1.2 })
			});
			feature.setStyle([style]);
			const spy = spyOn(feature, 'setStyle').and.callThrough(() => {});

			instanceUnderTest._sanitizeStyleFor(feature);

			expect(spy).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));
			expect(feature.getStyle()[0].getText()).toBeNull();
		});

		it('sanitizes the style for point feature ', () => {
			const featureWithStyle = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }), scale: 1.2 })
			});
			featureWithStyle.set('name', 'bar');
			featureWithStyleArray.set('name', 'bar');
			featureWithStyleFunction.set('name', 'bar');
			featureWithStyle.setStyle(() => style);
			featureWithStyleArray.setStyle([style]);
			featureWithStyleFunction.setStyle(() => [style]);
			const spyStyle = spyOn(featureWithStyle, 'setStyle').and.callThrough();
			const spyStyleArray = spyOn(featureWithStyleArray, 'setStyle').and.callThrough();
			const spyStyleFunction = spyOn(featureWithStyleFunction, 'setStyle').and.callThrough();

			instanceUnderTest._sanitizeStyleFor(featureWithStyle);
			instanceUnderTest._sanitizeStyleFor(featureWithStyleArray);
			instanceUnderTest._sanitizeStyleFor(featureWithStyleFunction);

			// set the new style
			expect(spyStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));
			expect(spyStyleArray).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));
			expect(spyStyleFunction).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));
		});

		it('sanitizes the text & image style for point feature', () => {
			const feature = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({
					size: [42, 42],
					anchor: [42, 42],
					anchorXUnits: 'pixels',
					anchorYUnits: 'pixels',
					src: 'https://some.url/to/image/foo.png',
					scale: 0
				}),
				text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }), scale: 1.2 })
			});
			feature.set('name', 'bar');
			feature.setStyle([style]);
			const spyStyle = spyOn(feature, 'setStyle').and.callThrough();

			instanceUnderTest._sanitizeStyleFor(feature);

			// set the new style
			expect(spyStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));

			// uses the feature name
			expect(feature.getStyle()[0].getText().getText()).toBe('bar');

			// uses the scale
			expect(feature.getStyle()[0].getText().getScale()).toBe(1.2);

			// replaces the icon
			const actualImageStyle = feature.getStyle()[0].getImage();
			const expectedAlphaValue = 0; // 0 -> full transparency; 255 -> full opacity
			const getAlphaValue = (rgbaColorArray) => rgbaColorArray[3];
			expect(actualImageStyle).toEqual(jasmine.any(CircleStyle));
			expect(getAlphaValue(actualImageStyle.getFill().getColor())).toEqual(expectedAlphaValue);
			expect(getAlphaValue(actualImageStyle.getStroke().getColor())).toEqual(expectedAlphaValue);
		});

		it("sanitizes/removes the text style for point feature with feature property 'showPointNames'", () => {
			const feature = new Feature({ geometry: new Point([0, 0]) });
			feature.set(asInternalProperty('showPointNames'), false);
			const style = new Style({
				image: new Icon({
					size: [42, 42],
					anchor: [42, 42],
					anchorXUnits: 'pixels',
					anchorYUnits: 'pixels',
					src: 'https://some.url/to/image/foo.png',
					scale: 0
				}),
				text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }), scale: 1.2 })
			});
			feature.set('name', 'bar');
			feature.setStyle([style]);
			const spyStyle = spyOn(feature, 'setStyle').and.callThrough();

			instanceUnderTest._sanitizeStyleFor(feature);

			// set the new style
			expect(spyStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));

			// respects the feature property and set no text style...
			expect(feature.getStyle()[0].getText()).toBeNull();

			// ...although replaces the icon
			const actualImageStyle = feature.getStyle()[0].getImage();
			const expectedAlphaValue = 0; // 0 -> full transparency; 255 -> full opacity
			const getAlphaValue = (rgbaColorArray) => rgbaColorArray[3];
			expect(actualImageStyle).toEqual(jasmine.any(CircleStyle));
			expect(getAlphaValue(actualImageStyle.getFill().getColor())).toEqual(expectedAlphaValue);
			expect(getAlphaValue(actualImageStyle.getStroke().getColor())).toEqual(expectedAlphaValue);
		});

		it('sanitizes the stroke style for point feature', () => {
			const feature = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({
				image: new Icon({
					size: [42, 42],
					anchor: [42, 42],
					anchorXUnits: 'pixels',
					anchorYUnits: 'pixels',
					src: 'https://some.url/to/image/foo.png',
					scale: 0
				}),
				text: new TextStyle({ text: 'foo', fill: new Fill({ color: [42, 21, 0] }), scale: 1.2 }),
				stroke: new Stroke({
					color: [255, 0, 0, 0.9],
					width: 0
				})
			});

			feature.set('name', 'bar');
			feature.setStyle(() => [style]);
			const spyStyle = spyOn(feature, 'setStyle').and.callThrough();

			instanceUnderTest._sanitizeStyleFor(feature);

			expect(spyStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));

			expect(feature.getStyle()[0].getStroke()).toBeNull();
		});

		it('sanitizes the stroke style for line & polygon feature', () => {
			const lineStringFeature = new Feature({
				geometry: new LineString([
					[0, 0],
					[10, 0]
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
			const style = new Style({
				fill: new Fill({ color: [42, 21, 0] }),
				stroke: new Stroke({
					color: [255, 0, 0, 0.9],
					width: 0
				})
			});

			lineStringFeature.setStyle(() => [style]);
			polygonFeature.setStyle(() => [style]);
			const spyLineStringStyle = spyOn(lineStringFeature, 'setStyle').and.callThrough();
			const spyPolygonStyle = spyOn(polygonFeature, 'setStyle').and.callThrough();

			instanceUnderTest._sanitizeStyleFor(lineStringFeature);
			instanceUnderTest._sanitizeStyleFor(polygonFeature);

			expect(spyLineStringStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));
			expect(spyPolygonStyle).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.any(Style)]));

			expect(lineStringFeature.getStyle()[0].getStroke()).toBeNull();
			expect(polygonFeature.getStyle()[0].getStroke()).toBeNull();
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
