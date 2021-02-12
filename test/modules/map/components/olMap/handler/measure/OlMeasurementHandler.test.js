import { OlMeasurementHandler, getGeometryLength, canShowAzimuthCircle, measureStyleFunction } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { Point, LineString, Polygon, Circle, LinearRing } from 'ol/geom';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { OSM, TileDebug } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';
import { MapBrowserEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { $injector } from '../../../../../../../src/injection';



$injector.registerSingleton('TranslationService', { translate: (key) => key });

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

			expect(feature.get('measurement').getElement().innerHTML).toBe('1 m');
		});	

		it('creates tooltip content for long line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('measurement').getElement().innerHTML).toBe('1.23 km');
			expect(feature.get('partitions').length).toBe(1);
			expect(feature.get('partitions')[0].getElement().innerHTML).toBe('1 km');
		});	

		it('creates tooltip content for longer line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('measurement').getElement().innerHTML).toBe('12.33 km');
			expect(feature.get('partitions').length).toBe(12);
			expect(feature.get('partitions')[0].getElement().innerHTML).toBe('1 km');
		});	

		it('creates tooltip content for very long line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [123456, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('measurement').getElement().innerHTML).toBe('123.32 km');
			expect(feature.get('partitions').length).toBe(12);
			expect(feature.get('partitions')[0].getElement().innerHTML).toBe('10 km');
		});	
		
		it('creates tooltip content for longest line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1234567, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('measurement').getElement().innerHTML).toBe('1233.19 km');
			expect(feature.get('partitions').length).toBe(12);
			expect(feature.get('partitions')[0].getElement().innerHTML).toBe('100 km');
		});	

		it('removes partition tooltips after shrinking very long line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);

			geometry.setCoordinates([[0, 0], [1234, 0]]);
			feature.getGeometry().dispatchEvent('change');
			
			expect(feature.get('partitions').length).toBe(1);			
		});	

		it('unregister tooltip-listener after finish drawing', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry:geometry });	
		
			classUnderTest.activate(map);
					
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');
			simulateDrawEvent('drawend', classUnderTest._draw, feature);

			expect(feature.get('measurement').getElement().classList.contains('ba-draw-measure-static')).toBeTrue();
			expect(feature.get('measurement').getOffset()).toEqual([0, -7]);
		});			
	});

	describe('when pointer move', () => {
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

		const simulateMouseEvent = (map, type, x, y, dragging) => {
			const eventType = type;
	
			const event = new Event(eventType);
			//event.target = map.getViewport().firstChild;
			event.clientX = x;
			event.clientY = y;
			event.pageX = x;
			event.pageY = y;			
			event.shiftKey = false;
			event.preventDefault = function () { };
	
			
			let mapEvent = new MapBrowserEvent(eventType, map, event);		
			mapEvent.coordinate = [x, y];	
			mapEvent.dragging = dragging ? dragging : false;
			map.dispatchEvent(mapEvent);
		};

		it('creates and move helpTooltip', async() => {
			const classUnderTest = new OlMeasurementHandler();
			const map = await setupMap();
			
			classUnderTest.activate(map);			
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);			
			
			expect(classUnderTest._helpTooltip.getElement().innerHTML).toBe('draw_measure_start');			
			expect(classUnderTest._helpTooltip.getPosition()).toEqual([10, 0]);	
		});	

		it('no move when dragging', async() => {
			const classUnderTest = new OlMeasurementHandler();
			const map = await setupMap();
			
			classUnderTest.activate(map);			
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0, true);			
					
			expect(classUnderTest._helpTooltip.getPosition()).toBeFalsy();
		});	

		it('change message in helpTooltip, when sketch is changing', async() => {
			const classUnderTest = new OlMeasurementHandler();
			const map = await setupMap();
			
			classUnderTest.activate(map);			
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);						
			expect(classUnderTest._helpTooltip.getElement().innerHTML).toBe('draw_measure_start');			
			classUnderTest._activeSketch = new Feature({ geometry:new LineString([[0, 0], [1, 0]]) });	
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);						
			expect(classUnderTest._helpTooltip.getElement().innerHTML).toBe('draw_measure_continue_line');	
		});	


		it('change message in helpTooltip, when sketch is changing to polygon', async() => {
			const classUnderTest = new OlMeasurementHandler();
			const map = await setupMap();
			
			classUnderTest.activate(map);			
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);						
			expect(classUnderTest._helpTooltip.getElement().innerHTML).toBe('draw_measure_start');		
			classUnderTest._activeSketch = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });	
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);						
			expect(classUnderTest._helpTooltip.getElement().innerHTML).toBe('draw_measure_continue_polygon');	
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