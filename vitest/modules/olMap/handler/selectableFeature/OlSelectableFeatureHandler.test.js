import { Feature, Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OlSelectableFeatureHandler } from '../../../../../src/modules/olMap/handler/selectableFeature/OlSelectableFeatureHandler';
import { TestUtils } from '../../../../test-utils';
import { fromLonLat } from 'ol/proj';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { simulateMapBrowserEvent } from '../../mapTestUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS.js';
import { Tools } from '../../../../../src/domain/tools';
import { $injector } from '../../../../../src/injection';
import { equals } from '../../../../../src/utils/storeUtils';
import { WmsGeoResource } from '../../../../../src/domain/geoResources';
import LayerGroup from 'ol/layer/Group';
import { Point } from 'ol/geom';

describe('OlSelectableFeatureHandler', () => {
	const renderComplete = (map) => {
		return new Promise((resolve) => {
			map.on('rendercomplete', () => {
				resolve();
			});
		});
	};

	const geoResourceService = {
		byId: () => {}
	};
	const matchingCoordinate = fromLonLat([11, 48]);
	const notMatchingCoordinate = fromLonLat([5, 12]);

	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, { tools: toolsReducer });
		$injector.registerSingleton('GeoResourceService', geoResourceService);
		return new OlSelectableFeatureHandler();
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		container.style.position = 'absolute';
		container.style.left = '0';
		container.style.top = '0';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: matchingCoordinate,
				zoom: 1
			})
		});
	};

	it('instantiates the handler', () => {
		setup();
		const handler = setup();

		expect(handler.id).toBe('SelectableFeature_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when pointer moves', () => {
		it('calls `_getDataAtPixel`', async () => {
			const map = setupMap();
			const vectorSource = new VectorSource();
			vectorSource.addFeature(new Feature(new Point(matchingCoordinate)));
			map.addLayer(new VectorLayer({ source: vectorSource }));
			const handler = setup();
			handler.register(map);
			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
			const notMatchingCoordinateInPixel = map.getPixelFromCoordinate(notMatchingCoordinate);
			spyOn(handler, '_getDataAtPixel')
				.withArgs(jasmine.any(Array), map)
				.and.callFake((pixel) => {
					return equals(pixel, matchingCoordinateInPixel);
				});
			spyOn(geoResourceService, 'byId').and.returnValue(null);

			expect(map.getTargetElement().style.cursor).toBe('');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('pointer');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, notMatchingCoordinateInPixel[0], notMatchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('');
		});
	});

	describe('when pointer moves over vector feature', () => {
		describe('the corresponding GeoResource is queryable', () => {
			it('changes the cursor', async () => {
				const geoResourceId = 'geoResourceId';
				const map = setupMap();
				const vectorSource = new VectorSource();
				vectorSource.addFeature(new Feature(new Point(matchingCoordinate)));
				map.addLayer(new VectorLayer({ source: vectorSource, geoResourceId }));
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
				const notMatchingCoordinateInPixel = map.getPixelFromCoordinate(notMatchingCoordinate);
				spyOn(geoResourceService, 'byId')
					.withArgs(geoResourceId)
					.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', ''));

				expect(map.getTargetElement().style.cursor).toBe('');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('pointer');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, notMatchingCoordinateInPixel[0], notMatchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('');
			});
		});

		describe('the corresponding GeoResource is queryable', () => {
			it('changes the cursor', async () => {
				const geoResourceId = 'geoResourceId';
				const map = setupMap();
				const vectorSource = new VectorSource();
				vectorSource.addFeature(new Feature(new Point(matchingCoordinate)));
				map.addLayer(new VectorLayer({ source: vectorSource, geoResourceId }));
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(geoResourceService, 'byId')
					.withArgs(geoResourceId)
					.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', '').setQueryable(false));

				expect(map.getTargetElement().style.cursor).toBe('');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('');
			});
		});
	});

	describe('when a tool is active', () => {
		it('does nothing', async () => {
			const map = setupMap();
			const vectorSource = new VectorSource();
			vectorSource.addFeature(new Feature(new Point(matchingCoordinate)));
			map.addLayer(new VectorLayer({ source: vectorSource }));
			const handler = setup({
				tools: {
					current: Tools.DRAW
				}
			});
			handler.register(map);
			await renderComplete(map);
			const getDataAtPixelSpy = spyOn(handler, '_getDataAtPixel');
			// safe to call map.getPixelFromCoordinate from now on
			const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);

			expect(map.getTargetElement().style.cursor).toBe('');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('');
			expect(getDataAtPixelSpy).not.toHaveBeenCalled();
		});
	});

	describe('`_getDataAtPixel`', () => {
		describe('the layer is a group layer', () => {
			it('resolves a group layer', async () => {
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceService, 'byId')
					.withArgs(geoResourceId)
					.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', ''));
				const map = setupMap();
				const wmsSource = new ImageWMS();
				const wmsLayer = new ImageLayer({ source: wmsSource, geoResourceId, id });
				map.addLayer(new LayerGroup({ layers: [wmsLayer] }));
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const pixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(wmsLayer, 'getData').and.callFake(() => [42, 42, 42, 42]);

				expect(handler._getDataAtPixel(pixel, map)).toBeTrue();
			});
		});

		describe('the layer is NOT visible', () => {
			it('returns `false`', async () => {
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceService, 'byId')
					.withArgs(geoResourceId)
					.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', ''));
				const map = setupMap();
				const wmsSource = new ImageWMS();
				const wmsLayer = new ImageLayer({ source: wmsSource, geoResourceId, id, visible: false });
				map.addLayer(wmsLayer);
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const pixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(wmsLayer, 'getData').and.callFake(() => [42, 42, 42, 42]);

				expect(handler._getDataAtPixel(pixel, map)).toBeFalse();
			});
		});

		describe('the layer is NOT queryable', () => {
			it('returns `false`', async () => {
				const id = 'id';
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceService, 'byId')
					.withArgs(geoResourceId)
					.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', '').setQueryable(false));
				const map = setupMap();
				const wmsSource = new ImageWMS();
				const wmsLayer = new ImageLayer({ source: wmsSource, geoResourceId, id });
				map.addLayer(wmsLayer);
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const pixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(wmsLayer, 'getData').and.callFake(() => [42, 42, 42, 42]);

				expect(handler._getDataAtPixel(pixel, map)).toBeFalse();
			});
		});

		it('checks if the pixel is transparent', async () => {
			const id = 'id';
			const geoResourceId = 'geoResourceId';
			spyOn(geoResourceService, 'byId')
				.withArgs(geoResourceId)
				.and.returnValue(new WmsGeoResource(geoResourceId, '', '', '', ''));
			const map = setupMap();
			const wmsSource = new ImageWMS();
			const wmsLayer = new ImageLayer({ source: wmsSource, geoResourceId, id });
			map.addLayer(wmsLayer);
			const handler = setup();
			handler.register(map);
			await renderComplete(map);
			// safe to call map.getPixelFromCoordinate from now on
			const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
			const notMatchingCoordinateInPixel = map.getPixelFromCoordinate(notMatchingCoordinate);
			spyOn(wmsLayer, 'getData').and.callFake((pixel) => {
				return pixel[0] === matchingCoordinateInPixel[0] ? [42, 42, 42, 42] : [42, 42, 42, 0];
			});

			expect(handler._getDataAtPixel(notMatchingCoordinateInPixel, map)).toBeFalse();
			expect(handler._getDataAtPixel(matchingCoordinateInPixel, map)).toBeTrue();
		});
	});
});
