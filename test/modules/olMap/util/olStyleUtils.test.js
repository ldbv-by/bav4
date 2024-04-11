import {
	measureStyleFunction,
	createSketchStyleFunction,
	modifyStyleFunction,
	nullStyleFunction,
	markerStyleFunction,
	selectStyleFunction,
	getColorFrom,
	lineStyleFunction,
	polygonStyleFunction,
	textStyleFunction,
	getIconUrl,
	getMarkerSrc,
	getDrawingTypeFrom,
	getSymbolFrom,
	markerScaleToKeyword,
	getTextFrom,
	getStyleArray,
	renderRulerSegments,
	defaultStyleFunction,
	defaultClusterStyleFunction,
	geojsonStyleFunction,
	DEFAULT_TEXT,
	getSizeFrom,
	textScaleToKeyword,
	getTransparentImageStyle
} from '../../../../src/modules/olMap/utils/olStyleUtils';
import { Point, LineString, Polygon, Geometry } from 'ol/geom';
import { Feature } from 'ol';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
register(proj4);
import markerIcon from '../../../../src/modules/olMap/assets/marker.svg';
import { Fill, Icon, Stroke, Style, Text, Text as TextStyle } from 'ol/style';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import CircleStyle from 'ol/style/Circle';
import { hexToRgb } from '../../../../src/utils/colors';

const Rgb_Black = [0, 0, 0];
const Expected_Text_Font = 'normal 16px OpenSans';

const configService = {
	getValue: () => {},
	getValueAsPath: () => 'http://backend.url/'
};

const environmentService = {
	isStandalone: () => false
};

const iconServiceMock = { decodeColor: () => [0, 0, 0] };

const mapServiceMock = {
	getSrid: () => 3857,
	calcLength: () => 42
};

beforeAll(() => {
	TestUtils.setupStoreAndDi();
	$injector
		.registerSingleton('EnvironmentService', environmentService)
		.registerSingleton('ConfigService', configService)
		.registerSingleton('IconService', iconServiceMock)
		.registerSingleton('MapService', mapServiceMock);
});

const getFeatureWithProperties = (properties, geometry = null) => {
	const defaultGeometry = new LineString([
		[0, 0],
		[1, 0]
	]);
	const feature = new Feature({ geometry: geometry ?? defaultGeometry });

	for (const [key, value] of Object.entries(properties)) {
		feature.set(key, value);
	}

	return feature;
};

const getClusterFeature = () => {
	const feature1 = new Feature({ geometry: new Point([0, 0]) });
	const feature2 = new Feature({ geometry: new Point([0, 0]) });
	return new Feature({ geometry: new Point([0, 0]), features: [feature1, feature2] });
};

describe('getMarkerSrc', () => {
	it('returns a default marker source', () => {
		expect(getMarkerSrc()).toBe('http://backend.url/icons/255,255,255/marker');
	});

	it('returns a defined marker source, when markersource is invalid', () => {
		const symbolName = 'foo';
		const color = '#ff0000';
		expect(getMarkerSrc(symbolName, color)).toBe('http://backend.url/icons/255,0,0/marker');
	});

	it('does nothing when markerSrc is already a URL', () => {
		const markerSrc = 'http://foo.bar/42/baz';
		expect(getMarkerSrc(markerSrc)).toBe('http://foo.bar/42/baz');
	});
});

describe('textScaleToKeyword', () => {
	it('should map to keyword', () => {
		expect(textScaleToKeyword(2)).toBe('large');
		expect(textScaleToKeyword(1.5)).toBe('medium');
		expect(textScaleToKeyword(1)).toBe('small');
		expect(textScaleToKeyword(null)).toBe('small');
		expect(textScaleToKeyword('something')).toBe('small');
		expect(textScaleToKeyword(true)).toBe('small');
		expect(textScaleToKeyword(false)).toBe('small');
	});
});

describe('markerScaleToKeyword', () => {
	it('should map to keyword', () => {
		expect(markerScaleToKeyword(1)).toBe('large');
		expect(markerScaleToKeyword(0.75)).toBe('medium');
		expect(markerScaleToKeyword(0.5)).toBe('small');
		expect(markerScaleToKeyword(2)).toBe(2);
		expect(markerScaleToKeyword(null)).toBe('small');
		expect(markerScaleToKeyword('something')).toBe('small');
		expect(markerScaleToKeyword(true)).toBe('small');
		expect(markerScaleToKeyword(false)).toBe('small');
	});
});

