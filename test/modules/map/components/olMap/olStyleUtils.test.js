import { measureStyleFunction, createSketchStyleFunction, modifyStyleFunction, nullStyleFunction, highlightStyleFunction, highlightTemporaryStyleFunction, markerStyleFunction, selectStyleFunction, rgbToHex, getColorFrom, hexToRgb, lineStyleFunction, rgbToHsv, hsvToRgb, getContrastColorFrom, getComplementaryColor, polygonStyleFunction, textStyleFunction, getIconUrl, getMarkerSrc, getDrawingTypeFrom } from '../../../../../src/modules/map/components/olMap/olStyleUtils';
import { Point, LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import markerIcon from '../../../../../src/modules/map/components/olMap/assets/marker.svg';
import { Fill, Icon, Stroke, Style, Text as TextStyle } from 'ol/style';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

const Rgb_WHITE = [255, 255, 255];
const Rgb_Red = [255, 0, 0];
const Hsv_Red = [0, 1, 1];
const Rgb_Green = [0, 255, 0];
const Hsv_Green = [120, 1, 1];
const Rgb_Blue = [0, 0, 255];
const Hsv_Blue = [240, 1, 1];
const Rgb_Cyan = [0, 255, 255];
const Hsv_Cyan = [180, 1, 1];
const Rgb_Yellow = [255, 255, 0];
const Hsv_Yellow = [60, 1, 1];
const Rgb_Magenta = [255, 0, 255];
const Hsv_Magenta = [300, 1, 1];
const Rgb_Black = [0, 0, 0];

const configService = {
	getValue: () => { },
	getValueAsPath: () => 'http://backend.url/'
};

const environmentService = {
	isStandalone: () => false
};
beforeAll(() => {
	TestUtils.setupStoreAndDi();
	$injector
		.registerSingleton('EnvironmentService', environmentService)
		.registerSingleton('ConfigService', configService);

});

describe('getMarkerSrc', () => {
	it('returns a default marker source', () => {
		expect(getMarkerSrc()).toBe('http://backend.url/icons/255,255,255/marker');
	});

	it('returns a defined marker source', () => {
		const symbolName = 'foo';
		const color = '#ff0000';
		expect(getMarkerSrc(symbolName, color)).toBe('http://backend.url/icons/255,0,0/foo');
	});

	it('does nothing when markerSrc is already a URL', () => {
		const markerSrc = 'http://foo.bar/42/baz';
		expect(getMarkerSrc(markerSrc)).toBe('http://foo.bar/42/baz');
	});

});

describe('measureStyleFunction', () => {
	const geometry = new LineString([[0, 0], [1, 0]]);
	const feature = new Feature({ geometry: geometry });
	it('should create styles', () => {


		const styles = measureStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(2);
	});

	it('should query the featureGeometry', () => {
		const geometrySpy = spyOn(feature, 'getGeometry');

		const styles = measureStyleFunction(feature);

		expect(styles).toBeTruthy();
		expect(geometrySpy).toHaveBeenCalled();
	});

	it('should have a style which creates circle for Lines', () => {
		const styles = measureStyleFunction(feature);


		const circleStyle = styles.find(style => {
			const geometryFunction = style.getGeometryFunction();
			if (geometryFunction) {
				const renderObject = geometryFunction(feature);
				return renderObject.getType() === 'Circle';
			}
			else {
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
});

describe('nullStyleFunction', () => {
	it('should return a style', () => {
		const styles = nullStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});
});


describe('highlightStyleFunction', () => {
	it('should return a style', () => {
		const styles = highlightStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a ImageIcon', () => {
		const styles = highlightStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getImage()).toBeTruthy();
	});
});

describe('highlightTemporaryStyleFunction', () => {
	it('should return a style', () => {
		const styles = highlightTemporaryStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});

	it('should return a style with a ImageIcon', () => {
		const styles = highlightTemporaryStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getImage()).toBeTruthy();
	});
});

describe('markerStyleFunction', () => {

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
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.5);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
		// expect(image.getSrc()).toContain('backend/icons/190,218,85/marker');
	});

	it('should return a style specified by styleOption; small image', () => {
		const styleOption = { symbolSrc: 'marker', color: '#BEDA55', scale: 'small' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.5);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
		// expect(image.getSrc()).toContain('backend/icons/190,218,85/marker');
	});

	it('should return a style specified by styleOption; medium image', () => {
		const styleOption = { symbolSrc: 'marker', color: '#BEDA55', scale: 'medium' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.75);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
		// expect(image.getSrc()).toContain('backend/icons/190,218,85/marker');
	});

	it('should return a style specified by styleOption; large image', () => {
		const styleOption = { symbolSrc: 'marker', color: '#BEDA55', scale: 'large' };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(1);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
		// expect(image.getSrc()).toContain('backend/icons/190,218,85/marker');
	});

	it('should return a style specified by styleOption; scale value as number', () => {
		const styleOption = { symbolSrc: 'marker', color: '#BEDA55', scale: 0.75 };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.75);
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
		// expect(image.getSrc()).toContain('backend/icons/190,218,85/marker');
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
		expect(styles[0].getText().getText()).toBe('New Text');
	});

	it('should return a style specified by styleOption; large text', () => {
		const styleOption = { color: '#BEDA55', scale: 'large', text: 'Foo' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Foo');
		expect(textStyle.getScale()).toBe(2);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([0.4]));
	});

	it('should return a style specified by styleOption; medium text', () => {
		const styleOption = { color: '#BEDA55', scale: 'medium', text: 'Bar' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Bar');
		expect(textStyle.getScale()).toBe(1.5);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([0.4]));
	});

	it('should return a style specified by styleOption; small text', () => {
		const styleOption = { color: '#BEDA55', scale: 'small', text: 'Bar' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Bar');
		expect(textStyle.getScale()).toBe(1);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([0.4]));
	});


	it('should return a style specified by styleOption; text scale as number ', () => {
		const styleOption = { color: '#BEDA55', scale: 2, text: 'Foo' };
		const styles = textStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const textStyle = styles[0].getText();
		expect(textStyle.getText()).toBe('Foo');
		expect(textStyle.getScale()).toBe(2);
		expect(textStyle.getStroke().getColor()).toEqual(Rgb_Black.concat([0.4]));
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
		expect(styles[0].getStroke().getWidth()).toBe(2);
	});

	it('should return a style specified by styleOption', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.5 };
		const styles = lineStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const stroke = styles[0].getStroke();
		expect(stroke).toBeTruthy();

		expect(stroke.getColor()).toEqual([190, 218, 85, 1]);
		expect(stroke.getWidth()).toBe(2);
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
		expect(styles[0].getStroke().getWidth()).toBe(2);
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
		expect(stroke.getWidth()).toBe(2);
	});

});

