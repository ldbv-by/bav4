import { OlMeasurementHandler } from '../../../../../../../src/modules/map/components/olMap/handler/measure/OlMeasurementHandler';
import { LineString, Polygon } from 'ol/geom';
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
		

		it('removes all registered mapOverlays', async() => {
			const map = await setupMap();
			const layerStub = {}; 
			map.removeOverlay = jasmine.createSpy();
			const overlayStub = {};
			classUnderTest._overlays = [overlayStub, overlayStub, overlayStub, overlayStub];
			classUnderTest.deactivate(map, layerStub);
			
			expect(map.removeOverlay).toHaveBeenCalledTimes(4);
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

		it('creates tooltip content for line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			const baOverlay = feature.get('measurement').getElement();

			expect(baOverlay.value).toBeCloseTo(1, 1);
		});	

		it('creates partition tooltips for long line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1234, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(1);			
		});	

		it('creates partition tooltips for longer line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [12345, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);			
		});	

		it('creates partition tooltips very long line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [123456, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);			
		});	
		
		it('creates partition tooltips for longest line', async() => {
			const map = await setupMap();
			const geometry  = new LineString([[0, 0], [1234567, 0]]);
			const feature = new Feature({ geometry:geometry });
		
			classUnderTest.activate(map);
			simulateDrawEvent('drawstart', classUnderTest._draw, feature);
			feature.getGeometry().dispatchEvent('change');

			expect(feature.get('partitions').length).toBe(12);			
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

			const baOverlay = feature.get('measurement').getElement();

			expect(baOverlay.static).toBeTrue();
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
			const baOverlay = classUnderTest._helpTooltip.getElement();
			expect(baOverlay.value).toBe('draw_measure_start');			
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
			
			const baOverlay = classUnderTest._helpTooltip.getElement();
			expect(baOverlay.value).toBe('draw_measure_start');			
			classUnderTest._activeSketch = new Feature({ geometry:new LineString([[0, 0], [1, 0]]) });	
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);						
			expect(baOverlay.value).toBe('draw_measure_continue_line');	
		});	


		it('change message in helpTooltip, when sketch is changing to polygon', async() => {
			const classUnderTest = new OlMeasurementHandler();
			const map = await setupMap();
			
			classUnderTest.activate(map);			
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 10, 0);						
			const baOverlay = classUnderTest._helpTooltip.getElement();
			expect(baOverlay.value).toBe('draw_measure_start');		
			classUnderTest._activeSketch = new Feature({ geometry:new Polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]) });	
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 20, 0);						
			expect(baOverlay.value).toBe('draw_measure_continue_polygon');	
		});	
	});
});

