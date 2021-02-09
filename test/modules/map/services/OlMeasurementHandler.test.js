import { OlMeasurementHandler, getGeometryLength, canShowAzimuthCircle, measureStyleFunction } from '../../../../src/modules/map/services/OlMeasurementHandler';
import { Point, LineString, Polygon, Circle, LinearRing } from 'ol/geom';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';



describe('OlMeasurementHandler', () => {

	it('has two methods', async () => {
		expect(new OlMeasurementHandler()).toBeTruthy();
		expect(new OlMeasurementHandler().activate).toBeTruthy();
		expect(new OlMeasurementHandler().deactivate).toBeTruthy();
	});

	describe('when activated over olMap', () => {
		const classUnderTest = new OlMeasurementHandler();
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap =  async () => {

			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});
			
		};

		it('adds a Interaction', async() => {
			const map = await setupMap();
			map.addInteraction = jasmine.createSpy();
			classUnderTest.activate(map);
			
			expect(map.addInteraction).toHaveBeenCalled();
		});

		it('removes a Interaction', async() => {
			const map = await setupMap();
			const layerStub = {}; 
			map.removeInteraction = jasmine.createSpy();

			classUnderTest.deactivate(map, layerStub);
			
			expect(map.removeInteraction).toHaveBeenCalled();
		});	


		
	});


	describe('when draw a line', () => {
		const classUnderTest = new OlMeasurementHandler();
		const initialCenter = fromLonLat([11.57245, 48.14021]);

		const setupMap =  async () => {

			return new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new TileLayer({
						source: new TileDebug(),
					})],
				target: 'map',
				view: new View({
					center: initialCenter,
					zoom: 1,
				}),
			});
			
		};

		const simulateDrawEvent = (type, draw, feature) => {
			const eventType = type;
			let drawEvent = new DrawEvent(eventType, feature);
			
			draw.dispatchEvent(drawEvent);
		};
		it('creates tooltip content for short line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(classUnderTest._measureTooltip.getElement().innerHTML).toBe('1 m');
		});	

		it('creates tooltip content for longer line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [101, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(classUnderTest._measureTooltip.getElement().innerHTML).toBe('0.1 km');
		});	

		it('unregister tooltip-listener after finish drawing', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry:geometry });
			//const unByKeySpy = spyOn(Observable, 'unByKey');			
		
			classUnderTest.activate(map);
					
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(classUnderTest._measureTooltip.getElement().classList.contains('ol-tooltip-static')).toBeTrue();
			expect(classUnderTest._measureTooltip.getOffset()).toEqual([0, -7]);
			//expect(unByKeySpy).toHaveBeenCalled();
		});	
	});
});

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
			if(geometryFunction) {
				const renderObject = geometryFunction(feature);
				return renderObject.getType() === 'Circle';
			}
			else{
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

describe('getGeometryLength', () => {
	it('calculates length of LineString', () => {
		const lineString = new LineString([[0, 0], [1, 0]]);
		const length = getGeometryLength(lineString);

		expect(length).toBe(1);
	});

	it('calculates length of LinearRing', () => {
		const linearRing = new LinearRing([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
		const length = getGeometryLength(linearRing);

		expect(length).toBe(4);
	});

	it('calculates length of Polygon', () => {		
		const polygon = new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
		const length = getGeometryLength(polygon);

		expect(length).toBe(4);
	});

	
	it('calculates not length of Circle', () => {
		const circle = new Circle([0, 0], 1);
		const length = getGeometryLength(circle);

		expect(length).toBe(0);
	});
});

describe('canShowAzimuthCircle', () => {
	it('can show for a 2-point-line', () => {
		const twoPointLineString = new LineString([[0, 0], [1, 0]]);

		expect(canShowAzimuthCircle(twoPointLineString)).toBeTrue();
	});

	
	it('can show for a pseudo-2-point-line', () => {
		const threePointLineString = new LineString([[0, 0], [1, 0], [1, 0]]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeTrue();
	});

	
	it('can NOT show for a point', () => {
		const point = new Point([0, 0]);

		expect(canShowAzimuthCircle(point)).toBeFalse();
	});

	
	it('can NOT show for lineString', () => {
		const threePointLineString = new LineString([[0, 0], [1, 0], [2, 1]]);

		expect(canShowAzimuthCircle(threePointLineString)).toBeFalse();
	});
});