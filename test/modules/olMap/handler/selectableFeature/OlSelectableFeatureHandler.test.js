import { Feature, Map, View } from 'ol';
import { Point } from 'ol/geom';
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
import TileLayer from 'ol/layer/Tile';
import { XYZ as XYZSource } from 'ol/source';

describe('OlSelectableFeatureHandler', () => {
	const renderComplete = (map) => {
		return new Promise((resolve) => {
			map.on('rendercomplete', () => {
				resolve();
			});
		});
	};

	const matchingCoordinate = fromLonLat([11, 48]);
	const notMatchingCoordinate = fromLonLat([5, 12]);

	const setup = (state = {}) => {
		TestUtils.setupStoreAndDi(state, { tools: toolsReducer });
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
		const handler = new OlSelectableFeatureHandler();

		expect(handler.id).toBe('SelectableFeature_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when pointer moves over vector feature', () => {
		it('changes the cursor', async () => {
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

			expect(map.getTargetElement().style.cursor).toBe('');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('pointer');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, notMatchingCoordinateInPixel[0], notMatchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('');
		});
	});

	describe('when pointer moves over an image', () => {
		describe('and pixel is NOT transparent', () => {
			it('changes the cursor', async () => {
				const map = setupMap();
				const wmsSource = new ImageWMS();
				const wmsLayer = new ImageLayer({ source: wmsSource });
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

				expect(map.getTargetElement().style.cursor).toBe('');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('pointer');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, notMatchingCoordinateInPixel[0], notMatchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('');
			});
		});

		describe('and pixel is transparent', () => {
			it('does nothing', async () => {
				const map = setupMap();
				const wmsSource = new ImageWMS();
				const wmsLayer = new ImageLayer({ source: wmsSource });
				map.addLayer(wmsLayer);
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(wmsLayer, 'getData').withArgs(matchingCoordinateInPixel).and.returnValue([42, 42, 42, 0]);

				expect(map.getTargetElement().style.cursor).toBe('');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('');
			});
		});
	});

	describe('when pointer moves over an image tile', () => {
		describe('and pixel is NOT transparent', () => {
			it('changes the cursor', async () => {
				const map = setupMap();
				const tileSource = new XYZSource();
				const tileLayer = new TileLayer({ source: tileSource });
				map.addLayer(tileLayer);
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
				const notMatchingCoordinateInPixel = map.getPixelFromCoordinate(notMatchingCoordinate);
				spyOn(tileLayer, 'getData').and.callFake((pixel) => {
					return pixel[0] === matchingCoordinateInPixel[0] ? [42, 42, 42, 42] : [42, 42, 42, 0];
				});

				expect(map.getTargetElement().style.cursor).toBe('');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('pointer');

				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, notMatchingCoordinateInPixel[0], notMatchingCoordinateInPixel[1], false);

				expect(map.getTargetElement().style.cursor).toBe('');
			});
		});

		describe('and pixel is transparent', () => {
			it('does nothing', async () => {
				const map = setupMap();
				const tileSource = new XYZSource();
				const tileLayer = new TileLayer({ source: tileSource });
				map.addLayer(tileLayer);
				const handler = setup();
				handler.register(map);
				await renderComplete(map);
				// safe to call map.getPixelFromCoordinate from now on
				const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);
				spyOn(tileLayer, 'getData').withArgs(matchingCoordinateInPixel).and.returnValue([42, 42, 42, 0]);

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
			// safe to call map.getPixelFromCoordinate from now on
			const matchingCoordinateInPixel = map.getPixelFromCoordinate(matchingCoordinate);

			expect(map.getTargetElement().style.cursor).toBe('');

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, matchingCoordinateInPixel[0], matchingCoordinateInPixel[1], false);

			expect(map.getTargetElement().style.cursor).toBe('');
		});
	});
});
