import { QueryParameters } from '../../src/domain/queryParameters.js';
import { $injector } from '../../src/injection/index.js';
import { PublicWebComponentPlugin } from '../../src/plugins/PublicWebComponentPlugin';
import { removeAndSetLayers, setReady } from '../../src/store/layers/layers.action.js';
import { createDefaultLayerProperties, createDefaultLayersConstraints, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { changeCenter, changeRotation, changeZoom } from '../../src/store/position/position.action.js';
import { setData } from '../../src/store/fileStorage/fileStorage.action.js';
import { initialState as initialStatePosition, positionReducer } from '../../src/store/position/position.reducer.js';
import { addFeatureInfoItems, registerQuery, resolveQuery, startRequest } from '../../src/store/featureInfo/featureInfo.action.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer.js';
import { TestUtils } from '../test-utils.js';
import { BaGeometry } from '../../src/domain/geometry.js';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType.js';
import { WcEvents, WcMessageKeys } from '../../src/domain/webComponent.js';
import { fileStorageReducer } from '../../src/store/fileStorage/fileStorage.reducer.js';
import { VectorGeoResource, VectorSourceType } from '../../src/domain/geoResources.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer.js';
import { HighlightFeatureType } from '../../src/domain/highlightFeature.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';

describe('PublicWebComponentPlugin', () => {
	const environmentService = {
		isEmbeddedAsWC: () => true,
		getWindow: () => window
	};
	const exportVectorDataService = {
		forData: () => {}
	};
	const mapService = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {},
		getSrid: () => {},
		getLocalProjectedSrid: () => {}
	};
	const coordinateService = {
		transform: (c) => c,
		transformExtent: (e) => e
	};
	const importVectorDataService = {
		forData: () => null
	};
	const fileStorageService = {
		getFileId: async () => null
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			position: positionReducer,
			layers: layersReducer,
			featureInfo: featureInfoReducer,
			fileStorage: fileStorageReducer,
			highlight: highlightReducer,
			tools: toolsReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ExportVectorDataService', exportVectorDataService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('CoordinateService', coordinateService)
			.registerSingleton('ImportVectorDataService', importVectorDataService)
			.registerSingleton('FileStorageService', fileStorageService);

		return store;
	};

	describe('static getter', () => {
		it('defines constant values', async () => {
			expect(PublicWebComponentPlugin.ON_LOAD_EVENT_DELAY_MS).toBe(500);
			expect(PublicWebComponentPlugin.GEOMETRY_CHANGE_EVENT_DEBOUNCE_DELAY_MS).toBe(100);
		});
	});

	describe('_getIframeId', () => {
		it('returns the name property of the window', async () => {
			setup();
			const mockWindow = {
				name: 'windowName42'
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._getIframeId()).toBe('windowName42');
		});
	});

	describe('_getSridFromConfiguration', () => {
		it('returns 4326 as default value', async () => {
			setup();
			const mockWindow = {
				location: {
					href: ''
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._getSridFromConfiguration()).toBe(4326);
		});

		it('parses the SRID from the location href of the iframe', async () => {
			setup();
			const mockWindow = {
				location: {
					href: '?ec_srid=25832'
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._getSridFromConfiguration()).toBe(25832);
		});
	});

	describe('_getGeomTypeFromConfiguration', () => {
		it('returns EWKT as default value', async () => {
			setup();
			const mockWindow = {
				location: {
					href: ''
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._getGeomTypeFromConfiguration()).toBe(SourceTypeName.EWKT);
		});

		it('parses the geometry format from the location href of the iframe', async () => {
			setup();
			const mockWindow = {
				location: {
					href: '?ec_geometry_format=geojson'
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._getGeomTypeFromConfiguration()).toBe(SourceTypeName.GEOJSON);
		});
	});

	describe('_getSridFromCenterCoordinate', () => {
		it('calls _detectSrid with the current center coordinate', async () => {
			setup();
			const mockWindow = {
				location: {
					href: '?c=11,48'
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			const detectSridSpy = spyOn(instanceUnderTest, '_detectSrid');

			instanceUnderTest._getSridFromCenterCoordinate();

			expect(detectSridSpy).toHaveBeenCalledWith([11, 48]);
		});
	});

	describe('_detectSrid', () => {
		it('returns 4326 as default value', async () => {
			setup();
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._detectSrid('not_a_coordinate')).toBe(4326);
		});
		it('detects 4326 from the center parameter', async () => {
			setup();
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._detectSrid([11, 48])).toBe(4326);
		});
		it('detects a projected SRID from the center parameter', async () => {
			setup();
			spyOn(mapService, 'getLocalProjectedSrid').and.returnValue(5555);
			const instanceUnderTest = new PublicWebComponentPlugin();

			expect(instanceUnderTest._detectSrid([719298, 5392632])).toBe(5555);
		});
	});

	const iframeId = 'iframeId';
	const getExpectedPostMessagePayload = (key, value, silent = false) => {
		const p = {};
		p[key] = value;
		return { target: iframeId, v: '1', ...p, silent };
	};

	describe('when initialized', () => {
		const runTestForPostMessage = async (store) => {
			const postMessageSpy = jasmine.createSpy();
			const mockWindow = {
				location: {
					href: ''
				},
				parent: {
					postMessage: postMessageSpy
				},
				addEventListener: () => {}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);
			await instanceUnderTest.register(store);
			return postMessageSpy;
		};
		it('broadcast all relevant values', async () => {
			spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);

			const store = setup();

			const postMessageSpy = await runTestForPostMessage(store);

			expect(postMessageSpy).toHaveBeenCalledTimes(6);
			expect(postMessageSpy.calls.all()[0].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.CENTER, initialStatePosition.center, true));
			expect(postMessageSpy.calls.all()[1].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.ZOOM, initialStatePosition.zoom, true));
			expect(postMessageSpy.calls.all()[2].args[0]).toEqual(
				getExpectedPostMessagePayload(QueryParameters.ROTATION, initialStatePosition.rotation, true)
			);
			expect(postMessageSpy.calls.all()[3].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.LAYER, [], true));
			expect(postMessageSpy.calls.all()[4].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.LAYER_VISIBILITY, [], true));
			expect(postMessageSpy.calls.all()[5].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.LAYER_OPACITY, [], true));
		});
	});

	describe('when observed s-o-s changes', () => {
		const runTestForPostMessage = async (
			store,
			expectedPayload,
			action,
			expectExecution = true,
			optionalMockWindow = {},
			testInstanceCallback = () => {}
		) => {
			const postMessageSpy = jasmine.createSpy();
			const mockWindow = {
				location: {
					href: ''
				},
				parent: {
					postMessage: postMessageSpy
				},
				addEventListener: () => {},
				...optionalMockWindow
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			await instanceUnderTest.register(store);
			spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);
			testInstanceCallback(instanceUnderTest);
			/** we ignore all previous calls of the spy due to the initialization of our plugin */
			postMessageSpy.calls.reset();

			await action();

			expectExecution ? expect(postMessageSpy).toHaveBeenCalledWith(expectedPayload, '*') : expect(postMessageSpy).not.toHaveBeenCalled();
		};
		describe('the computed values does not change', () => {
			it('does nothing', async () => {
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
				const layer = {
					...createDefaultLayerProperties(),
					id: 'hidden',
					constraints: {
						...createDefaultLayersConstraints(),
						hidden: true
					}
				};
				const store = setup({
					layers: {
						active: [layer]
					}
				});

				runTestForPostMessage(
					store,
					getExpectedPostMessagePayload(QueryParameters.LAYER, ''),
					() => removeAndSetLayers([{ id: 'hidden', constraints: { hidden: true } }]),
					false
				);
			});
		});

		describe('and the App is NOT embedded as web component', () => {
			it('does nothing', async () => {
				const store = setup();
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(false);

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.ZOOM, 2), () => changeZoom(2), false);
			});
		});

		describe('`position.zoom`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup({
					position: {
						zoom: 1
					}
				});

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.ZOOM, 2), () => changeZoom(2));
			});
		});

		describe('`position.center`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const mapSrid = 3857;
				const targetSrid = 4326;
				const coord = [11, 22];
				const transformedCoord = [88, 99];
				const store = setup();
				let getSridFromCenterCoordinateSpy;
				const testInstanceCallback = (instanceUnderTest) => {
					getSridFromCenterCoordinateSpy = spyOn(instanceUnderTest, '_getSridFromCenterCoordinate').and.callThrough();
					spyOn(coordinateService, 'transform').withArgs(coord, mapSrid, targetSrid).and.returnValue(transformedCoord);
					spyOn(mapService, 'getSrid').and.returnValue(3857);
				};

				await runTestForPostMessage(
					store,
					getExpectedPostMessagePayload(QueryParameters.CENTER, transformedCoord),
					() => changeCenter(coord),
					true,
					{},
					testInstanceCallback
				);
				expect(getSridFromCenterCoordinateSpy).toHaveBeenCalled();
			});
		});

		describe('`position.rotation`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const rotation = 0.42;
				const store = setup();

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.ROTATION, rotation), () => changeRotation(rotation));
			});
		});

		describe('`layers.active`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup();

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.LAYER, ['foo', 'bar']), () =>
					removeAndSetLayers([{ id: 'foo' }, { id: 'bar' }, { id: 'hidden', constraints: { hidden: true } }])
				);
			});
		});

		describe('`layers.active.visible`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup();

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.LAYER_VISIBILITY, [false, true]), () =>
					removeAndSetLayers([{ id: 'foo', visible: false }, { id: 'bar' }, { id: 'hidden', constraints: { hidden: true } }])
				);
			});
		});

		describe('`layers.active.opacity`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup();

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.LAYER_OPACITY, [0.5, 1]), () =>
					removeAndSetLayers([{ id: 'foo', opacity: 0.5 }, { id: 'bar' }, { id: 'hidden', constraints: { hidden: true } }])
				);
			});
		});

		describe('`layers.ready`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup();

				await runTestForPostMessage(store, getExpectedPostMessagePayload(WcEvents.LOAD, true), async () => {
					setReady();
					await TestUtils.timeout(PublicWebComponentPlugin.ON_LOAD_EVENT_DELAY_MS + 100);
				});
			});
		});

		describe('`featureInfo.coordinate`', () => {
			describe('featureInfo properties are available', () => {
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					let transformSpy;
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const coordinate = [21, 42];
					const transformedCoord = [88, 99];
					const mapSrid = 3857;
					const targetSrid = 4326;
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const queryId = 'queryId';
					const store = setup();
					const payloadValue = {
						features: [{ label: 'title1', geometry: { data: transformedData, type: SourceTypeName.EWKT, srid: 4326 }, properties: { key: 'value' } }],
						coordinate: transformedCoord
					};
					const action = () => {
						startRequest(coordinate);
						registerQuery(queryId);
						// add results
						addFeatureInfoItems([
							{ title: 'title0', content: 'content0' },
							{
								title: 'title1',
								content: 'content1',
								geometry: new BaGeometry(geoJson, SourceType.forGeoJSON(3857)),
								properties: { key: 'value' }
							}
						]);
						resolveQuery(queryId);
					};
					const testInstanceCallback = (instanceUnderTest) => {
						spyOn(mapService, 'getSrid').and.returnValue(mapSrid);
						spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						spyOn(instanceUnderTest, '_getGeomTypeFromConfiguration').and.returnValue(SourceTypeName.EWKT);
						transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
					};

					await runTestForPostMessage(
						store,
						getExpectedPostMessagePayload(WcEvents.FEATURE_SELECT, payloadValue),
						action,
						true,
						{},
						testInstanceCallback
					);
					expect(exportVectorDataServiceSpy).toHaveBeenCalledOnceWith(geoJson, SourceType.forEwkt(4326));
					expect(transformSpy).toHaveBeenCalledOnceWith(coordinate, mapSrid, targetSrid);
				});
			});

			describe('featureInfo properties are NOT available', () => {
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const coordinate = [21, 42];
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const queryId = 'queryId';
					const store = setup();
					const payloadValue = {
						features: [{ label: 'title1', geometry: { data: transformedData, type: SourceTypeName.EWKT, srid: 4326 }, properties: {} }],
						coordinate
					};
					const action = () => {
						startRequest(coordinate);
						registerQuery(queryId);
						// add results
						addFeatureInfoItems([
							{ title: 'title0', content: 'content0' },
							{
								title: 'title1',
								content: 'content1',
								geometry: new BaGeometry(geoJson, SourceType.forGeoJSON(3857))
							}
						]);
						resolveQuery(queryId);
					};
					const testInstanceCallback = (instanceUnderTest) => {
						spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						spyOn(instanceUnderTest, '_getGeomTypeFromConfiguration').and.returnValue(SourceTypeName.EWKT);
					};

					await runTestForPostMessage(
						store,
						getExpectedPostMessagePayload(WcEvents.FEATURE_SELECT, payloadValue),
						action,
						true,
						{},
						testInstanceCallback
					);
					expect(exportVectorDataServiceSpy).toHaveBeenCalledOnceWith(geoJson, SourceType.forEwkt(4326));
				});
			});
		});

		describe('`fileStorage.data`', () => {
			describe('data property is available', () => {
				beforeEach(() => {
					jasmine.clock().install();
				});

				afterEach(() => {
					jasmine.clock().uninstall();
				});
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const store = setup();
					const payloadValue = { data: transformedData, type: SourceTypeName.EWKT, srid: 4326 };
					const action = () => {
						setData(geoJson);
						jasmine.clock().tick(PublicWebComponentPlugin.GEOMETRY_CHANGE_EVENT_DEBOUNCE_DELAY_MS + 100);
					};
					const testInstanceCallback = (instanceUnderTest) => {
						spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						spyOn(instanceUnderTest, '_getGeomTypeFromConfiguration').and.returnValue(SourceTypeName.EWKT);
					};

					await runTestForPostMessage(
						store,
						getExpectedPostMessagePayload(WcEvents.GEOMETRY_CHANGE, payloadValue),
						action,
						true,
						{},
						testInstanceCallback
					);
					expect(exportVectorDataServiceSpy).toHaveBeenCalledOnceWith(geoJson, SourceType.forEwkt(4326));
				});
			});
		});
	});

	describe('when message received', () => {
		const newMockWindow = () => {
			const eventListener = [];
			const mockWindow = {
				location: {
					href: ''
				},
				parent: {
					postMessage: (payload) => eventListener.forEach((fn) => fn({ data: payload }))
				},
				addEventListener: (eventName, fn) => {
					if (eventName === 'message') {
						eventListener.push(fn);
					}
				}
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			return mockWindow;
		};

		describe('and source matches', () => {
			const runTest = async (store, payload, testInstanceCallback = () => {}) => {
				const mockWindow = newMockWindow();
				const instanceUnderTest = new PublicWebComponentPlugin();
				await instanceUnderTest.register(store);
				spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);
				testInstanceCallback(instanceUnderTest);

				mockWindow.parent.postMessage({ source: iframeId, v: '1', ...payload }, '*');

				await TestUtils.timeout();
			};

			describe('`addLayer`', () => {
				describe('for a internal or external GeoResource', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const style = { baseColor: '#fcba03' };
						const payload = {};
						payload[WcMessageKeys.ADD_LAYER] = { id: 'layerId', geoResourceIdOrData: 'geoResourceId', options: { style } };

						await runTest(store, payload);

						expect(store.getState().layers.active.map((l) => l.id)).toEqual(['layerId']);
						expect(store.getState().layers.active.map((l) => l.geoResourceId)).toEqual(['geoResourceId']);
						expect(store.getState().layers.active.map((l) => l.constraints.displayFeatureLabels)).toEqual([null]);
						expect(store.getState().layers.active.map((l) => l.style)).toEqual([style]);
						await TestUtils.timeout();
						expect(store.getState().position.fitLayerRequest.payload).toBeNull();
					});
				});
				describe('for local vector data', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const data = 'mydata';
						const style = { baseColor: '#fcba03' };
						const vgr = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.KML);
						spyOn(importVectorDataService, 'forData').withArgs(data, { id: 'layerId' }).and.returnValue(vgr);
						const payload = {};
						payload[WcMessageKeys.ADD_LAYER] = {
							id: 'layerId',
							geoResourceIdOrData: data,
							options: { displayFeatureLabels: true, style, zoomToExtent: true }
						};

						await runTest(store, payload);

						expect(store.getState().layers.active.map((l) => l.id)).toEqual(['layerId']);
						expect(store.getState().layers.active.map((l) => l.constraints.displayFeatureLabels)).toEqual([true]);
						expect(store.getState().layers.active.map((l) => l.style)).toEqual([style]);
						await TestUtils.timeout();
						expect(store.getState().position.fitLayerRequest.payload.id).toBe('layerId');
					});
				});

				describe('for modifiable local vector data', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const data = 'mydata';
						const style = { baseColor: '#fcba03' };
						const vgr = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.KML);
						const layerId = 'layerId';
						const adminId = 'a_layerId';
						const fileId = 'f_layerId';
						spyOn(importVectorDataService, 'forData').withArgs(data, { id: adminId }).and.returnValue(vgr);
						spyOn(fileStorageService, 'getFileId').and.resolveTo(fileId);
						const payload = {};
						payload[WcMessageKeys.ADD_LAYER] = {
							id: layerId,
							geoResourceIdOrData: data,
							options: { displayFeatureLabels: true, style, zoomToExtent: true, modifiable: true }
						};

						await runTest(store, payload);

						expect(store.getState().layers.active.map((l) => l.id)).toEqual([layerId]);
						expect(store.getState().layers.active.map((l) => l.constraints.displayFeatureLabels)).toEqual([true]);
						expect(store.getState().layers.active.map((l) => l.style)).toEqual([style]);
						await TestUtils.timeout();
						expect(store.getState().position.fitLayerRequest.payload.id).toBe(layerId);
						expect(store.getState().fileStorage.adminId).toBe(adminId);
						expect(store.getState().fileStorage.fileId).toBe(fileId);
					});
				});
			});

			describe('`modifyLayer`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						layers: {
							active: [{ id: 'layerId', ...createDefaultLayerProperties() }]
						}
					});
					const payload = {};
					payload[WcMessageKeys.MODIFY_LAYER] = { id: 'layerId', options: { visible: false } };

					await runTest(store, payload);

					expect(store.getState().layers.active.find((l) => (l.id = 'layerId')).visible).toBeFalse();
				});
			});

			describe('`removeLayer`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						layers: {
							active: [{ id: 'layerId', ...createDefaultLayerProperties() }]
						}
					});
					const payload = {};
					payload[WcMessageKeys.REMOVE_LAYER] = { id: 'layerId' };

					await runTest(store, payload);

					expect(store.getState().layers.active).toHaveSize(0);
				});
			});

			describe('`modifyView`', () => {
				describe('no view parameters available', () => {
					it('does nothing', async () => {
						const store = setup({
							position: {
								zoom: 1,
								center: [2, 3],
								rotation: 0
							}
						});
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = {};

						await runTest(store, payload);

						expect(store.getState().position.zoom).toBe(1);
						expect(store.getState().position.center).toEqual([2, 3]);
						expect(store.getState().position.rotation).toBe(0);
					});
				});
				describe('zoom,center and rotation parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const coord = [11, 22];
						const transformedCoord = [88, 99];
						const mapSrid = 3857;
						const sourceSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						let detectSridSpy;
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
							detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coord).and.returnValue(4326);
						};
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { zoom: 3, center: coord, rotation: 0.42 };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.zoom).toBe(3);
						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(store.getState().position.rotation).toBe(0.42);
						expect(transformSpy).toHaveBeenCalledWith(coord, sourceSrid, mapSrid);
						expect(detectSridSpy).toHaveBeenCalled();
					});
				});
				describe('zoom and center parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const coord = [11, 22];
						const transformedCoord = [88, 99];
						const mapSrid = 3857;
						const sourceSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						let detectSridSpy;
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
							detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coord).and.returnValue(4326);
						};
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { zoom: 3, center: coord };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.zoom).toBe(3);
						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(transformSpy).toHaveBeenCalledWith(coord, sourceSrid, mapSrid);
						expect(detectSridSpy).toHaveBeenCalled();
					});
				});
				describe('zoom and rotation parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { zoom: 3, rotation: 0.42 };

						await runTest(store, payload);

						expect(store.getState().position.zoom).toBe(3);
						expect(store.getState().position.rotation).toBe(0.42);
					});
				});
				describe('center and rotation parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const coord = [11, 22];
						const transformedCoord = [88, 99];
						const mapSrid = 3857;
						const sourceSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						let detectSridSpy;
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
							detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coord).and.returnValue(4326);
						};
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { center: [11, 22], rotation: 0.42 };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(store.getState().position.rotation).toBe(0.42);
						expect(transformSpy).toHaveBeenCalledWith(coord, sourceSrid, mapSrid);
						expect(detectSridSpy).toHaveBeenCalled();
					});
				});
				describe('zoom parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { zoom: 3 };

						await runTest(store, payload);

						expect(store.getState().position.zoom).toBe(3);
					});
				});
				describe('center parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const coord = [11, 22];
						const transformedCoord = [88, 99];
						const mapSrid = 3857;
						const sourceSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						let detectSridSpy;
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
							detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coord).and.returnValue(4326);
						};
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { center: [11, 22] };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(transformSpy).toHaveBeenCalledWith(coord, sourceSrid, mapSrid);
						expect(detectSridSpy).toHaveBeenCalled();
					});
				});
				describe('rotation parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload[WcMessageKeys.MODIFY_VIEW] = { rotation: 0.42 };

						await runTest(store, payload);

						expect(store.getState().position.rotation).toBe(0.42);
					});
				});
			});

			describe('`zoomToExtent`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload[WcMessageKeys.ZOOM_TO_EXTENT] = { extent: [0, 1, 2, 3] };
					const coordinateServiceSpy = spyOn(coordinateService, 'transformExtent').and.callThrough();
					let detectSridSpy;
					spyOn(mapService, 'getSrid').and.returnValue(3857);
					await runTest(store, payload, (instanceUnderTest) => {
						detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs([0, 1]).and.returnValue(4326);
					});

					expect(store.getState().position.fitRequest.payload.extent).toEqual([0, 1, 2, 3]);
					expect(coordinateServiceSpy).toHaveBeenCalledOnceWith([0, 1, 2, 3], 4326, 3857);
					expect(detectSridSpy).toHaveBeenCalled();
				});
			});

			describe('`zoomToLayerExtent`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload[WcMessageKeys.ZOOM_TO_LAYER_EXTENT] = { id: 'layerId' };

					await runTest(store, payload);

					expect(store.getState().position.fitLayerRequest.payload.id).toBe('layerId');
				});
			});

			describe('`addMarker`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					const coordinate = [22, 11];
					payload[WcMessageKeys.ADD_MARKER] = { coordinate, options: { id: 'markerId', label: 'label' } };
					const coordinateServiceSpy = spyOn(coordinateService, 'transform').and.callThrough();
					let detectSridSpy;
					spyOn(mapService, 'getSrid').and.returnValue(3857);

					await runTest(store, payload, (instanceUnderTest) => {
						spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
						detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coordinate).and.returnValue(4326);
					});

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].data).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER);
					expect(store.getState().highlight.features[0].id).toBe('markerId');
					expect(store.getState().highlight.features[0].category).toBe('WcUserMarker');
					expect(store.getState().highlight.features[0].label).toBe('label');
					expect(coordinateServiceSpy).toHaveBeenCalledWith(coordinate, 4326, 3857);
					expect(detectSridSpy).toHaveBeenCalled();
				});

				it('updates the correct s-o-s property with default values', async () => {
					const store = setup();
					const payload = {};
					const coordinate = [22, 11];
					payload[WcMessageKeys.ADD_MARKER] = { coordinate, options: { id: 'markerId' } };
					const coordinateServiceSpy = spyOn(coordinateService, 'transform').and.callThrough();
					let detectSridSpy;
					spyOn(mapService, 'getSrid').and.returnValue(3857);

					await runTest(store, payload, (instanceUnderTest) => {
						spyOn(instanceUnderTest, '_getSridFromCenterCoordinate');
						detectSridSpy = spyOn(instanceUnderTest, '_detectSrid').withArgs(coordinate).and.returnValue(4326);
					});

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].label).toBeNull();
					expect(store.getState().highlight.features[0].data).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER);
					expect(store.getState().highlight.features[0].id).toBe('markerId');
					expect(store.getState().highlight.features[0].category).toBe('WcUserMarker');
					expect(coordinateServiceSpy).toHaveBeenCalledWith(coordinate, 4326, 3857);
					expect(detectSridSpy).toHaveBeenCalled();
				});
			});

			describe('`removeMarker`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						highlight: {
							features: [{ id: 'markerId', data: [21, 41] }]
						}
					});
					const payload = {};
					payload[WcMessageKeys.REMOVE_MARKER] = { id: 'markerId' };

					await runTest(store, payload);

					expect(store.getState().highlight.features).toHaveSize(0);
				});
			});

			describe('`clearMarkers`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						highlight: {
							features: [
								{ id: 'markerId0', data: [21, 41], category: 'WcUserMarker' },
								{ id: 'markerId1', data: [21, 41], category: 'WcUserMarker' }
							]
						}
					});
					const payload = {};
					payload[WcMessageKeys.CLEAR_MARKERS] = {};

					await runTest(store, payload);

					expect(store.getState().highlight.features).toHaveSize(0);
				});
			});

			describe('`clearHighlights`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						featureInfo: {
							querying: true
						}
					});
					const payload = {};
					payload[WcMessageKeys.CLEAR_HIGHLIGHTS] = {};

					await runTest(store, payload);

					expect(store.getState().featureInfo.querying).toBeFalse();
				});
			});
			describe('`closeTool`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup({
						tools: {
							current: 'foo'
						}
					});
					const payload = {};
					payload[WcMessageKeys.CLOSE_TOOL] = {};

					await runTest(store, payload);

					expect(store.getState().tools.current).toBeNull();
				});
			});
		});

		describe('and version does NOT match', () => {
			it('logs an error', async () => {
				const mockWindow = newMockWindow();
				const store = setup();
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;
				const errorSpy = spyOn(console, 'error');
				const iframeId = 'iframeId';
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
				const instanceUnderTest = new PublicWebComponentPlugin();
				await instanceUnderTest.register(store);
				spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

				mockWindow.parent.postMessage({ source: iframeId, v: '2', ...payload }, '*');

				await TestUtils.timeout();

				expect(store.getState().position.zoom).not.toBe(2);
				expect(errorSpy).toHaveBeenCalledWith('Version 2 is not supported');
			});
		});
	});
});