describe('modifyStyleFunction', () => {

	it('should return a style', () => {
		const styles = modifyStyleFunction();

		expect(styles).toBeDefined();
		expect(styles.length).toBe(1);
	});
});

describe('selectStyleFunction', () => {

	it('should create a stylefunction', () => {

		const styleFunction = selectStyleFunction();

		expect(styleFunction).toBeDefined();
	});

	it('should add a style which creates MultiPoints for the polygon-vertices', () => {
		const geometry = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry: geometry });
		feature.setStyle(nullStyleFunction);
		const styleFunction = selectStyleFunction();
		const styles = styleFunction(feature);

		const vertexStyle = styles[1];
		const geometryFunction = vertexStyle.getGeometryFunction();


		const lineFeature = feature;
		const pointFeature = new Feature({ geometry: new Point([0, 0]) });
		const polygonFeature = new Feature({ geometry: new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });

		expect(geometryFunction(lineFeature)).toBeTruthy();
		expect(geometryFunction(pointFeature)).toBeTruthy();
		expect(geometryFunction(polygonFeature)).toBeTruthy();
	});
});

describe('createSketchStyleFunction', () => {

	it('should create a stylefunction', () => {

		const styleFunction = createSketchStyleFunction(measureStyleFunction);

		expect(styleFunction).toBeDefined();
	});

	it('should query the featureGeometry', () => {
		const geometry = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry: geometry });
		const geometrySpy = spyOn(feature, 'getGeometry').and.returnValue(geometry);

		const styleFunction = createSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(geometrySpy).toHaveBeenCalled();
	});

	it('should have a style for sketch polygon', () => {
		const geometry = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
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

describe('rgbToHex', () => {
	it('should convert a rgb-array to hex-representation', () => {
		expect(rgbToHex(null)).toBeNull();
		expect(rgbToHex('foo')).toBeNull();
		expect(rgbToHex([-1, -1, -1])).toBeNull();
		expect(rgbToHex([0, 0, 0])).toBe('#000000');
		expect(rgbToHex([186, 218, 85])).toBe('#bada55');
		expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
		expect(rgbToHex([256, 256, 256])).toBeNull();
	});
});

describe('hexToRgb', () => {
	it('should convert a color hex-representation to a rgb-array', () => {
		expect(hexToRgb(null)).toBeNull();
		expect(hexToRgb('#foo')).toBeNull();
		expect(hexToRgb('#000')).toEqual([0, 0, 0]);
		expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
		expect(hexToRgb('#bada55')).toEqual([186, 218, 85]);
		expect(hexToRgb('#ad5')).toEqual([170, 221, 85]);
		expect(hexToRgb('#aadd55')).toEqual([170, 221, 85]);
		expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
	});
});


describe('rgbToHsv', () => {

	it('should convert a rgb-color array to a hsv-color-array', () => {
		const tooShortArray = [0, 0];
		expect(rgbToHsv(null)).toBeNull();
		expect(rgbToHsv(tooShortArray)).toBeNull();
		expect(rgbToHsv(Rgb_Red)).toEqual(Hsv_Red);
		expect(rgbToHsv(Rgb_Green)).toEqual(Hsv_Green);
		expect(rgbToHsv(Rgb_Blue)).toEqual(Hsv_Blue);
		expect(rgbToHsv(Rgb_Cyan)).toEqual(Hsv_Cyan);
		expect(rgbToHsv(Rgb_Magenta)).toEqual(Hsv_Magenta);
		expect(rgbToHsv(Rgb_Yellow)).toEqual(Hsv_Yellow);
	});
});

describe('hsvToRgb', () => {

	it('should convert a hsv-color array to a rgb-color-array', () => {
		const tooShortArray = [0, 0];
		expect(hsvToRgb(null)).toBeNull();
		expect(hsvToRgb(tooShortArray)).toBeNull();
		expect(hsvToRgb(Hsv_Red)).toEqual(Rgb_Red);
		expect(hsvToRgb(Hsv_Green)).toEqual(Rgb_Green);
		expect(hsvToRgb(Hsv_Blue)).toEqual(Rgb_Blue);
		expect(hsvToRgb(Hsv_Cyan)).toEqual(Rgb_Cyan);
		expect(hsvToRgb(Hsv_Magenta)).toEqual(Rgb_Magenta);
		expect(hsvToRgb(Hsv_Yellow)).toEqual(Rgb_Yellow);
	});
});

describe('hsvToRgb', () => {

	it('should convert a hsv-color array to a rgb-color-array', () => {
		const tooShortArray = [0, 0];
		expect(hsvToRgb(null)).toBeNull();
		expect(hsvToRgb(tooShortArray)).toBeNull();
		expect(hsvToRgb(Hsv_Red)).toEqual(Rgb_Red);
		expect(hsvToRgb(Hsv_Green)).toEqual(Rgb_Green);
		expect(hsvToRgb(Hsv_Blue)).toEqual(Rgb_Blue);
		expect(hsvToRgb(Hsv_Cyan)).toEqual(Rgb_Cyan);
		expect(hsvToRgb(Hsv_Magenta)).toEqual(Rgb_Magenta);
		expect(hsvToRgb(Hsv_Yellow)).toEqual(Rgb_Yellow);
	});
});

describe('getComplementaryColor', () => {

	it('should find a color with maximum contrast', () => {

		expect(getComplementaryColor(rgbToHex(Rgb_Red))).toEqual('#00ffff');

	});
});

describe('getContrastColorFrom', () => {

	it('should find a color with best contrast', () => {
		const rgbDarkBlue = [11, 1, 57];
		const rgbLightBlue = [36, 3, 185];
		expect(getContrastColorFrom((Rgb_Red))).toEqual(Rgb_Black);
		expect(getContrastColorFrom((Rgb_Yellow))).toEqual(Rgb_Black);
		expect(getContrastColorFrom(rgbDarkBlue)).toEqual(Rgb_WHITE);
		expect(getContrastColorFrom(rgbLightBlue)).toEqual(Rgb_Black);
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

	it('should NOT extract a color from feature style (image), when tint color is not present', () => {
		const featureMock = { getStyle: () => [imageStyleWithoutTint] };

		expect(getColorFrom(featureMock)).toBeNull();
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