describe('measureStyleFunction', () => {
	const geometry = new LineString([
		[0, 0],
		[1, 0]
	]);
	const feature = new Feature({ geometry: geometry });
	const resolution = 1;
	it('should create styles', () => {
		const styles = measureStyleFunction(feature, resolution);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(2);
	});

	it('should have a style which creates circle for Lines', () => {
		const styles = measureStyleFunction(feature, resolution);

		const circleStyle = styles.find((style) => {
			const geometryFunction = style.getGeometryFunction();
			if (geometryFunction) {
				const renderObject = geometryFunction(feature, resolution);
				return renderObject.getType() === 'Circle';
			} else {
				return false;
			}
		});
		const geometryFunction = circleStyle.getGeometryFunction();

		const lineFeature = feature;
		const pointFeature = new Feature({ geometry: new Point([0, 0]) });
		const circle = geometryFunction(lineFeature);
		const nonCircle = geometryFunction(pointFeature);

		expect(circle).toBeTruthy();
		expect(nonCircle).toBeFalsy();
		expect(circleStyle).toBeTruthy();
	});

	it('should have a fallback-style', () => {
		const styles = measureStyleFunction(feature, null);

		expect(styles).toHaveSize(2);
		expect(styles[1].getStroke().getColor()).toEqual([255, 0, 0, 1]);
		expect(styles[1].getStroke().getLineDash()).toEqual([8]);
		expect(styles[1].getStroke().getWidth()).toBe(2);
		expect(styles[1].getFill().getColor()).toEqual([255, 0, 0, 0.4]);
	});

	it('should have a ruler-style with renderer-function', () => {
		const styles = measureStyleFunction(feature, resolution);

		const rulerStyle = styles.find((style) => style.getRenderer != null);

		expect(rulerStyle).toBeDefined();
	});

	it('should have a ruler-style with renderer-function, which uses customContextRenderFunction', () => {
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);
		const styles = measureStyleFunction(feature, resolution);
		const stateMock = { context: null, geometry: geometry, pixelRatio: 1, resolution: 1, customContextRenderFunction: () => {} };
		const spy = spyOn(stateMock, 'customContextRenderFunction');
		const rulerStyle = styles.find((style) => style.getRenderer != null && typeof style.getRenderer() == 'function');
		rulerStyle.getRenderer()(
			[
				[0, 0],
				[1, 1]
			],
			stateMock
		);

		expect(spy).toHaveBeenCalled();
	});

	it('should draw to context with ruler-style', () => {
		const pixelCoordinates = [
			[0, 0],
			[1, 1]
		];
		const contextMock = {
			canvas: { width: 100, height: 100, style: { width: 100, height: 100 } },
			stroke: () => new Stroke(),
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			setLineDash: () => {}
		};
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);
		const stateMock = { context: contextMock, geometry: feature.getGeometry() };
		const styles = measureStyleFunction(feature, resolution);
		const rulerStyle = styles.find((style) => style.getRenderer());

		const contextMoveToSpy = spyOn(contextMock, 'moveTo');
		const customRenderer = rulerStyle.getRenderer();
		customRenderer(pixelCoordinates, stateMock);

		expect(contextMoveToSpy).toHaveBeenCalled();
	});
});

describe('renderRulerSegments', () => {
	const geometry = new LineString([
		[0, 0],
		[1, 0]
	]);
	const feature = new Feature({ geometry: geometry });
	const resolution = 1;
	it('should call contextRenderer', () => {
		const contextRenderer = jasmine.createSpy();
		const stateMock = { geometry: feature.getGeometry(), resolution: resolution };
		const pixelCoordinates = [
			[0, 0],
			[0, 1]
		];
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);

		renderRulerSegments(pixelCoordinates, stateMock, contextRenderer);
		expect(contextRenderer).toHaveBeenCalledTimes(1 + 1 + 1); //baseStroke + mainStroke + subStroke
		expect(contextRenderer).toHaveBeenCalledWith(jasmine.any(Geometry), jasmine.any(Fill), jasmine.any(Stroke));
	});

	it('should call contextRenderer with subTickStroke', () => {
		const expectedSubStroke = new Stroke({
			color: [255, 0, 0, 1],
			width: 5,
			lineCap: 'butt',
			lineDash: [2, -1.8],
			lineDashOffset: 2
		});
		const actualStrokes = [];
		const contextRendererStub = (geometry, fill, stroke) => {
			actualStrokes.push(stroke);
		};
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);
		const stateMock = { geometry: feature.getGeometry(), resolution: resolution, pixelRatio: 1 };
		const pixelCoordinates = [
			[0, 0],
			[0, 1]
		];
		renderRulerSegments(pixelCoordinates, stateMock, contextRendererStub);

		expect(actualStrokes).toContain(expectedSubStroke);
	});

	it('should call contextRenderer with mainTickStroke', () => {
		const expectedMainStroke = new Stroke({
			color: [255, 0, 0, 1],
			width: 8,
			lineCap: 'butt',
			lineDash: [3, -2],
			lineDashOffset: 3
		});
		const actualStrokes = [];
		const contextRendererStub = (geometry, fill, stroke) => {
			actualStrokes.push(stroke);
		};
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);
		const stateMock = { geometry: feature.getGeometry(), resolution: resolution, pixelRatio: 1 };
		const pixelCoordinates = [
			[0, 0],
			[0, 1]
		];
		renderRulerSegments(pixelCoordinates, stateMock, contextRendererStub);

		expect(actualStrokes).toContain(expectedMainStroke);
	});

	it('should use exteriorRing of Polygon for segment-coordinates', () => {
		const actualStrokes = [];
		const contextRendererStub = (geometry, fill, stroke) => {
			actualStrokes.push(stroke);
		};
		spyOn(mapServiceMock, 'calcLength').and.returnValue(1);
		const stateMock = {
			geometry: new Polygon([
				[
					[0, 0],
					[0, 1],
					[1, 0]
				]
			]),
			resolution: resolution,
			pixelRatio: 1
		};
		const pixelCoordinates = [
			[0, 0],
			[0, 1]
		];
		renderRulerSegments(pixelCoordinates, stateMock, contextRendererStub);

		expect(actualStrokes).toBeTruthy();
	});
});

