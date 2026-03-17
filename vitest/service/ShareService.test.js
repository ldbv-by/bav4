import { $injector } from '@src/injection';
import { addLayer, SwipeAlignment } from '@src/store/layers/layers.action';
import { setCategory, setWaypoints } from '@src/store/routing/routing.action';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { changeRotation, changeZoomAndCenter } from '@src/store/position/position.action';
import { activate as activateGeolocation } from '@src/store/geolocation/geolocation.action';
import { positionReducer } from '@src/store/position/position.reducer';
import { setCurrent } from '@src/store/topics/topics.action';
import { topicsReducer } from '@src/store/topics/topics.reducer';
import { QueryParameters } from '@src/domain/queryParameters';
import { ShareService } from '@src/services/ShareService';
import { TestUtils } from '@test/test-utils';
import { round } from '@src/utils/numberUtils';
import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '@src/domain/coordinateRepresentation';
import { routingReducer } from '@src/store/routing/routing.reducer';
import { toolsReducer } from '@src/store/tools/tools.reducer';
import { setCurrentTool } from '@src/store/tools/tools.action';
import { highlightReducer } from '@src/store/highlight/highlight.reducer';
import { catalogReducer } from '@src/store/catalog/catalog.reducer';
import { layerSwipeReducer } from '@src/store/layerSwipe/layerSwipe.reducer';
import { geolocationReducer } from '@src/store/geolocation/geolocation.reducer';
import { addHighlightFeatures } from '@src/store/highlight/highlight.action';
import { createNoInitialStateMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer';
import { TabIds } from '@src/domain/mainMenu';
import { setTab } from '@src/store/mainMenu/mainMenu.action';
import { setOpenNodes } from '@src/store/catalog/catalog.action';
import { Tools } from '@src/domain/tools';
import { CROSSHAIR_HIGHLIGHT_FEATURE_ID, HighlightFeatureType, SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY } from '@src/domain/highlightFeature';
import { addFeatureInfoItems, startRequest } from '@src/store/featureInfo/featureInfo.action';
import { featureInfoReducer } from '@src/store/featureInfo/featureInfo.reducer';

describe('ShareService', () => {
	const coordinateService = {
		transform: () => {}
	};
	const mapService = {
		getLocalProjectedSrid: () => {},
		getCoordinateRepresentations: () => {},
		getSrid: () => {},
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};
	const geoResourceService = {
		byId: () => {}
	};
	const environmentService = {
		getWindow: () => {}
	};
	const configService = {
		getValueAsPath: () => {}
	};

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tab: TabIds.TOPICS
			},
			...state
		};
		const store = TestUtils.setupStoreAndDi(initialState, {
			layers: layersReducer,
			position: positionReducer,
			topics: topicsReducer,
			catalog: catalogReducer,
			routing: routingReducer,
			tools: toolsReducer,
			highlight: highlightReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			layerSwipe: layerSwipeReducer,
			geolocation: geolocationReducer,
			featureInfo: featureInfoReducer
		});
		$injector
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ConfigService', configService);

		return store;
	};

	describe('class', () => {
		it('defines constant values', async () => {
			expect(ShareService.ROTATION_VALUE_PRECISION).toBe(4);
			expect(ShareService.ZOOM_LEVEL_PRECISION).toBe(3);
		});
	});

	describe('copy to clipboard', () => {
		it('calls Clipboard API', async () => {
			setup();
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = vi.fn().mockResolvedValue('success');
			const mockWindow = { isSecureContext: true, navigator: mockNavigator };
			vi.spyOn(environmentService, 'getWindow').mockReturnValue(mockWindow);

			const instanceUnderTest = new ShareService();
			const resolved = await instanceUnderTest.copyToClipboard('foo');
			expect(resolved).toBe('success');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});

		it('rejects when Clipboard API is not available', async () => {
			setup();
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = vi.fn().mockResolvedValue('success');
			const mockWindow = { isSecureContext: false, navigator: mockNavigator };
			vi.spyOn(environmentService, 'getWindow').mockReturnValue(mockWindow);

			const instanceUnderTest = new ShareService();

			await expect(instanceUnderTest.copyToClipboard('foo')).rejects.toThrow('Clipboard API is not available');
			expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();
		});
	});

	describe('encode current state to url', () => {
		describe('_extractLayers', () => {
			it('extracts the current layers state using the GeoResource id', () => {
				setup();
				const instanceUnderTest = new ShareService();
				vi.spyOn(geoResourceService, 'byId').mockReturnValue({ hidden: false });
				addLayer('someLayer_123', { geoResourceId: 'someLayer' });
				addLayer('anotherLayer_123', { geoResourceId: 'https://foo.bar/some||thing' });

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'https%3A%2F%2Ffoo.bar%2Fsome%7C%7Cthing']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_STYLE]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_DISPLAY_FEATURE_LABELS]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_FILTER]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_UPDATE_INTERVAL]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring hidden layers', () => {
				setup();
				const instanceUnderTest = new ShareService();
				vi.spyOn(geoResourceService, 'byId').mockReturnValue({ hidden: false });
				addLayer('someLayer', { constraints: { hidden: true } });
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_STYLE]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_DISPLAY_FEATURE_LABELS]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_FILTER]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_UPDATE_INTERVAL]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring hidden geoResources', () => {
				setup();
				const instanceUnderTest = new ShareService();
				vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
					return id === 'someLayer' ? { hidden: true } : {};
				});
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_STYLE]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_DISPLAY_FEATURE_LABELS]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_FILTER]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_UPDATE_INTERVAL]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring including geoResources', () => {
				setup();
				const instanceUnderTest = new ShareService();
				vi.spyOn(geoResourceService, 'byId').mockImplementation((id) => {
					return id === 'someLayer' ? { hidden: true } : {};
				});
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers({ includeHiddenGeoResources: true });
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_STYLE]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_DISPLAY_FEATURE_LABELS]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_FILTER]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_UPDATE_INTERVAL]).not.toBeDefined();
			});

			it('extracts the current layers state considering non-default values', () => {
				setup();
				const instanceUnderTest = new ShareService();
				vi.spyOn(geoResourceService, 'byId').mockReturnValue({ hidden: false });
				addLayer('someLayer', { opacity: 0.5, constraints: { swipeAlignment: SwipeAlignment.LEFT } });
				addLayer('anotherLayer', { visible: false, constraints: { filter: '(((plz+=+12345)))', updateInterval: 77, displayFeatureLabels: true } });
				addLayer('aThirdLayer', {
					timestamp: '2000',
					style: { baseColor: '#fcba03' },
					constraints: { swipeAlignment: SwipeAlignment.RIGHT, displayFeatureLabels: false }
				});

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer', 'aThirdLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).toEqual([0.5, 1.0, 1.0]);
				expect(extract[QueryParameters.LAYER_VISIBILITY]).toEqual([true, false, true]);
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).toEqual(['', '', '2000']);
				expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_STYLE]).toEqual(['', '', 'fcba03']);
				expect(extract[QueryParameters.LAYER_DISPLAY_FEATURE_LABELS]).toEqual(['', true, false]);
				expect(extract[QueryParameters.LAYER_FILTER]).toEqual(['', encodeURIComponent('(((plz+=+12345)))'), '']);
				expect(extract[QueryParameters.LAYER_UPDATE_INTERVAL]).toEqual(['', 77, '']);
			});

			describe('tool `COMPARE` is active', () => {
				it('extracts the current layers state considering non default values', () => {
					setup({
						tools: {
							current: Tools.COMPARE
						}
					});
					const instanceUnderTest = new ShareService();
					vi.spyOn(geoResourceService, 'byId').mockReturnValue({ hidden: false });
					addLayer('someLayer', { opacity: 0.5, constraints: { swipeAlignment: SwipeAlignment.LEFT } });
					addLayer('anotherLayer', { visible: false });
					addLayer('aThirdLayer', { timestamp: '2000', constraints: { swipeAlignment: SwipeAlignment.RIGHT } });

					const extract = instanceUnderTest._extractLayers();
					expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer', 'aThirdLayer']);
					expect(extract[QueryParameters.LAYER_OPACITY]).toEqual([0.5, 1.0, 1.0]);
					expect(extract[QueryParameters.LAYER_VISIBILITY]).toEqual([true, false, true]);
					expect(extract[QueryParameters.LAYER_TIMESTAMP]).toEqual(['', '', '2000']);
					expect(extract[QueryParameters.LAYER_SWIPE_ALIGNMENT]).toEqual([SwipeAlignment.LEFT, SwipeAlignment.NOT_SET, SwipeAlignment.RIGHT]);
				});
			});
		});

		describe('_extractPosition', () => {
			describe('from state', () => {
				it('extracts the current position state', () => {
					const zoomLevel = 5.35;
					const rotationValue = 0.5347485;
					const viewSrid = 25832;
					const mapSrid = 3857;
					setup();
					const instanceUnderTest = new ShareService();
					vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([{ code: viewSrid, digits: 3 }]);
					vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
					vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(viewSrid);
					const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([44.12345, 88.12345]);
					changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });
					changeRotation(rotationValue);

					const extract = instanceUnderTest._extractPosition();

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBe(round(rotationValue, ShareService.ROTATION_VALUE_PRECISION));
					expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, viewSrid);
				});

				describe('CoordinateRepresentation is global', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([GlobalCoordinateRepresentations.WGS84]);
						vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
						vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(25832);
						const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([11111.111111, 22222.222222]);
						changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });

						const extract = instanceUnderTest._extractPosition();

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111.11111', '22222.22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
						expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, GlobalCoordinateRepresentations.WGS84.code);
					});
				});
				describe('CoordinateRepresentation is local', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([BvvCoordinateRepresentations.UTM32]);
						vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
						vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(BvvCoordinateRepresentations.UTM32.code);
						const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([11111.111111, 22222.222222]);
						changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });

						const extract = instanceUnderTest._extractPosition();

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111', '22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
						expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, BvvCoordinateRepresentations.UTM32.code);
					});
				});
			});
			describe('from method parameters', () => {
				it('extracts the current position state', () => {
					const zoomLevel = 5.35;
					const rotationValue = 0.5347485;
					const viewSrid = 25832;
					const mapSrid = 3857;
					setup();
					const instanceUnderTest = new ShareService();
					vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([{ code: viewSrid, digits: 3 }]);
					vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
					vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(viewSrid);
					const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([44.12345, 88.12345]);

					const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel, rotationValue);

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBe(round(rotationValue, ShareService.ROTATION_VALUE_PRECISION));
					expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, viewSrid);
				});

				describe('CoordinateRepresentation is global', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([GlobalCoordinateRepresentations.WGS84]);
						vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
						vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(25832);
						const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([11111.111111, 22222.222222]);

						const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel);

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111.11111', '22222.22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
						expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, GlobalCoordinateRepresentations.WGS84.code);
					});
				});
				describe('CoordinateRepresentation is local', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						vi.spyOn(mapService, 'getCoordinateRepresentations').mockReturnValue([BvvCoordinateRepresentations.UTM32]);
						vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
						vi.spyOn(mapService, 'getLocalProjectedSrid').mockReturnValue(BvvCoordinateRepresentations.UTM32.code);
						const coordinateServiceSpy = vi.spyOn(coordinateService, 'transform').mockReturnValue([11111.111111, 22222.222222]);

						const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel);

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111', '22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
						expect(coordinateServiceSpy).toHaveBeenCalledWith([21, 42], mapSrid, BvvCoordinateRepresentations.UTM32.code);
					});
				});
			});
		});

		describe('_extractTopic', () => {
			it('extracts the current topics state', () => {
				setup();
				const instanceUnderTest = new ShareService();
				setCurrent('someTopic');

				const extract = instanceUnderTest._extractTopic();

				expect(extract[QueryParameters.TOPIC]).toBe('someTopic');
			});

			it('does nothing when no topic id is available', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const extract = instanceUnderTest._extractTopic();

				expect(extract[QueryParameters.TOPIC]).toBeUndefined();
			});
		});

		describe('_extractCatalogNodes', () => {
			it('extracts the current catalog state', () => {
				setup();
				const instanceUnderTest = new ShareService();
				setOpenNodes(['node0', 'node1']);

				const extract = instanceUnderTest._extractCatalogNodes();

				expect(extract[QueryParameters.CATALOG_NODE_IDS]).toEqual(['node0', 'node1']);
			});

			it('does nothing when no catalog nodes are available', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const extract = instanceUnderTest._extractCatalogNodes();

				expect(extract[QueryParameters.CATALOG_NODE_IDS]).toBeUndefined();
			});
		});

		describe('_extractRoute', () => {
			it('extracts the current route', () => {
				setup();
				const mapSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
				const categoryId = 'catId';
				const waypoints = [
					[1, 2],
					[3, 4]
				];
				const instanceUnderTest = new ShareService();

				setCategory(categoryId);
				setWaypoints(waypoints);

				const extract = instanceUnderTest._extractRoute();

				expect(extract[QueryParameters.ROUTE_CATEGORY]).toBe(categoryId);
				expect(extract[QueryParameters.ROUTE_WAYPOINTS]).toEqual([
					['1.000000', '2.000000'],
					['3.000000', '4.000000']
				]);
			});

			it('does nothing when no waypoints are available', () => {
				setup();
				const categoryId = 'catId';
				const instanceUnderTest = new ShareService();

				setCategory(categoryId);
				setWaypoints([]);

				const extract = instanceUnderTest._extractRoute();

				expect(extract[QueryParameters.ROUTE_CATEGORY]).toBeUndefined();
				expect(extract[QueryParameters.ROUTE_WAYPOINTS]).toBeUndefined();
			});
		});

		describe('_extractCrosshair', () => {
			describe('exactly one suitable highlight feature is available', () => {
				it('sets the crosshair query parameter', () => {
					setup();
					const mapSrid = 3857;
					vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
					const instanceUnderTest = new ShareService();
					addHighlightFeatures([
						{
							id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
							category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
							type: HighlightFeatureType.MARKER,
							data: [42, 21]
						},
						{
							id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
							category: 'cat_id1',
							type: HighlightFeatureType.MARKER,
							data: [77, 55]
						}
					]);

					const extract = instanceUnderTest._extractCrosshair();

					expect(extract[QueryParameters.CROSSHAIR]).toEqual([true, '42.000000', '21.000000']);
				});
			});

			describe('more than one highlight features are available', () => {
				it('does nothing', () => {
					setup();
					const instanceUnderTest = new ShareService();
					addHighlightFeatures([
						{
							id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
							type: HighlightFeatureType.MARKER,
							data: { coordinate: [42, 21] }
						},
						{
							id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
							type: HighlightFeatureType.MARKER,
							data: { coordinate: [77, 55] }
						}
					]);

					const extract = instanceUnderTest._extractCrosshair();

					expect(extract[QueryParameters.CROSSHAIR]).toBeUndefined();
				});
			});

			describe('no highlight feature is available', () => {
				it('does nothing', () => {
					setup();
					const instanceUnderTest = new ShareService();

					const extract = instanceUnderTest._extractCrosshair();

					expect(extract[QueryParameters.CROSSHAIR]).toBeUndefined();
				});
			});

			describe('wrong type of highlight feature is available', () => {
				it('does nothing', () => {
					setup();
					const instanceUnderTest = new ShareService();
					addHighlightFeatures({
						id: 'hf_id',
						type: HighlightFeatureType.MARKER_TMP,
						data: {}
					});

					const extract = instanceUnderTest._extractCrosshair();

					expect(extract[QueryParameters.CROSSHAIR]).toBeUndefined();
				});
			});
		});

		describe('_extractFeatureInfo', () => {
			it('sets the feature-info-request query parameter', () => {
				setup();
				const mapSrid = 3857;
				vi.spyOn(mapService, 'getSrid').mockReturnValue(mapSrid);
				const instanceUnderTest = new ShareService();

				startRequest([42, 21]);

				let extract = instanceUnderTest._extractFeatureInfo();
				expect(extract[QueryParameters.FEATURE_INFO_REQUEST]).toBeUndefined();

				addFeatureInfoItems({ title: 'title0', content: 'content0' });

				extract = instanceUnderTest._extractFeatureInfo();
				expect(extract[QueryParameters.FEATURE_INFO_REQUEST]).toEqual(['42.000000', '21.000000']);
			});
		});

		describe('_extractTool', () => {
			it('extracts the current tool', () => {
				setup();
				const instanceUnderTest = new ShareService();

				expect(instanceUnderTest._extractTool()).toEqual({});

				setCurrentTool('someTool');

				expect(instanceUnderTest._extractTool()[QueryParameters.TOOL_ID]).toBe('someTool');
			});
		});

		describe('_extractMainMenu', () => {
			it('extracts the main menu id', () => {
				setup({ mainMenu: { tab: null } });
				const instanceUnderTest = new ShareService();

				expect(instanceUnderTest._extractMainMenu()).toEqual({});

				setTab(TabIds.MISC);

				expect(instanceUnderTest._extractMainMenu()[QueryParameters.MENU_ID]).toBe(TabIds.MISC);
			});
		});

		describe('_extractGeolocation', () => {
			it('extracts the state of the geolocation', () => {
				setup();
				const instanceUnderTest = new ShareService();

				expect(instanceUnderTest._extractGeolocation()).toEqual({});

				activateGeolocation();

				expect(instanceUnderTest._extractGeolocation()[QueryParameters.GEOLOCATION]).toBe(true);
			});
		});

		describe('_extractSwipeRatio', () => {
			describe('layerSwipe is active', () => {
				it('sets the swipeRation query parameter', () => {
					setup({
						layerSwipe: {
							active: true,
							ratio: 42
						}
					});
					const instanceUnderTest = new ShareService();

					const extract = instanceUnderTest._extractSwipeRatio();

					expect(extract[QueryParameters.SWIPE_RATIO]).toBe(0.42);
				});
			});

			describe('layerSwipe is NOT active', () => {
				it('ignores the swipeRation query parameter', () => {
					setup({
						layerSwipe: {
							active: false,
							ratio: 42
						}
					});
					const instanceUnderTest = new ShareService();

					const extract = instanceUnderTest._extractSwipeRatio();

					expect(extract[QueryParameters.SWIPE_RATIO]).toBeUndefined();
				});
			});
		});

		describe('_mergeExtraParams', () => {
			it('merges an array when key already present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const { l: l1 } = instanceUnderTest._mergeExtraParams({ l: ['a', 'b'] }, { l: 'c' });

				expect(l1).toEqual(['a', 'b', 'c']);

				const { l: l2 } = instanceUnderTest._mergeExtraParams({ l: ['a', 'b'] }, { l: ['b', 'c'] });

				expect(l2).toEqual(['a', 'b', 'b', 'c']);
			});

			it('adds value(s) when key not present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const result = instanceUnderTest._mergeExtraParams({ foo: 'bar' }, { l: 0.5 });

				expect(result).toEqual({ foo: 'bar', l: 0.5 });
			});

			it('does nothing when key not present', () => {
				setup();
				const instanceUnderTest = new ShareService();

				const result = instanceUnderTest._mergeExtraParams({ foo: 'bar' }, { foo: 'other' });

				expect(result).toEqual({ foo: 'bar' });
			});
		});

		describe('encodeState', () => {
			it('encodes a state object to url', () => {
				setup();
				const instanceUnderTest = new ShareService();
				const expectedResult = 'encoded';
				const encodeStateForPositionSpy = vi.spyOn(instanceUnderTest, 'encodeStateForPosition').mockReturnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState();

				expect(encoded).toBe(expectedResult);
				expect(encodeStateForPositionSpy).toHaveBeenCalledWith({}, {}, []);
			});

			it('encodes a state object to url with extra params', () => {
				setup();
				const instanceUnderTest = new ShareService();
				const extraParam = { foo: 'bar' };
				const expectedResult = 'encoded';
				const encodeStateForPositionSpy = vi.spyOn(instanceUnderTest, 'encodeStateForPosition').mockReturnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState(extraParam);

				expect(encoded).toBe(expectedResult);
				expect(encodeStateForPositionSpy).toHaveBeenCalledWith({}, extraParam, []);
			});

			it('encodes a state object to url with path params', () => {
				setup();
				const instanceUnderTest = new ShareService();
				const pathParameters = ['param0', 'param1'];
				const expectedResult = 'encoded';
				const encodeStateForPositionSpy = vi.spyOn(instanceUnderTest, 'encodeStateForPosition').mockReturnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState({}, pathParameters);

				expect(encoded).toBe(expectedResult);
				expect(encodeStateForPositionSpy).toHaveBeenCalledWith({}, {}, pathParameters);
			});
		});

		describe('encodeStateForPosition', () => {
			const mockFrontendUrl = 'http://frontend.de/';

			describe('for pathname "/"', () => {
				it('encodes a state object to url', () => {
					setup();
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					vi.spyOn(instanceUnderTest, '_extractLayers').mockReturnValue({ l: ['someLayer', 'anotherLayer'] });
					vi.spyOn(instanceUnderTest, '_extractTopic').mockReturnValue({ t: 'someTopic' });
					vi.spyOn(instanceUnderTest, '_extractCatalogNodes').mockReturnValue({ cnids: 'someNode' });
					vi.spyOn(instanceUnderTest, '_extractRoute').mockReturnValue({ rtwp: '1,2', rtc: 'rtCatId' });
					vi.spyOn(instanceUnderTest, '_extractTool').mockReturnValue({ tid: 'someTool' });
					vi.spyOn(instanceUnderTest, '_extractCrosshair').mockReturnValue({ crh: true });
					vi.spyOn(instanceUnderTest, '_extractMainMenu').mockReturnValue({ mid: 4 });
					vi.spyOn(instanceUnderTest, '_extractSwipeRatio').mockReturnValue({ sr: 0.42 });
					vi.spyOn(instanceUnderTest, '_extractGeolocation').mockReturnValue({ gl: true });

					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBe(true);
					expect(queryParams.size).toBe(13);
					expect(queryParams.get(QueryParameters.LAYER)).toBe('someLayer,anotherLayer');
					expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
					expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
					expect(queryParams.get(QueryParameters.ROTATION)).toBe('0.5');
					expect(queryParams.get(QueryParameters.TOPIC)).toBe('someTopic');
					expect(queryParams.get(QueryParameters.CATALOG_NODE_IDS)).toBe('someNode');
					expect(queryParams.get(QueryParameters.ROUTE_WAYPOINTS)).toBe('1,2');
					expect(queryParams.get(QueryParameters.ROUTE_CATEGORY)).toBe('rtCatId');
					expect(queryParams.get(QueryParameters.TOOL_ID)).toBe('someTool');
					expect(queryParams.get(QueryParameters.CROSSHAIR)).toBe('true');
					expect(queryParams.get(QueryParameters.MENU_ID)).toBe('4');
					expect(queryParams.get(QueryParameters.SWIPE_RATIO)).toBe('0.42');
					expect(queryParams.get(QueryParameters.GEOLOCATION)).toBe('true');
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), {});
					expect(configServiceSpy).toHaveBeenCalledWith('FRONTEND_URL');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});

				it('encodes a state object to url removing `index.html` from path', () => {
					setup();
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(`${mockFrontendUrl}index.html/`);
					const instanceUnderTest = new ShareService();
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBe(true);
					expect(queryParams.size).toBe(5);
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), {});
					expect(configServiceSpy).toHaveBeenCalledWith('FRONTEND_URL');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});

				it('encodes a state object to url merging extra parameter', () => {
					setup();
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extraParam = { foo: 'bar' };
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, extraParam);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBe(true);
					expect(queryParams.size).toBe(6);

					expect(queryParams.get('foo')).toBe('bar');
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), extraParam);
					expect(configServiceSpy).toHaveBeenCalledWith('FRONTEND_URL');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});

				it('encodes a state object to url appending optional path parameters', () => {
					setup();
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const pathParameters = ['param0', 'param1'];
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, {}, pathParameters);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/param0/param1?')).toBe(true);
					expect(queryParams.size).toBe(5);
					expect(configServiceSpy).toHaveBeenCalledWith('FRONTEND_URL');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});
			});

			describe('for existing pathname e.g. "/app"', () => {
				const mockFrontendUrl = 'http://frontend.de/app/';

				it('encodes a state object to url', () => {
					setup();
					const configServiceSpy = vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBe(true);
					expect(queryParams.size).toBe(5);
					expect(queryParams.get(QueryParameters.LAYER)).toBe('');
					expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
					expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
					expect(queryParams.get(QueryParameters.ROTATION)).toBe('0.5');
					expect(queryParams.get(QueryParameters.MENU_ID)).toBe('0');
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), {});
					expect(configServiceSpy).toHaveBeenCalledWith('FRONTEND_URL');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});

				it('encodes a state object to url removing `index.html` from path', () => {
					setup();
					vi.spyOn(configService, 'getValueAsPath').mockReturnValue(`${mockFrontendUrl}index.html/`);
					const instanceUnderTest = new ShareService();
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBe(true);
					expect(queryParams.size).toBe(5);
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), {});
				});

				it('encodes a state object to url merging extra parameter', () => {
					setup();
					vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extraParam = { foo: 'bar' };
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const mergeExtraParamsSpy = vi.spyOn(instanceUnderTest, '_mergeExtraParams');

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, extraParam);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBe(true);
					expect(queryParams.size).toBe(6);
					expect(queryParams.get('foo')).toBe('bar');
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
					expect(mergeExtraParamsSpy).toHaveBeenCalledWith(expect.anything(), extraParam);
				});

				it('encodes a state object to url appending optional path parameters', () => {
					setup();
					vi.spyOn(configService, 'getValueAsPath').mockReturnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const pathParameters = ['param0', 'param1'];
					const extractPositionSpy = vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, {}, pathParameters);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/param0/param1?')).toBe(true);
					expect(queryParams.size).toBe(5);
					expect(extractPositionSpy).toHaveBeenCalledWith([44.123, 88.123], 5, 0.5);
				});
			});
		});
	});

	describe('getParameters', () => {
		it('returns all parameters of the current application that are required to restore it', () => {
			setup();
			const instanceUnderTest = new ShareService();
			vi.spyOn(instanceUnderTest, '_extractPosition').mockReturnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
			const extractLayersSpy = vi.spyOn(instanceUnderTest, '_extractLayers').mockReturnValue({ l: ['someLayer', 'anotherLayer'] });
			vi.spyOn(instanceUnderTest, '_extractTopic').mockReturnValue({ t: 'someTopic' });
			vi.spyOn(instanceUnderTest, '_extractCatalogNodes').mockReturnValue({ cnids: 'someNode' });
			vi.spyOn(instanceUnderTest, '_extractRoute').mockReturnValue({ rtwp: '1,2', rtc: 'rtCatId' });
			vi.spyOn(instanceUnderTest, '_extractTool').mockReturnValue({ tid: 'someTool' });
			vi.spyOn(instanceUnderTest, '_extractCrosshair').mockReturnValue({ crh: true });
			vi.spyOn(instanceUnderTest, '_extractMainMenu').mockReturnValue({ mid: 4 });
			vi.spyOn(instanceUnderTest, '_extractSwipeRatio').mockReturnValue({ sr: 0.42 });
			vi.spyOn(instanceUnderTest, '_extractGeolocation').mockReturnValue({ gl: true });

			const params = instanceUnderTest.getParameters();

			expect(params).toHaveLength(13);
			expect(params.get(QueryParameters.LAYER)).toEqual(['someLayer', 'anotherLayer']);
			expect(params.get(QueryParameters.ZOOM)).toBe(5);
			expect(params.get(QueryParameters.CENTER)).toEqual([44.123, 88.123]);
			expect(params.get(QueryParameters.ROTATION)).toBe(0.5);
			expect(params.get(QueryParameters.TOPIC)).toBe('someTopic');
			expect(params.get(QueryParameters.CATALOG_NODE_IDS)).toBe('someNode');
			expect(params.get(QueryParameters.ROUTE_WAYPOINTS)).toBe('1,2');
			expect(params.get(QueryParameters.ROUTE_CATEGORY)).toBe('rtCatId');
			expect(params.get(QueryParameters.TOOL_ID)).toBe('someTool');
			expect(params.get(QueryParameters.CROSSHAIR)).toBe(true);
			expect(params.get(QueryParameters.MENU_ID)).toBe(4);
			expect(params.get(QueryParameters.SWIPE_RATIO)).toBe(0.42);
			expect(params.get(QueryParameters.GEOLOCATION)).toBe(true);
			expect(extractLayersSpy).toHaveBeenCalledWith({ includeHiddenGeoResources: false });
		});
	});
});
