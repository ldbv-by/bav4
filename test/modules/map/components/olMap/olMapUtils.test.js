import BaseLayer from 'ol/layer/Base';
import { $injector } from '../../../../../src/injection';
import { Map } from 'ol';
import {  registerLongPressListener, toOlLayer, toOlLayerFromHandler, updateOlLayer } from '../../../../../src/modules/map/components/olMap/olMapUtils';
import { AggregateGeoResource, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../../src/services/domain/geoResources';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { simulateMouseEvent } from './mapTestUtils';
import VectorSource from 'ol/source/Vector';


describe('olMapUtils', () => {

	const vectorImportService = {
		vectorSourceFromInternalData: () => { },
		vectorSourceFromExternalData: () => { }
	};
	const georesourceService = {
		byId: () => { }
	};
	

	beforeAll(() => {
		$injector
			.registerSingleton('VectorImportService', vectorImportService)
			.registerSingleton('GeoResourceService', georesourceService);
	});

	describe('toOlLayer', () => {

		describe('VectorGeoresource', () => {

			it('converts an external VectorGeoresource to an olLayer by calling #vectorSourceFromExternalData', () => {
				const spy = spyOn(vectorImportService, 'vectorSourceFromExternalData').and.returnValue(new VectorSource());
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML).setUrl('https://some.url');

				const vectorOlLayer = toOlLayer(vectorGeoresource);

				expect(vectorOlLayer.get('id')).toBe('someId');
				expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
				expect(vectorOlLayer.getSource().constructor.name).toBe('VectorSource');
				expect(spy).toHaveBeenCalledWith(vectorGeoresource);
			});

			it('converts an internal VectorGeoresource to an olLayer by calling #vectorSourceFromInternalData', () => {
				const spy = spyOn(vectorImportService, 'vectorSourceFromInternalData').and.returnValue(new VectorSource());
				const vectorGeoresource = new VectorGeoResource('someId', 'geoResourceLabel', VectorSourceType.KML).setSource('<kml></kml>', 4326);

				const vectorOlLayer = toOlLayer(vectorGeoresource);

				expect(vectorOlLayer.get('id')).toBe('someId');
				expect(vectorOlLayer.constructor.name).toBe('VectorLayer');
				expect(vectorOlLayer.getSource().constructor.name).toBe('VectorSource');
				expect(spy).toHaveBeenCalledWith(vectorGeoresource);
			});
		});


		it('converts a WmsGeoresource to a olLayer', () => {
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

		it('converts a WmtsGeoresource to a olLayer', () => {
			const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

			const wmtsOlLayer = toOlLayer(wmtsGeoresource);

			expect(wmtsOlLayer.get('id')).toBe('someId');
			const wmtsSource = wmtsOlLayer.getSource();
			expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
			expect(wmtsSource.constructor.name).toBe('XYZ');
			expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
		});


		it('converts a AggregateGeoresource to a olLayer(Group)', () => {

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


		it('throws an error when georesource type is not supported', () => {

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
		it('updates the properties of a olLayer', () => {

			const olLayer = new BaseLayer({});
			const layer = { visible: false, opacity: .5 };

			updateOlLayer(olLayer, layer);

			expect(olLayer.getVisible()).toBeFalse();
			expect(olLayer.getOpacity()).toBe(.5);
		});
	});

	describe('toOlLayerFromHandler', () => {
		it('retrieves an olLayer from a handler', () => {
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

	describe('registerLongPressListener', () => {

		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('register a listener on long press events with default delay (I)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay - 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});

		it('register a listener on long press events with default delay (II)', () => {
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

		it('register a listener on long press events with default delay (III)', () => {
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

		it('register a listener on long press events with custom delay', () => {
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

		it('cancels the timeout on pointer move with dragging)', () => {
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