describe('nullStyleFunction', () => {
	it('should return a style', () => {
		const styles = nullStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});
});

describe('geojsonStyleFunction', () => {
	it('should return a default style', () => {
		const styles = geojsonStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
		expect(styles[0].getImage().getFill().getColor()).toEqual([255, 255, 255, 1]);
		expect(styles[0].getImage().getRadius()).toBe(5);
		expect(styles[0].getStroke().getColor()).toEqual([85, 85, 85, 1]);
		expect(styles[0].getStroke().getWidth()).toBe(3);
		expect(styles[0].getFill().getColor()).toEqual([85, 85, 85, 0.6]);
	});

	it('should return a image style', () => {
		const smallPointFeature = getFeatureWithProperties({ 'marker-size': 'small', 'marker-color': '#ffff00' });
		const mediumPointFeature = getFeatureWithProperties({ 'marker-size': 'medium', 'marker-color': '#00ff00' });
		const largePointFeature = getFeatureWithProperties({ 'marker-size': 'large', 'marker-color': '#0000ff' });
		const numberMarkerSizePointFeature = getFeatureWithProperties({ 'marker-size': 42, 'marker-color': '#0000ff' });

		const smallPointStyles = geojsonStyleFunction(smallPointFeature);
		const mediumPointStyles = geojsonStyleFunction(mediumPointFeature);
		const largePointStyles = geojsonStyleFunction(largePointFeature);
		const numberMarkerSizePointStyle = geojsonStyleFunction(numberMarkerSizePointFeature);

		expect(smallPointStyles).toBeDefined();
		expect(smallPointStyles.length).toBe(1);
		expect(smallPointStyles[0].getImage().getFill().getColor()).toEqual([255, 255, 0, 1]);
		expect(smallPointStyles[0].getImage().getRadius()).toBe(3);

		expect(mediumPointStyles).toBeDefined();
		expect(mediumPointStyles.length).toBe(1);
		expect(mediumPointStyles[0].getImage().getFill().getColor()).toEqual([0, 255, 0, 1]);
		expect(mediumPointStyles[0].getImage().getRadius()).toBe(5);

		expect(largePointStyles).toBeDefined();
		expect(largePointStyles.length).toBe(1);
		expect(largePointStyles[0].getImage().getFill().getColor()).toEqual([0, 0, 255, 1]);
		expect(largePointStyles[0].getImage().getRadius()).toBe(7);

		expect(numberMarkerSizePointStyle).toBeDefined();
		expect(numberMarkerSizePointStyle.length).toBe(1);
		expect(numberMarkerSizePointStyle[0].getImage().getFill().getColor()).toEqual([0, 0, 255, 1]);
		expect(numberMarkerSizePointStyle[0].getImage().getRadius()).toBe(42);
	});

	it('should return a stroke style', () => {
		const lineFeature = getFeatureWithProperties({ 'stroke-opacity': 0.42, stroke: '#ffff00', 'stroke-width': 4 });

		const lineStyles = geojsonStyleFunction(lineFeature);

		expect(lineStyles).toBeDefined();
		expect(lineStyles.length).toBe(1);
		expect(lineStyles[0].getStroke().getColor()).toEqual([255, 255, 0, 0.42]);
		expect(lineStyles[0].getStroke().getWidth()).toBe(4);
	});

	it('should return a fill style', () => {
		const lineFeature = getFeatureWithProperties({ 'fill-opacity': 0.21, fill: '#00ff00' });

		const lineStyles = geojsonStyleFunction(lineFeature);

		expect(lineStyles).toBeDefined();
		expect(lineStyles.length).toBe(1);
		expect(lineStyles[0].getFill().getColor()).toEqual([0, 255, 0, 0.21]);
	});
});

describe('defaultStyleFunction', () => {
	it('should return a style with color', () => {
		const styleFunction = defaultStyleFunction([0, 0, 0, 0]);
		const getFeatureMock = (geometryType) => {
			const geometryMock = { getType: () => geometryType };
			return { getGeometry: () => geometryMock };
		};
		const pointStyles = styleFunction(getFeatureMock('Point'));
		const lineStyles = styleFunction(getFeatureMock('LineString'));
		const polygonStyles = styleFunction(getFeatureMock('Polygon'));
		const collectionStyles = styleFunction(getFeatureMock('GeometryCollection'));

		expect(pointStyles.length).toBe(1);
		expect(pointStyles[0].getImage().getFill().getColor()).toEqual([0, 0, 0, 0]);
		expect(pointStyles[0].getImage().getRadius()).toBe(5);

		expect(lineStyles.length).toBe(1);
		expect(lineStyles[0].getStroke().getColor()).toEqual([0, 0, 0]);
		expect(lineStyles[0].getStroke().getWidth()).toBe(3);

		expect(polygonStyles.length).toBe(1);
		expect(polygonStyles[0].getStroke().getColor()).toEqual([0, 0, 0]);
		expect(polygonStyles[0].getStroke().getWidth()).toBe(2);
		expect(polygonStyles[0].getFill().getColor()).toEqual([0, 0, 0, 0]);

		expect(collectionStyles.length).toBe(1);
		expect(collectionStyles[0].getImage().getFill().getColor()).toEqual([0, 0, 0, 0]);
		expect(collectionStyles[0].getImage().getRadius()).toBe(5);
		expect(collectionStyles[0].getStroke().getColor()).toEqual([0, 0, 0]);
		expect(collectionStyles[0].getStroke().getWidth()).toBe(2);
		expect(collectionStyles[0].getFill().getColor()).toEqual([0, 0, 0, 0]);
	});
});

