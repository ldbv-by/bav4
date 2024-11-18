import { $injector } from '../../src/injection';
import { addLayer } from '../../src/store/layers/layers.action';
import { setCategory, setWaypoints } from '../../src/store/routing/routing.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { changeRotation, changeZoomAndCenter } from '../../src/store/position/position.action';
import { positionReducer } from '../../src/store/position/position.reducer';
import { setCurrent } from '../../src/store/topics/topics.action';
import { topicsReducer } from '../../src/store/topics/topics.reducer';
import { QueryParameters } from '../../src/domain/queryParameters';
import { ShareService } from '../../src/services/ShareService';
import { TestUtils } from '../test-utils';
import { round } from '../../src/utils/numberUtils';
import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '../../src/domain/coordinateRepresentation';
import { routingReducer } from '../../src/store/routing/routing.reducer';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, HighlightFeatureType } from '../../src/store/highlight/highlight.action';
import { CROSSHAIR_HIGHLIGHT_FEATURE_ID } from '../../src/plugins/HighlightPlugin';

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
		const store = TestUtils.setupStoreAndDi(state, {
			layers: layersReducer,
			position: positionReducer,
			topics: topicsReducer,
			routing: routingReducer,
			tools: toolsReducer,
			highlight: highlightReducer
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
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: true, navigator: mockNavigator };
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

			const instanceUnderTest = new ShareService();
			const resolved = await instanceUnderTest.copyToClipboard('foo');
			expect(resolved).toBe('success');

			expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('foo');
		});

		it('rejects when Clipboard API is not available', async () => {
			setup();
			const mockNavigator = { clipboard: {} };
			mockNavigator.clipboard.writeText = jasmine.createSpy().and.returnValue(Promise.resolve('success'));
			const mockWindow = { isSecureContext: false, navigator: mockNavigator };
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

			const instanceUnderTest = new ShareService();

			try {
				await instanceUnderTest.copyToClipboard('foo');
				throw new Error('Promise should not be resolved');
			} catch (error) {
				expect(error.message).toBe('Clipboard API is not available');
				expect(mockNavigator.clipboard.writeText).not.toHaveBeenCalled();
			}
		});
	});

	describe('encode current state to url', () => {
		describe('_extractLayers', () => {
			it('extracts the current layers state using the GeoResource id', () => {
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(geoResourceService, 'byId').and.returnValue({ hidden: false });
				addLayer('someLayer_123', { geoResourceId: 'someLayer' });
				addLayer('anotherLayer_123', { geoResourceId: 'https://foo.bar/some||thing' });

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'https%3A%2F%2Ffoo.bar%2Fsome%7C%7Cthing']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring hidden layers', () => {
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(geoResourceService, 'byId').and.returnValue({ hidden: false });
				addLayer('someLayer', { constraints: { hidden: true } });
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring hidden geoResources', () => {
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(geoResourceService, 'byId').and.callFake((id) => {
					return id === 'someLayer' ? { hidden: true } : {};
				});
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
			});

			it('extracts the current layers state ignoring including geoResources', () => {
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(geoResourceService, 'byId').and.callFake((id) => {
					return id === 'someLayer' ? { hidden: true } : {};
				});
				addLayer('someLayer');
				addLayer('anotherLayer');

				const extract = instanceUnderTest._extractLayers({ includeHiddenGeoResources: true });
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_VISIBILITY]).not.toBeDefined();
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).not.toBeDefined();
			});

			it('extracts the current layers state considering non default values', () => {
				setup();
				const instanceUnderTest = new ShareService();
				spyOn(geoResourceService, 'byId').and.returnValue({ hidden: false });
				addLayer('someLayer', { opacity: 0.5 });
				addLayer('anotherLayer', { visible: false });
				addLayer('aThirdLayer', { timestamp: '2000' });

				const extract = instanceUnderTest._extractLayers();
				expect(extract[QueryParameters.LAYER]).toEqual(['someLayer', 'anotherLayer', 'aThirdLayer']);
				expect(extract[QueryParameters.LAYER_OPACITY]).toEqual([0.5, 1.0, 1.0]);
				expect(extract[QueryParameters.LAYER_VISIBILITY]).toEqual([true, false, true]);
				expect(extract[QueryParameters.LAYER_TIMESTAMP]).toEqual(['', '', '2000']);
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
					spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([{ code: viewSrid, digits: 3 }]);
					spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
					spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(viewSrid);
					spyOn(coordinateService, 'transform').withArgs([21, 42], mapSrid, viewSrid).and.returnValue([44.12345, 88.12345]);
					changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });
					changeRotation(rotationValue);

					const extract = instanceUnderTest._extractPosition();

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBe(round(rotationValue, ShareService.ROTATION_VALUE_PRECISION));
				});

				describe('CoordinateRepresentation is global', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
						spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
						spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(25832);
						spyOn(coordinateService, 'transform')
							.withArgs([21, 42], mapSrid, GlobalCoordinateRepresentations.WGS84.code)
							.and.returnValue([11111.111111, 22222.222222]);
						changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });

						const extract = instanceUnderTest._extractPosition();

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111.11111', '22222.22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
					});
				});
				describe('CoordinateRepresentation is local', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([BvvCoordinateRepresentations.UTM32]);
						spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
						spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(BvvCoordinateRepresentations.UTM32.code);
						spyOn(coordinateService, 'transform')
							.withArgs([21, 42], mapSrid, BvvCoordinateRepresentations.UTM32.code)
							.and.returnValue([11111.111111, 22222.222222]);
						changeZoomAndCenter({ zoom: zoomLevel, center: [21, 42] });

						const extract = instanceUnderTest._extractPosition();

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111', '22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
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
					spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([{ code: viewSrid, digits: 3 }]);
					spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
					spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(viewSrid);
					spyOn(coordinateService, 'transform').withArgs([21, 42], mapSrid, viewSrid).and.returnValue([44.12345, 88.12345]);

					const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel, rotationValue);

					expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
					expect(extract[QueryParameters.CENTER]).toEqual(['44.123', '88.123']);
					expect(extract[QueryParameters.ROTATION]).toBe(round(rotationValue, ShareService.ROTATION_VALUE_PRECISION));
				});

				describe('CoordinateRepresentation is global', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([GlobalCoordinateRepresentations.WGS84]);
						spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
						spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(25832);
						spyOn(coordinateService, 'transform')
							.withArgs([21, 42], mapSrid, GlobalCoordinateRepresentations.WGS84.code)
							.and.returnValue([11111.111111, 22222.222222]);

						const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel);

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111.11111', '22222.22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
					});
				});
				describe('CoordinateRepresentation is local', () => {
					it('extracts the position state', () => {
						const zoomLevel = 5.35;
						const mapSrid = 3857;
						setup();
						const instanceUnderTest = new ShareService();
						spyOn(mapService, 'getCoordinateRepresentations').and.returnValue([BvvCoordinateRepresentations.UTM32]);
						spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
						spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(BvvCoordinateRepresentations.UTM32.code);
						spyOn(coordinateService, 'transform')
							.withArgs([21, 42], mapSrid, BvvCoordinateRepresentations.UTM32.code)
							.and.returnValue([11111.111111, 22222.222222]);

						const extract = instanceUnderTest._extractPosition([21, 42], zoomLevel);

						expect(extract[QueryParameters.ZOOM]).toBe(round(zoomLevel, ShareService.ZOOM_LEVEL_PRECISION));
						expect(extract[QueryParameters.CENTER]).toEqual(['11111', '22222']);
						expect(extract[QueryParameters.ROTATION]).toBe(0);
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
		});

		describe('_extractRoute', () => {
			it('extracts the current route', () => {
				setup();
				const mapSrid = 3857;
				spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
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
					spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
					const instanceUnderTest = new ShareService();
					addHighlightFeatures([
						{
							id: CROSSHAIR_HIGHLIGHT_FEATURE_ID,
							type: HighlightFeatureType.MARKER,
							data: { coordinate: [42, 21] }
						},
						{
							id: 'hf_id1',
							type: HighlightFeatureType.DEFAULT,
							data: { coordinate: [77, 55] }
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

		describe('_extractTool', () => {
			it('extracts the current tool ', () => {
				setup();
				const instanceUnderTest = new ShareService();
				
				expect(instanceUnderTest._extractTool()).toEqual({});
				
				setCurrentTool('someTool');

				expect(instanceUnderTest._extractTool()[QueryParameters.TOOL_ID]).toBe('someTool');
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
			const mockFrontendUrl = 'http://frontend.de/';

			it('encodes a state object to url', () => {
				setup();
				spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
				const instanceUnderTest = new ShareService();
				const expectedResult = 'encoded';
				spyOn(instanceUnderTest, 'encodeStateForPosition').withArgs({}, {}, []).and.returnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState();

				expect(encoded).toBe(expectedResult);
			});

			it('encodes a state object to url with extra params', () => {
				setup();
				spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
				const instanceUnderTest = new ShareService();
				const extraParam = { foo: 'bar' };
				const expectedResult = 'encoded';
				spyOn(instanceUnderTest, 'encodeStateForPosition').withArgs({}, extraParam, []).and.returnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState(extraParam);

				expect(encoded).toBe(expectedResult);
			});

			it('encodes a state object to url with path params', () => {
				setup();
				spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
				const instanceUnderTest = new ShareService();
				const pathParameters = ['param0', 'param1'];
				const expectedResult = 'encoded';
				spyOn(instanceUnderTest, 'encodeStateForPosition').withArgs({}, {}, pathParameters).and.returnValue(expectedResult);

				const encoded = instanceUnderTest.encodeState({}, pathParameters);

				expect(encoded).toBe(expectedResult);
			});
		});

		describe('encodeStateForPosition', () => {
			const mockFrontendUrl = 'http://frontend.de/';

			describe('for pathname "/"', () => {
				it('encodes a state object to url', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					spyOn(instanceUnderTest, '_extractLayers').and.returnValue({ l: ['someLayer', 'anotherLayer'] });
					spyOn(instanceUnderTest, '_extractTopic').and.returnValue({ t: 'someTopic' });
					spyOn(instanceUnderTest, '_extractRoute').and.returnValue({ rtwp: '1,2', rtc: 'rtCatId' });
					spyOn(instanceUnderTest, '_extractTool').and.returnValue({ tid: 'someTool' });
					spyOn(instanceUnderTest, '_extractCrosshair').and.returnValue({ crh: 'true' });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), {}).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBeTrue();
					expect(queryParams.size).toBe(9);
					expect(queryParams.get(QueryParameters.LAYER)).toBe('someLayer,anotherLayer');
					expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
					expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
					expect(queryParams.get(QueryParameters.ROTATION)).toBe('0.5');
					expect(queryParams.get(QueryParameters.TOPIC)).toBe('someTopic');
					expect(queryParams.get(QueryParameters.ROUTE_WAYPOINTS)).toBe('1,2');
					expect(queryParams.get(QueryParameters.ROUTE_CATEGORY)).toBe('rtCatId');
					expect(queryParams.get(QueryParameters.TOOL_ID)).toBe('someTool');
					expect(queryParams.get(QueryParameters.CROSSHAIR)).toBe('true');
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url removing `index.html` from path', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(`${mockFrontendUrl}index.html/`);
					const instanceUnderTest = new ShareService();
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), {}).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBeTrue();
					expect(queryParams.size).toBe(5);
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url merging extra parameter', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extraParam = { foo: 'bar' };
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), extraParam).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, extraParam);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/?')).toBeTrue();
					expect(queryParams.size).toBe(6);

					expect(queryParams.get('foo')).toBe('bar');
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url appending optional path parameters', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const pathParameters = ['param0', 'param1'];
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, {}, pathParameters);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/param0/param1?')).toBeTrue();
					expect(queryParams.size).toBe(5);
				});
			});

			describe('for existing pathname e.g. "/app"', () => {
				const mockFrontendUrl = 'http://frontend.de/app/';

				it('encodes a state object to url', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					spyOn(instanceUnderTest, '_extractLayers').and.returnValue({ l: ['someLayer', 'anotherLayer'] });
					spyOn(instanceUnderTest, '_extractTopic').and.returnValue({ t: 'someTopic' });
					spyOn(instanceUnderTest, '_extractTool').and.returnValue({ tid: 'someTool' });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), {}).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBeTrue();
					expect(queryParams.size).toBe(6);
					expect(queryParams.get(QueryParameters.LAYER)).toBe('someLayer,anotherLayer');
					expect(queryParams.get(QueryParameters.ZOOM)).toBe('5');
					expect(queryParams.get(QueryParameters.CENTER)).toBe('44.123,88.123');
					expect(queryParams.get(QueryParameters.ROTATION)).toBe('0.5');
					expect(queryParams.get(QueryParameters.TOPIC)).toBe('someTopic');
					expect(queryParams.get(QueryParameters.TOOL_ID)).toBe('someTool');
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url removing `index.html` from path', () => {
					setup();
					spyOn(configService, 'getValueAsPath').and.returnValue(`${mockFrontendUrl}index.html/`);
					const instanceUnderTest = new ShareService();
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), {}).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 });
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBeTrue();
					expect(queryParams.size).toBe(5);
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url merging extra parameter', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const extraParam = { foo: 'bar' };
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
					const _mergeExtraParamsSpy = spyOn(instanceUnderTest, '_mergeExtraParams').withArgs(jasmine.anything(), extraParam).and.callThrough();

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, extraParam);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/?')).toBeTrue();
					expect(queryParams.size).toBe(6);
					expect(queryParams.get('foo')).toBe('bar');
					expect(_mergeExtraParamsSpy).toHaveBeenCalled();
				});

				it('encodes a state object to url appending optional path parameters', () => {
					setup();
					spyOn(configService, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(mockFrontendUrl);
					const instanceUnderTest = new ShareService();
					const pathParameters = ['param0', 'param1'];
					spyOn(instanceUnderTest, '_extractPosition')
						.withArgs([44.123, 88.123], 5, 0.5)
						.and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });

					const encoded = instanceUnderTest.encodeStateForPosition({ zoom: 5, center: [44.123, 88.123], rotation: 0.5 }, {}, pathParameters);
					const queryParams = new URLSearchParams(new URL(encoded).search);

					expect(encoded.startsWith('http://frontend.de/app/param0/param1?')).toBeTrue();
					expect(queryParams.size).toBe(5);
				});
			});
		});
	});

	describe('getParameters', () => {
		it('returns all parameters of the current application that are required to restore it', () => {
			setup();
			const instanceUnderTest = new ShareService();
			spyOn(instanceUnderTest, '_extractPosition').and.returnValue({ c: [44.123, 88.123], z: 5, r: 0.5 });
			spyOn(instanceUnderTest, '_extractLayers')
				.withArgs({ includeHiddenGeoResources: false })
				.and.returnValue({ l: ['someLayer', 'anotherLayer'] });
			spyOn(instanceUnderTest, '_extractTopic').and.returnValue({ t: 'someTopic' });
			spyOn(instanceUnderTest, '_extractRoute').and.returnValue({ rtwp: '1,2', rtc: 'rtCatId' });
			spyOn(instanceUnderTest, '_extractTool').and.returnValue({ tid: 'someTool' });
			spyOn(instanceUnderTest, '_extractCrosshair').and.returnValue({ crh: 'true' });

			const params = instanceUnderTest.getParameters();

			expect(params).toHaveSize(9);
			expect(params.get(QueryParameters.LAYER)).toEqual(['someLayer', 'anotherLayer']);
			expect(params.get(QueryParameters.ZOOM)).toBe(5);
			expect(params.get(QueryParameters.CENTER)).toEqual([44.123, 88.123]);
			expect(params.get(QueryParameters.ROTATION)).toBe(0.5);
			expect(params.get(QueryParameters.TOPIC)).toBe('someTopic');
			expect(params.get(QueryParameters.ROUTE_WAYPOINTS)).toBe('1,2');
			expect(params.get(QueryParameters.ROUTE_CATEGORY)).toBe('rtCatId');
			expect(params.get(QueryParameters.TOOL_ID)).toBe('someTool');
			expect(params.get(QueryParameters.CROSSHAIR)).toBe('true');
		});
	});
});
