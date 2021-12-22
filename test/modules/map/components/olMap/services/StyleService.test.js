import { Feature } from 'ol';
import { $injector } from '../../../../../../src/injection';
import { TestUtils } from '../../../../../test-utils.js';
import { StyleService, StyleTypes } from '../../../../../../src/modules/map/components/olMap/services/StyleService';
import { OverlayService } from '../../../../../../src/modules/map/components/olMap/services/OverlayService';
import { Polygon, Point } from 'ol/geom';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { Icon, Style, Text } from 'ol/style';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
describe('StyleService', () => {

	const mapServiceMock = { getSrid: () => 3857, getDefaultGeodeticSrid: () => 25832 };

	const environmentServiceMock = {
		isTouch() { },
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
		TestUtils.setupStoreAndDi();
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
			const markerFeature = { getId: () => 'draw_marker_123' };
			const textFeature = { getId: () => 'draw_text_123' };
			const lineFeature = { getId: () => 'draw_line_123' };
			const polygonFeature = { getId: () => 'draw_polygon_123' };

			expect(instanceUnderTest._detectStyleType(markerFeature)).toEqual(StyleTypes.MARKER);
			expect(instanceUnderTest._detectStyleType(textFeature)).toEqual(StyleTypes.TEXT);
			expect(instanceUnderTest._detectStyleType(lineFeature)).toEqual(StyleTypes.LINE);
			expect(instanceUnderTest._detectStyleType(polygonFeature)).toEqual(StyleTypes.POLYGON);
		});


		it('detects not the type from olFeature', () => {
			const feature1 = { getId: () => 'mea_sure_123' };
			const feature2 = { getId: () => '123_measure_123' };
			const feature3 = { getId: () => ' measure_123' };
			const feature4 = { getId: () => '123measure_123' };

			expect(instanceUnderTest._detectStyleType(undefined)).toBeNull();
			expect(instanceUnderTest._detectStyleType(null)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature1)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature2)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature3)).toBeNull();
			expect(instanceUnderTest._detectStyleType(feature4)).toBeNull();
		});
	});

	describe('add style', () => {
		it('adds measure-style to feature with implicit style-type', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			feature.setId('measure_123');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
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

			instanceUnderTest.addStyle(feature, mapMock);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('adds measure-style to feature with explicit style-type', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
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

			instanceUnderTest.addStyle(feature, mapMock, StyleTypes.MEASURE);

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('adds text-style to feature with explicit style-type', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({ text: new Text({ text: 'foo' }) });
			featureWithStyleArray.setId('draw_text_12345678');
			featureWithStyleFunction.setId('draw_text_9876543');
			featureWithStyleArray.setStyle([style]);
			featureWithStyleFunction.setStyle(() => style);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			let textStyle = null;
			const styleSetterArraySpy = spyOn(featureWithStyleArray, 'setStyle').and.callFake((f => textStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleArray, mapMock, StyleTypes.TEXT);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));

			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f => textStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleFunction, mapMock, StyleTypes.TEXT);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(textStyle).toContain(jasmine.any(Style));
		});

		it('adds marker-style to feature with explicit style-type', () => {
			const featureWithStyleArray = new Feature({ geometry: new Point([0, 0]) });
			const featureWithStyleFunction = new Feature({ geometry: new Point([0, 0]) });
			const style = new Style({ image: new Icon({ src: 'http://foo.bar/icon.png', anchor: [0.5, 1], anchorXUnits: 'fraction', anchorYUnits: 'fraction', color: '#ff0000' }), text: new Text({ text: 'foo' }) });
			featureWithStyleArray.setId('draw_marker_12345678');
			featureWithStyleFunction.setId('draw_marker_9876543');
			featureWithStyleArray.setStyle([style]);
			featureWithStyleFunction.setStyle(() => [style]);

			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};
			let markerStyle = null;
			const styleSetterArraySpy = spyOn(featureWithStyleArray, 'setStyle').and.callFake((f => markerStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleArray, mapMock, StyleTypes.MARKER);
			expect(styleSetterArraySpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));

			const styleSetterFunctionSpy = spyOn(featureWithStyleFunction, 'setStyle').and.callFake((f => markerStyle = f()));
			instanceUnderTest.addStyle(featureWithStyleFunction, mapMock, StyleTypes.MARKER);
			expect(styleSetterFunctionSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(markerStyle).toContain(jasmine.any(Style));
		});

		it('adds NO style to feature with explicit style-type of LINE or POLYGON', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.addStyle(feature, mapMock, StyleTypes.LINE);
			instanceUnderTest.addStyle(feature, mapMock, StyleTypes.POLYGON);

			expect(styleSetterSpy).not.toHaveBeenCalled();
		});

		it('adds draw-style to feature with explicit style-type', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
			};

			const mapMock = {
				getView: () => viewMock,
				getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.addStyle(feature, mapMock, 'draw');

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
		});

		it('adding style to feature with unknown style-type fails', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			const addOverlaySpy = jasmine.createSpy();
			const warnSpy = spyOn(console, 'warn');
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
			};
			const mapMock = {
				getView: () => viewMock, addOverlay: addOverlaySpy, getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.addStyle(feature, mapMock, 'unknown');

			expect(styleSetterSpy).not.toHaveBeenCalledWith(jasmine.any(Array));
			expect(propertySetterSpy).not.toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(addOverlaySpy).not.toHaveBeenCalled();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type:', 'unknown');
		});


		it('registers initial styling events for measure-feature without partition-delta property', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
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
				once() { }
			};
			const eventMock = { map: mapMock };
			const onceOnMapSpy = spyOn(mapMock, 'once').and.callFake((eventName, callback) => callback(eventMock));

			instanceUnderTest.addStyle(feature, mapMock, 'measure');

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(onceOnViewSpy).toHaveBeenCalledWith('change:resolution', jasmine.any(Function));
			expect(onceOnMapSpy).toHaveBeenCalledWith('moveend', jasmine.any(Function));
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
		});

		it('registers NOT initial styling events for measure-feature without partition-delta property', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			feature.set('partition_delta', 'something');
			const addOverlaySpy = jasmine.createSpy();
			const styleSetterSpy = spyOn(feature, 'setStyle');
			const propertySetterSpy = spyOn(feature, 'set');
			const viewMock = {
				getResolution() {
					return 50;
				},
				once() { }
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

			instanceUnderTest.addStyle(feature, mapMock, 'measure');

			expect(styleSetterSpy).toHaveBeenCalledWith(jasmine.any(Function));
			expect(propertySetterSpy).toHaveBeenCalledWith('overlays', jasmine.any(Object));
			expect(onceSpy).not.toHaveBeenCalled();
			expect(addOverlaySpy).toHaveBeenCalledTimes(2);
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
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
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
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
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
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
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
			expect(instanceUnderTest.getStyleFunction(StyleTypes.HIGHLIGHT)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.HIGHLIGHT_TEMP)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.MARKER)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.TEXT)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.LINE)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.POLYGON)).toEqual(jasmine.any(Function));
			expect(instanceUnderTest.getStyleFunction(StyleTypes.DRAW)).toEqual(jasmine.any(Function));
		});

		it('fails for a invalid StyleType', () => {
			const warnSpy = spyOn(console, 'warn');

			const styleFunction = instanceUnderTest.getStyleFunction('unknown');

			expect(styleFunction).toBeUndefined();
			expect(warnSpy).toHaveBeenCalledWith('Could not provide a style for unknown style-type:', 'unknown');
		});


	});

	describe('removes styles', () => {
		it('removes a style from feature', () => {
			const feature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			feature.set('overlays', [{}, {}]);
			const removeOverlaySpy = jasmine.createSpy();
			const viewMock = {
				getResolution() {
					return 50;
				}
			};
			const mapMock = {
				getView: () => viewMock, removeOverlay: removeOverlaySpy, getInteractions() {
					return { getArray: () => [] };
				}
			};

			instanceUnderTest.removeStyle(feature, mapMock);

			expect(removeOverlaySpy).toHaveBeenCalledTimes(2);
		});
	});

	describe('tests if a style is required', () => {
		it('tests that a style is required', () => {
			const featureToBeStyled = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			featureToBeStyled.setId('measure_123');
			const featureNotToBeStyled = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });
			featureNotToBeStyled.setId('foo_123');

			expect(instanceUnderTest.isStyleRequired(featureToBeStyled)).toBeTrue();
			expect(instanceUnderTest.isStyleRequired(featureNotToBeStyled)).toBeFalse();
		});
	});
});