describe('markerStyleFunction', () => {
	const imageLoadDelayTime = 80;
	it('should return a style', () => {
		const styles = markerStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a default Image for offline-modus', () => {
		spyOn(environmentService, 'isStandalone').and.returnValue(true);
		const styles = markerStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
	});

	it('should return a style with a default Image', () => {
		const styleOption = { color: '#BEDA55', scale: 'small' };
		spyOn(environmentService, 'isStandalone').and.returnValue(() => true);
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.5);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
	});

	it('should return a style with a default anchor', async () => {
		const styleOption = { color: '#BEDA55', scale: 'small', anchor: null };
		spyOn(environmentService, 'isStandalone').and.returnValue(() => true);
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const iconStyle = styles[0].getImage();
		expect(iconStyle).toBeTruthy();

		// we must preload the IconImage and wait until the image-resource is loaded, to get valid
		// a normalized anchor
		iconStyle.load();
		await TestUtils.timeout(imageLoadDelayTime);

		expect(iconStyle.getAnchor()).toEqual([16, 16]); // the default markerIcon have a size of 32x32 px
	});

	it('should return a style with a specific anchor', async () => {
		const styleOption = { color: '#BEDA55', scale: 'large', anchor: [1, 1] };
		spyOn(environmentService, 'isStandalone').and.returnValue(() => true);
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const iconStyle = styles[0].getImage();
		expect(iconStyle).toBeTruthy();

		// we must preload the IconImage and wait until the image-resource is loaded, to get valid
		// a normalized anchor
		iconStyle.load();
		await TestUtils.timeout(imageLoadDelayTime);

		expect(iconStyle.getAnchor()).toEqual([32, 32]); // the default markerIcon have a size of 32x32 px
	});

	it('should return a style with a Text', () => {
		const styleOption = { color: '#BEDA55', scale: 'small', text: 'foo' };
		spyOn(environmentService, 'isStandalone').and.returnValue(() => true);
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		expect(styles[0].getText().getText()).toBe('foo');
		expect(styles[0].getText().getOffsetY()).toBe(2);
		expect(styles[0].getText().getFont()).toBe(Expected_Text_Font);
	});

	it('should return a style WITHOUT a Text', () => {
		const styleOption = { color: '#BEDA55', scale: 'small' };
		spyOn(environmentService, 'isStandalone').and.returnValue(() => true);
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		expect(styles[0].getText()).toBeNull();
	});

	it('should return a style specified by styleOption; small image', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 'small' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.5);
	});

	it('should return a style specified by styleOption; medium image', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 'medium' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.75);
	});

	it('should return a style specified by styleOption; large image', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 'large' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(1);
	});

	it('should return a style specified by styleOption; scale value as number', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.75 };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.75);
	});
});

describe('textStyleFunction', () => {
	it('should return a style', () => {
		const styles = textStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a default Text', () => {
		const styles = textStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getText().getText()).toBe(DEFAULT_TEXT);
		expect(styles[0].getText().getFont()).toBe(Expected_Text_Font);
	});

	it('should return a style specified by styleOption; large text', () => {
		const styleOption = { color: '#BEDA55', scale: 'large', text: 'Foo' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Foo');
		expect(textStyle.getScale()).toBe(2);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([1]));
		expect(textStyle.getFont()).toBe(Expected_Text_Font);
	});

	it('should return a style specified by styleOption; medium text', () => {
		const styleOption = { color: '#BEDA55', scale: 'medium', text: 'Bar' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Bar');
		expect(textStyle.getScale()).toBe(1.5);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([1]));
		expect(textStyle.getFont()).toBe(Expected_Text_Font);
	});

	it('should return a style specified by styleOption; small text', () => {
		const styleOption = { color: '#BEDA55', scale: 'small', text: 'Bar' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Bar');
		expect(textStyle.getScale()).toBe(1);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([1]));
		expect(textStyle.getFont()).toBe(Expected_Text_Font);
	});

	it('should return a style specified by styleOption; text scale as number ', () => {
		const styleOption = { color: '#BEDA55', scale: 2, text: 'Foo' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Foo');
		expect(textStyle.getScale()).toBe(2);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([1]));
		expect(textStyle.getFont()).toBe(Expected_Text_Font);
	});
});

