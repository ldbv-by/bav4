import { measureStyleFunction, generateSketchStyleFunction, hexToRgb } from '../../../../../../../src/modules/map/components/olMap/handler/measure/StyleUtils';
import { Point, LineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';


describe('measureStyleFunction', () => {
	const geometry  = new LineString([[0, 0], [1, 0]]);
	const feature = new Feature({ geometry:geometry });
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
			
		} );
		const geometryFunction = circleStyle.getGeometryFunction();
		
		const lineFeature = feature;
		const pointFeature = new Feature({ geometry:new Point([0, 0]) });
		const circle = geometryFunction(lineFeature);
		const nonCircle = geometryFunction(pointFeature);


		expect(circle).toBeTruthy();
		expect(nonCircle).toBeFalsy();
		expect(circleStyle).toBeTruthy();		
	});


});

describe('generateSketchStyleFunction', () => {
	
	it('should create a stylefunction', () => {

		const styleFunction = generateSketchStyleFunction(measureStyleFunction);

		expect(styleFunction).toBeDefined();
	});

	it('should query the featureGeometry', () => {
		const geometry  = new LineString([[0, 0], [1, 0]]);
		const feature = new Feature({ geometry:geometry });
		const geometrySpy = spyOn(feature, 'getGeometry').and.returnValue(geometry);
		
		const styleFunction = generateSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(geometrySpy).toHaveBeenCalled();
	});

	it('should have a style for sketch polygon', () => {
		const geometry  = new Polygon([[[0, 0], [500, 0], [550, 550], [0, 500], [0, 500]]]);
		const feature = new Feature({ geometry:geometry });
		
		const styleFunction = generateSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});

	it('should have a style for sketch point', () => {
		const geometry  = new Point([0, 0]);
		const feature = new Feature({ geometry:geometry });
		
		const styleFunction = generateSketchStyleFunction(measureStyleFunction);
		const styles = styleFunction(feature, null);

		expect(styles).toBeTruthy();
		expect(styles.length).toBe(1);
	});
});

describe('hexToRgb', () => {
	it('should convert hex-color to rgb', () => {
		const hex = '#556688';

		const rgb = hexToRgb(hex);
	
		expect(rgb[0]).toBe(85);
		expect(rgb[1]).toBe(102);
		expect(rgb[2]).toBe(136);
	});
});
