import { measureStyleFunction, createSketchStyleFunction, createSelectStyleFunction, modifyStyleFunction, baseStyleFunction, nullStyleFunction, highlightStyleFunction, highlightTemporaryStyleFunction, markerStyleFunction, selectStyleFunction, rgbToHex, getColorFrom, hexToRgb, lineStyleFunction } from '../../../../../src/modules/map/components/olMap/olStyleUtils';
import { Point, LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import markerIcon from '../../../../../src/modules/map/components/olMap/assets/marker.svg';
import { Fill, Icon, Stroke, Style } from 'ol/style';


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

describe('baseStyleFunction', () => {
	it('should return a style', () => {
		const styles = baseStyleFunction();

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

	it('should return a style with a default Image', () => {
		const styles = markerStyleFunction();

		expect(styles).toBeDefined();
		expect(styles[0].getImage().getSrc()).toBe(markerIcon);
	});

	it('should return a style specified by styleOption', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.5 };
		const styles = markerStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const image = styles[0].getImage();
		expect(image).toBeTruthy();

		expect(image.getColor()).toEqual([190, 218, 85, 1]);
		expect(image.getScale()).toBe(0.5);
		expect(image.getSrc()).toBe(markerIcon);
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
		expect(styles[0].getStroke().getWidth()).toBe(1);
	});

	it('should return a style specified by styleOption', () => {
		const styleOption = { symbolSrc: markerIcon, color: '#BEDA55', scale: 0.5 };
		const styles = lineStyleFunction(styleOption);

		expect(styles).toBeDefined();
		const stroke = styles[0].getStroke();
		expect(stroke).toBeTruthy();

		expect(stroke.getColor()).toEqual([190, 218, 85, 1]);
		expect(stroke.getWidth()).toBe(0.5);
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
		feature.setStyle(baseStyleFunction);
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

describe('createSelectionStyleFunction', () => {

	it('should create a stylefunction', () => {

		const styleFunction = createSelectStyleFunction(measureStyleFunction);

		expect(styleFunction).toBeDefined();
	});

	it('should add a style which creates MultiPoints for the polygon-vertices', () => {
		const geometry = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry: geometry });

		const styleFunction = createSelectStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature);

		const vertexStyle = styles[2];
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

describe('colorFrom', () => {
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

	it('should return null for empty feature', () => {
		const featureWithoutStyle = { getStyle: () => null };

		expect(getColorFrom(featureWithoutStyle)).toBeNull();
		expect(getColorFrom(null)).toBeNull();
		expect(getColorFrom(undefined)).toBeNull();
	});

});