describe('lineStyleFunction', () => {
	it('should return a style', () => {
		const styles = lineStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a default Stroke', () => {
		const styles = lineStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getStroke().getWidth()).toBe(3);
	});

	it('should return a style specified by styleOption', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.5 };
		const styles = lineStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const stroke = styles[0].getStroke();
		expect(stroke).toBeTruthy();

		expect(stroke.getColor()).toEqual([190, 218, 85, 1]);
		expect(stroke.getWidth()).toBe(3);
	});
});

describe('polygonStyleFunction', () => {
	it('should return a style', () => {
		const styles = polygonStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a default Stroke', () => {
		const styles = polygonStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getStroke().getWidth()).toBe(3);
	});

	it('should return a style specified by styleOption', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55' };
		const styles = polygonStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const stroke = styles[0].getStroke();
		const fill = styles[0].getFill();
		expect(stroke).toBeTruthy();
		expect(fill).toBeTruthy();

		expect(fill.getColor()).toEqual([190, 218, 85, 0.4]);
		expect(stroke.getColor()).toEqual([190, 218, 85, 1]);
		expect(stroke.getWidth()).toBe(3);
	});
});

describe('modifyStyleFunction', () => {
	it('should return a style with a default-color', () => {
		const expectedStyle = new Style({
			image: new CircleStyle({
				radius: 6,
				stroke: new Stroke({
					color: [255, 255, 255],
					width: 3
				}),
				fill: new Fill({
					color: [255, 0, 0]
				})
			})
		});

		const styles = modifyStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);

		const style = styles[0];
		expect(style).toEqual(expectedStyle);
	});

	it('should return a style with the feature-color over sketchFeature', () => {
		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		const featureColor = hexToRgb('#010203');

		const featureStyle = new Style({ stroke: new Stroke({ color: featureColor, width: 2 }) });
		feature.setStyle([featureStyle]);

		const expectedStyle = new Style({
			image: new CircleStyle({
				radius: 6,
				stroke: new Stroke({
					color: [255, 255, 255],
					width: 3
				}),
				fill: new Fill({
					color: '#010203'
				})
			})
		});

		const modifyFeatureMock = { get: () => [feature] };
		const styles = modifyStyleFunction(modifyFeatureMock);

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);

		const style = styles[0];
		expect(style).toEqual(expectedStyle);
	});

	it('should NOT return a style with the feature-color', () => {
		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		const featureColor = hexToRgb('#010203');

		const featureStyle = new Style({ stroke: new Stroke({ color: featureColor, width: 2 }) });
		feature.setStyle([featureStyle]);

		const expectedStyle = new Style({
			image: new CircleStyle({
				radius: 6,
				stroke: new Stroke({
					color: [255, 255, 255],
					width: 3
				}),
				fill: new Fill({
					color: [255, 0, 0]
				})
			})
		});

		const modifyFeatureMock = { get: () => [] };
		const styles = modifyStyleFunction(modifyFeatureMock);

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);

		const style = styles[0];
		expect(style).toEqual(expectedStyle);
	});
});

describe('selectStyleFunction', () => {
	it('should create a stylefunction', () => {
		const styleFunction = selectStyleFunction();

		expect(styleFunction).toBeDefined();
	});

	it('should append a style', () => {
		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const featureWithStyle = new Feature({ geometry: geometry });
		featureWithStyle.setStyle(defaultStyleFunction([0, 0, 0, 0]));
		const featureWithEmptyFirstStyle = new Feature({ geometry: geometry });
		const featureWithoutStyles = new Feature({ geometry: geometry });
		featureWithEmptyFirstStyle.setStyle(() => []);
		const styleFunction = selectStyleFunction();

		expect(styleFunction(featureWithStyle).length).toBe(2);
		expect(styleFunction(featureWithEmptyFirstStyle).length).toBe(2);
		expect(styleFunction(featureWithoutStyles).length).toBe(1);
	});

	it('should add a style which creates MultiPoints for the polygon-vertices', () => {
		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		feature.setStyle(nullStyleFunction);
		const styleFunction = selectStyleFunction();
		const styles = styleFunction(feature);

		const vertexStyle = styles[1];
		const geometryFunction = vertexStyle.getGeometryFunction();

		const lineFeature = feature;
		const pointFeature = new Feature({ geometry: new Point([0, 0]) });
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

		expect(geometryFunction(lineFeature)).toBeTruthy();
		expect(geometryFunction(pointFeature)).toBeTruthy();
		expect(geometryFunction(polygonFeature)).toBeTruthy();
	});
});

