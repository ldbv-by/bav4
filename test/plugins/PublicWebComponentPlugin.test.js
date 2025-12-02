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
import { WcEvents } from '../../src/domain/wcEvents.js';
import { fileStorageReducer } from '../../src/store/fileStorage/fileStorage.reducer.js';

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
		getSrid: () => {}
	};
	const coordinateService = {
		transform: (c) => c
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			position: positionReducer,
			layers: layersReducer,
			featureInfo: featureInfoReducer,
			fileStorage: fileStorageReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('ExportVectorDataService', exportVectorDataService)
			.registerSingleton('MapService', mapService)
			.registerSingleton('CoordinateService', coordinateService);

		return store;
	};

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
					postMessage: postMessageSpy,
					addEventListener: () => {}
				}
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

			expect(postMessageSpy).toHaveBeenCalledTimes(4);
			expect(postMessageSpy.calls.all()[0].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.CENTER, initialStatePosition.center, true));
			expect(postMessageSpy.calls.all()[1].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.ZOOM, initialStatePosition.zoom, true));
			expect(postMessageSpy.calls.all()[2].args[0]).toEqual(
				getExpectedPostMessagePayload(QueryParameters.ROTATION, initialStatePosition.rotation, true)
			);
			expect(postMessageSpy.calls.all()[3].args[0]).toEqual(getExpectedPostMessagePayload(QueryParameters.LAYER, '', true));
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
					postMessage: postMessageSpy,
					addEventListener: () => {}
				},
				...optionalMockWindow
			};
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			await instanceUnderTest.register(store);
			spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);
			testInstanceCallback(instanceUnderTest);
			/** we ignore all previous calls of the spy due to the initialization of our plugin */
			postMessageSpy.calls.reset();

			action();

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
				const testInstanceCallback = (instanceUnderTest) => {
					spyOn(coordinateService, 'transform').withArgs(coord, mapSrid, targetSrid).and.returnValue(transformedCoord);
					spyOn(mapService, 'getSrid').and.returnValue(3857);
					spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
				};

				runTestForPostMessage(
					store,
					getExpectedPostMessagePayload(QueryParameters.CENTER, transformedCoord),
					() => changeCenter(coord),
					true,
					{},
					testInstanceCallback
				);
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
				const store = setup({
					position: {
						zoom: 1
					}
				});

				runTestForPostMessage(store, getExpectedPostMessagePayload(QueryParameters.LAYER, 'foo,bar'), () =>
					removeAndSetLayers([{ id: 'foo' }, { id: 'bar' }, { id: 'hidden', constraints: { hidden: true } }])
				);
			});
		});

		describe('`layers.ready`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup({
					position: {
						zoom: 1
					}
				});

				runTestForPostMessage(store, getExpectedPostMessagePayload(WcEvents.LOAD, true), () => setReady());
			});
		});

		describe('`featureInfo.coordinate`', () => {
			describe('featureInfo properties are available', () => {
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const coordinate = [21, 42];
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const queryId = 'queryId';
					const store = setup();
					const payloadValue = {
						features: [{ label: 'title1', geometry: { data: transformedData, type: SourceTypeName.EWKT, srid: 4326 }, properties: { key: 'value' } }],
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
								geometry: new BaGeometry(geoJson, SourceType.forGeoJSON(3857)),
								properties: { key: 'value' }
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
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const store = setup();
					const payloadValue = { data: transformedData, type: SourceTypeName.EWKT, srid: 4326 };
					const action = () => {
						setData(geoJson);
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
					postMessage: (payload) => eventListener.forEach((fn) => fn({ data: payload })),
					addEventListener: (eventName, fn) => {
						if (eventName === 'message') {
							eventListener.push(fn);
						}
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

			describe('`position.zoom`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload[QueryParameters.ZOOM] = 2;

					await runTest(store, payload);

					expect(store.getState().position.zoom).toBe(2);
				});
			});

			describe('`addLayer`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload['addLayer'] = { id: 'layerId', options: { geoResourceId: 'geoResourceId' } };

					await runTest(store, payload);

					expect(store.getState().layers.active.map((l) => l.id)).toEqual(['layerId']);
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
					payload['modifyLayer'] = { id: 'layerId', options: { visible: false } };

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
					payload['removeLayer'] = { id: 'layerId' };

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
						payload['modifyView'] = {};

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
						const targetSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						};
						const payload = {};
						payload['modifyView'] = { zoom: 3, center: coord, rotation: 0.42 };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.zoom).toBe(3);
						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(store.getState().position.rotation).toBe(0.42);
						expect(transformSpy).toHaveBeenCalledWith(coord, mapSrid, targetSrid);
					});
				});
				describe('zoom and center parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const coord = [11, 22];
						const transformedCoord = [88, 99];
						const mapSrid = 3857;
						const targetSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						};
						const payload = {};
						payload['modifyView'] = { zoom: 3, center: coord };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.zoom).toBe(3);
						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(transformSpy).toHaveBeenCalledWith(coord, mapSrid, targetSrid);
					});
				});
				describe('zoom and rotation parameters available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload['modifyView'] = { zoom: 3, rotation: 0.42 };

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
						const targetSrid = 4326;
						const transformSpy = spyOn(coordinateService, 'transform').and.returnValue(transformedCoord);
						spyOn(mapService, 'getSrid').and.returnValue(3857);
						const testInstanceCallback = (instanceUnderTest) => {
							spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);
						};
						const payload = {};
						payload['modifyView'] = { center: [11, 22], rotation: 0.42 };

						await runTest(store, payload, testInstanceCallback);

						expect(store.getState().position.center).toEqual(transformedCoord);
						expect(store.getState().position.rotation).toBe(0.42);
						expect(transformSpy).toHaveBeenCalledWith(coord, mapSrid, targetSrid);
					});
				});
				describe('zoom parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload['modifyView'] = { zoom: 3 };

						await runTest(store, payload);

						expect(store.getState().position.zoom).toBe(3);
					});
				});
				describe('center parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload['modifyView'] = { center: [11, 22] };

						await runTest(store, payload);

						expect(store.getState().position.center).toEqual([11, 22]);
					});
				});
				describe('rotation parameter available', () => {
					it('updates the correct s-o-s property', async () => {
						const store = setup();
						const payload = {};
						payload['modifyView'] = { rotation: 0.42 };

						await runTest(store, payload);

						expect(store.getState().position.rotation).toBe(0.42);
					});
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
