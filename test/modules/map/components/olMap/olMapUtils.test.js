import BaseLayer from 'ol/layer/Base';
import { $injector } from '../../../../../src/injection';
import { Map } from 'ol';
import { iconUrlFunction, mapVectorSourceTypeToFormat, registerLongPressListener, toOlLayer, toOlLayerFromHandler, updateOlLayer } from '../../../../../src/modules/map/components/olMap/olMapUtils';
import { AggregateGeoResource, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../../src/services/domain/geoResources';
import { load } from '../../../../../src/modules/map/components/olMap/utils/feature.provider';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { simulateMouseEvent } from './mapTestUtils';


describe('olMapUtils', () => {

	const urlService = {
		proxifyInstant: () => { }
	};
	const georesourceService = {
		byId: () => { }
	};
	const mapService = {
		getSrid: () => { }
	};

	beforeAll(() => {
		$injector
			.registerSingleton('UrlService', urlService)
			.registerSingleton('GeoResourceService', georesourceService)
			.registerSingleton('MapService', mapService);
	});

	it('it maps vectorSourceType to olFormats', () => {

		expect(mapVectorSourceTypeToFormat(VectorSourceType.KML).constructor.name).toBe('KML');
		expect(mapVectorSourceTypeToFormat(VectorSourceType.GPX).constructor.name).toBe('GPX');
		expect(mapVectorSourceTypeToFormat(VectorSourceType.GEOJSON).constructor.name).toBe('GeoJSON');
		expect(() => {
			mapVectorSourceTypeToFormat('unknown');
		})
			.toThrowError(/unknown currently not supported/);
	});

	describe('toOlLayer', () => {

		it('it converts a WmsGeoresource to a olLayer', () => {
			const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png');

			const wmsOlLayer = toOlLayer(wmsGeoresource);
			
			expect(wmsOlLayer.get('id')).toBe('someId');
			const wmsSource = wmsOlLayer.getSource();
			expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
			expect(wmsSource.constructor.name).toBe('ImageWMS');
			expect(wmsSource.getUrl()).toBe('https://some.url');
			expect(wmsSource.getParams().LAYERS).toBe('layer');
			expect(wmsSource.getParams().FORMAT).toBe('image/png');
			expect(wmsSource.getParams().VERSION).toBe('1.1.1');
		});

		it('it converts a WmtsGeoresource to a olLayer', () => {
			const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const wmtsOlLayer = toOlLayer(wmtsGeoresource);
			
			expect(wmtsOlLayer.get('id')).toBe('someId');
			const wmtsSource = wmtsOlLayer.getSource();
			expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
			expect(wmtsSource.constructor.name).toBe('XYZ');
			expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
		});

		it('it converts an external VectorGeoresource to an olLayer', () => {
			const url = 'https://some.url';
			spyOn(urlService, 'proxifyInstant').withArgs(url).and.returnValue('https://proxy.url?' + url);
			const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setUrl(url);

			const vectorOlLayer = toOlLayer(vectorGeoresource);
			
			expect(vectorOlLayer.get('id')).toBe('someId');
			const vectorSource = vectorOlLayer.getSource();
			expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
			expect(vectorSource.constructor.name).toBe('VectorSource');
			expect(vectorSource.getUrl()).toBe('https://proxy.url?' + url);
			expect(vectorSource.getFormat().constructor.name).toBe('KML');

			expect(vectorSource.loader_).toEqual(load);
			expect(vectorSource.getFormat().iconUrlFunction_).toEqual(iconUrlFunction);
		});

		it('it converts an internal VectorGeoresource to an olLayer', () => {
			const srid = 3857;
			spyOn(mapService, 'getSrid').and.returnValue(srid);
			const sourceAsString = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><name>Zeichnung</name><Placemark id="line_1617976924317"><ExtendedData><Data name="type"><value>line</value></Data></ExtendedData><description></description><Style><LineStyle><color>ff0000ff</color><width>3</width></LineStyle><PolyStyle><color>660000ff</color></PolyStyle></Style><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>10.713458946685412,49.70007647302964 11.714932179089468,48.34411758499924</coordinates></LineString></Placemark></Document></kml>';
			const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setSource(sourceAsString, 4326);

			const vectorOlLayer = toOlLayer(vectorGeoresource);

			expect(vectorOlLayer.get('id')).toBe('someId');
			const vectorSource = vectorOlLayer.getSource();
			expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
			expect(vectorSource.constructor.name).toBe('VectorSource');
			expect(vectorSource.getFeatures().length).toBe(1);
			expect(vectorSource.getFeatures()[0].get('srid')).toBe(srid);
		});

		it('it converts a AggregateGeoresource to a olLayer(Group)', () => {

			const wmtsGeoresource = new WMTSGeoResource('wmtsId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('wmsId', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('someId', 'label', [wmtsGeoresource.id, wmtsGeoresource.id]);

			const olLayerGroup = toOlLayer(aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe('someId');
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});


		it('it throws an error when georesource type is not supported', () => {

			expect(() => {
				toOlLayer({
					getType() {
						return 'Unknown';
					}
				});
			})
				.toThrowError(/Unknown currently not supported/);
		});

	});

	describe('updateOlLayer', () => {
		it('it updates the properties of a olLayer', () => {

			const olLayer = new BaseLayer({});
			const layer = { visible: false, opacity: .5 };

			updateOlLayer(olLayer, layer);

			expect(olLayer.getVisible()).toBeFalse();
			expect(olLayer.getOpacity()).toBe(.5);
		});
	});

	describe('toOlLayerFromHandler', () => {
		it('it retrieves an olLayer from a handler', () => {
			const mockHandler = {
				activate() { }
			};
			const map = new Map();
			const olLayer = new BaseLayer({});
			spyOn(mockHandler, 'activate').withArgs(map).and.returnValue(olLayer);

			const myLayer = toOlLayerFromHandler('someId', mockHandler, map);

			expect(myLayer.get('id')).toBe('someId');
		});
	});

	describe('iconUrlFunction', () => {
		it('it updates the properties of a olLayer', () => {
			const iconUrl = 'https://some.url';
			spyOn(urlService, 'proxifyInstant').withArgs(iconUrl).and.returnValue('https://proxy.url?url=' + iconUrl);

			expect(iconUrlFunction(iconUrl)).toBe('https://proxy.url?url=' + iconUrl);
		});
	});

	describe('registerLongPressListener', () => {

		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('it register a listener on long press events with default delay (I)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay - 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});

		it('it register a listener on long press events with default delay (II)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('it register a listener on long press events with default delay (III)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			//a second pointer event!
			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('it register a listener on long press events with custom delay', () => {
			const customDelay = 100;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy, customDelay);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(customDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('it cancels the timeout on pointer move with dragging)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0, true);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});
	});
});