describe('defaultClusterStyleFunction', () => {
	const expectedShadowStyle = new Style({
		image: new CircleStyle({
			radius: 17,
			fill: new Fill({
				color: [0, 0, 0, 0.15]
			})
		})
	});

	const expectedNumberPlateStyle = new Style({
		image: new CircleStyle({
			radius: 15,
			stroke: new Stroke({
				color: [255, 255, 255]
			}),
			fill: new Fill({
				color: '#099dda'
			}),
			displacement: [0, 1]
		}),
		text: new TextStyle({
			text: '2',
			scale: 1.5,
			fill: new Fill({
				color: [255, 255, 255]
			}),
			font: 'normal 16px OpenSans'
		})
	});

	it('should create a style function', () => {
		const styleFunction = defaultClusterStyleFunction();

		expect(styleFunction).toBeDefined();
	});

	it('should create a style for a cluster feature', () => {
		const clusterFeature = getClusterFeature();

		const styleFunction = defaultClusterStyleFunction();
		const styles = styleFunction(clusterFeature, null);

		expect(styles).toBeTruthy();
		expect(styles).toHaveSize(2);
		expect(styles[0]).toEqual(expectedShadowStyle);
		expect(styles[1]).toEqual(expectedNumberPlateStyle);
	});

	it('should use a cached cluster style', () => {
		const clusterFeature1 = getClusterFeature();
		const clusterFeature2 = getClusterFeature();

		const styleFunction = defaultClusterStyleFunction();
		const styles1 = styleFunction(clusterFeature1, null);
		const styles2 = styleFunction(clusterFeature2, null);

		expect(styles1).toEqual(styles2);
	});

	it('should use the feature style', () => {
		const featureStyle = new Style({
			image: new CircleStyle({
				radius: 5,
				fill: new Fill({
					color: [255, 0, 0]
				})
			})
		});

		const feature1 = new Feature({ geometry: new Point([0, 0]) });
		feature1.setStyle([featureStyle]);
		const clusterFeature = new Feature({ geometry: new Point([0, 0]), features: [feature1] });

		const styleFunction = defaultClusterStyleFunction();
		const styles = styleFunction(clusterFeature, null);
		expect(styles).toBeTruthy();
		expect(styles).toHaveSize(1);

		expect(styles[0]).toEqual(featureStyle);
	});

	it('should use the feature style function', () => {
		const featureStyle = new Style({
			image: new CircleStyle({
				radius: 5,
				fill: new Fill({
					color: [255, 0, 0]
				})
			})
		});

		const feature1 = new Feature({ geometry: new Point([0, 0]) });
		feature1.setStyle(() => [featureStyle]);
		const clusterFeature = new Feature({ geometry: new Point([0, 0]), features: [feature1] });

		const styleFunction = defaultClusterStyleFunction();
		const styles = styleFunction(clusterFeature, null);
		expect(styles).toBeTruthy();
		expect(styles).toHaveSize(1);

		expect(styles[0]).toEqual(featureStyle);
	});
});

describe('createSketchStyleFunction', () => {
	it('should create a style function', () => {
		const styleFunction = createSketchStyleFunction(measureStyleFunction);

		expect(styleFunction).toBeDefined();
	});

	it('should query the featureGeometry', () => {
		const geometry = new LineString([
			[0, 0],
			[1, 0]
		]);
		const feature = new Feature({ geometry: geometry });
		const geometrySpy = spyOn(feature, 'getGeometry').and.returnValue(geometry);

		const styleFunction = createSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(geometrySpy).toHaveBeenCalled();
	});

	it('should have a style for sketch polygon', () => {
		const geometry = new Polygon([
			[
				[0, 0],
				[500, 0],
				[550, 550],
				[0, 500],
				[0, 500]
			]
		]);
		const feature = new Feature({ geometry: geometry });

		const styleFunction = createSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});

	it('should have a style for sketch point', () => {
		const geometry = new Point([0, 0]);
		const feature = new Feature({ geometry: geometry });

		const styleFunction = createSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});

describe('getIconUrl', () => {
	it('creates valid URL with default color', () => {
		const iconId = 'foo';

		expect(getIconUrl(iconId)).toBe('http://backend.url/icons/255,255,255/foo');
		expect(getIconUrl(iconId, [0, 0, 0])).toBe('http://backend.url/icons/0,0,0/foo');
	});
});

describe('getColorFrom', () => {
	const strokeStyle = new Style({
		fill: new Fill({
			color: [255, 255, 255, 0.4]
		}),
		stroke: new Stroke({
			color: [255, 255, 0],
			width: 0
		})
	});

	const imageStyleWithTint = new Style({
		image: new Icon({
			src: markerIcon,
			color: [255, 0, 0]
		})
	});

	const imageStyleWithoutTint = new Style({
		image: new Icon({
			src: markerIcon
		})
	});

	const textStyle = new Style({
		text: new TextStyle({
			text: 'Foo',
			font: 'normal 16px sans-serif',
			stroke: new Stroke({ color: [0, 0, 0], width: 2 }),
			fill: new Fill({
				color: [255, 255, 0, 1]
			})
		})
	});

	it('should extract a color from feature style (stroke)', () => {
		const featureMock = { getStyle: () => [strokeStyle] };

		expect(getColorFrom(featureMock)).toBe('#ffff00');
	});

	it('should extract a color from feature style (image)', () => {
		const featureMock = { getStyle: () => [imageStyleWithTint] };

		expect(getColorFrom(featureMock)).toBe('#ff0000');
	});

	it('should extract a color from feature style (image), using iconService', () => {
		const featureMock = { getStyle: () => [imageStyleWithoutTint] };
		const iconServiceSpy = spyOn(iconServiceMock, 'decodeColor').and.callFake(() => [42, 42, 42]);
		expect(getColorFrom(featureMock)).toBe('#2a2a2a');
		expect(iconServiceSpy).toHaveBeenCalled();
	});

	it('should extract a color from feature style (text)', () => {
		const featureMock = { getStyle: () => [textStyle] };

		expect(getColorFrom(featureMock)).toBe('#ffff00');
	});

	it('should return null for empty feature', () => {
		const featureWithoutStyle = { getStyle: () => null };

		expect(getColorFrom(featureWithoutStyle)).toBeNull();
		expect(getColorFrom(null)).toBeNull();
		expect(getColorFrom(undefined)).toBeNull();
	});
});

describe('getSymbolFrom', () => {
	const imageStyle = new Style({
		image: new Icon({
			src: markerIcon,
			color: [255, 0, 0]
		})
	});

	const strokeStyle = new Style({
		fill: new Fill({
			color: [255, 255, 255, 0.4]
		}),
		stroke: new Stroke({
			color: [255, 255, 0],
			width: 0
		})
	});

	it('should extract a image from feature style', () => {
		const featureMock = { getStyle: () => [imageStyle] };

		expect(getSymbolFrom(featureMock)).toBeTruthy();
	});

	it('should NOT extract a image from feature style (image)', () => {
		const featureMock = { getStyle: () => [strokeStyle] };

		expect(getSymbolFrom(featureMock)).toBeNull();
	});

	it('should return null for empty feature', () => {
		const featureWithoutStyle = { getStyle: () => null };

		expect(getSymbolFrom(featureWithoutStyle)).toBeNull();
		expect(getSymbolFrom(null)).toBeNull();
		expect(getSymbolFrom(undefined)).toBeNull();
	});
});

describe('getTextFrom', () => {
	const getTextStyle = () => {
		const strokeWidth = 1;
		return new Style({
			text: new Text({
				text: 'Foo',
				font: 'normal 16px sans-serif',
				stroke: new Stroke({
					color: [0, 0, 0],
					width: strokeWidth
				}),
				fill: new Fill({
					color: [255, 255, 255]
				})
			})
		});
	};

	const strokeStyle = new Style({
		fill: new Fill({
			color: [255, 255, 255, 0.4]
		}),
		stroke: new Stroke({
			color: [255, 255, 0],
			width: 0
		})
	});

	it('should extract a text from feature style', () => {
		const featureMock = { getStyle: () => [getTextStyle()] };

		expect(getTextFrom(featureMock)).toBeTruthy();
	});

	it('should NOT extract a text from feature style', () => {
		const featureMock = { getStyle: () => [strokeStyle] };

		expect(getTextFrom(featureMock)).toBeNull();
	});

	it('should return null for empty feature', () => {
		const featureWithoutStyle = { getStyle: () => null };

		expect(getTextFrom(featureWithoutStyle)).toBeNull();
		expect(getTextFrom(null)).toBeNull();
		expect(getTextFrom(undefined)).toBeNull();
	});
});

describe('getSizeFrom', () => {
	const imageStyle = new Style({
		image: new Icon({
			src: markerIcon,
			color: [255, 0, 0],
			scale: 0.75
		})
	});

	const getTextStyle = (size) => {
		const strokeWidth = 1;
		return new Style({
			text: new Text({
				text: 'Foo',
				font: 'normal 16px sans-serif',
				stroke: new Stroke({
					color: [0, 0, 0],
					width: strokeWidth
				}),
				fill: new Fill({
					color: [255, 255, 255]
				}),
				scale: size
			})
		});
	};

	const strokeStyle = new Style({
		fill: new Fill({
			color: [255, 255, 255, 0.4]
		}),
		stroke: new Stroke({
			color: [255, 255, 0],
			width: 0
		})
	});

	it('should extract a size from feature with text style', () => {
		expect(getSizeFrom({ getStyle: () => [getTextStyle(2)] })).toBe('large');
		expect(getSizeFrom({ getStyle: () => [getTextStyle(1.5)] })).toBe('medium');
		expect(getSizeFrom({ getStyle: () => [getTextStyle(1)] })).toBe('small');
	});

	it('should extract a size from feature with marker style', () => {
		const featureMock = { getStyle: () => [imageStyle] };
		const expectedSize = 'medium';

		expect(getSizeFrom(featureMock)).toBe(expectedSize);
	});

	it('should NOT extract a size from feature style', () => {
		const featureMock = { getStyle: () => [strokeStyle] };

		expect(getSizeFrom(featureMock)).toBeNull();
	});

	it('should return null for empty feature', () => {
		const featureWithoutStyle = { getStyle: () => null };

		expect(getSizeFrom(featureWithoutStyle)).toBeNull();
		expect(getSizeFrom(null)).toBeNull();
		expect(getSizeFrom(undefined)).toBeNull();
	});
});

describe('getDrawingTypeFrom', () => {
	it('get the DrawingType from valid feature', () => {
		const feature = new Feature({ geometry: new Point([0, 0]) });

		expect(getDrawingTypeFrom(null)).toBeNull();
		feature.setId('draw_marker_1234');
		expect(getDrawingTypeFrom(feature)).toBe('marker');
		feature.setId('draw_Foo_1234');
		expect(getDrawingTypeFrom(feature)).toBe('Foo');
		feature.setId('draw_1234');
		expect(getDrawingTypeFrom(feature)).toBe(null);
		feature.setId('foo_bar_baz_000');
		expect(getDrawingTypeFrom(feature)).toBe('bar');
	});
});

describe('getStyleArray', () => {
	const getStyledFeature = (styleLike = []) => {
		const feature = new Feature({ geometry: new Point([0, 0]) });
		feature.setStyle(styleLike);
		return feature;
	};
	it('provides a array for a stylefunction', () => {
		const styleFunction = () => new Style();

		expect(getStyleArray(getStyledFeature(styleFunction)).length).toBe(1);
	});

	it('provides a array for a styleArray', () => {
		expect(getStyleArray(getStyledFeature([new Style(), new Style()])).length).toBe(2);
	});

	it('provides a empty array for a no style', () => {
		expect(getStyleArray(getStyledFeature()).length).toBe(0);
	});
});

describe('getTransparentImageStyle', () => {
	const Expected_Transparent_Color = [0, 0, 0, 0];
	const Expected_Radius = 1;
	it('creates a circle style with transparent fill', () => {
		const actual = getTransparentImageStyle();

		expect(actual.getFill().getColor()).toEqual(Expected_Transparent_Color);
	});

	it('creates a circle style with transparent stroke', () => {
		const actual = getTransparentImageStyle();

		expect(actual.getStroke().getColor()).toEqual(Expected_Transparent_Color);
	});

	it('creates a circle style with defined radius', () => {
		const actual = getTransparentImageStyle();

		expect(actual.getRadius()).toBe(Expected_Radius);
	});
});

describe('util functions creating a text style', () => {
	const lineStringFeature = new Feature({
		geometry: new LineString([
			[0, 0],
			[1, 0]
		])
	});
	const geojsonLineStringFeature = getFeatureWithProperties(
		{
			'fill-opacity': 0.21,
			fill: '#00ff00',
			'stroke-opacity': 0.42,
			stroke: '#ffff00',
			'stroke-width': 4,
			'marker-size': 'small',
			'marker-color': '#ffff00'
		},
		new LineString([
			[0, 0],
			[1, 0]
		])
	);
	const resolution = 1;

	const hasTextStyle = (style) => {
		if (!style) {
			return false;
		}

		if (!(style.getText() instanceof TextStyle)) {
			return false;
		}

		if (style.getText().getFont() !== Expected_Text_Font) {
			return false;
		}
		return true;
	};

	it('creates a text style', () => {
		const markerStyleOption = { color: '#BEDA55', scale: 'small', text: 'foo' };
		const textStyleOption = { color: '#BEDA55', scale: 'large', text: 'Foo' };
		const clusterFeature = getClusterFeature();

		const markerStyles = markerStyleFunction(markerStyleOption);
		const defaultTextStyles = textStyleFunction();
		const customTextStyles = textStyleFunction(textStyleOption);
		const clusterStyles = defaultClusterStyleFunction()(clusterFeature, null);

		expect(markerStyles.some((style) => hasTextStyle(style))).toBeTrue();
		expect(defaultTextStyles.some((style) => hasTextStyle(style))).toBeTrue();
		expect(customTextStyles.some((style) => hasTextStyle(style))).toBeTrue();
		expect(clusterStyles.some((style) => hasTextStyle(style))).toBeTrue();
	});

	it('does NOT creates a text style', () => {
		const rgbaColor = [0, 0, 0, 0];
		const lineStyleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.5 };
		const polygonStyleOption = { symbolSrc: markerIcon, color: '#BEDA55' };
		const modifyFeatureMock = { get: () => [lineStringFeature] };

		const measureStyles = measureStyleFunction(lineStringFeature, resolution);
		const nullStyles = nullStyleFunction();
		const defaultStyles = defaultStyleFunction(rgbaColor)(lineStringFeature);
		const defaultGeoJsonStyles = geojsonStyleFunction();
		const customGeoJsonStyles = geojsonStyleFunction(geojsonLineStringFeature);
		const defaultLineStyles = lineStyleFunction();
		const customLineStyles = lineStyleFunction(lineStyleOption);
		const defaultPolygonStyles = polygonStyleFunction();
		const customPolygonStyles = polygonStyleFunction(polygonStyleOption);
		const modifyStyles = modifyStyleFunction(modifyFeatureMock);
		const selectStyles = selectStyleFunction()(lineStringFeature);
		const sketchStyles = createSketchStyleFunction(measureStyleFunction)(lineStringFeature, null);

		expect(measureStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(nullStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(defaultStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(defaultGeoJsonStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(customGeoJsonStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(defaultLineStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(customLineStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(defaultPolygonStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(customPolygonStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(modifyStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(selectStyles.some((style) => hasTextStyle(style))).toBeFalse();
		expect(sketchStyles.some((style) => hasTextStyle(style))).toBeFalse();
	});
});
