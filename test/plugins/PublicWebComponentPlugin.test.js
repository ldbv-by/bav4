import { QueryParameters } from '../../src/domain/queryParameters.js';
import { $injector } from '../../src/injection/index.js';
import { PublicWebComponentPlugin } from '../../src/plugins/PublicWebComponentPlugin';
import { removeAndSetLayers } from '../../src/store/layers/layers.action.js';
import { createDefaultLayerProperties, createDefaultLayersConstraints, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { changeCenter, changeRotation, changeZoom } from '../../src/store/position/position.action.js';
import { positionReducer } from '../../src/store/position/position.reducer.js';
import { addFeatureInfoItems, registerQuery, resolveQuery, startRequest } from '../../src/store/featureInfo/featureInfo.action.js';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer.js';
import { TestUtils } from '../test-utils.js';
import { BaGeometry } from '../../src/domain/geometry.js';
import { SourceType, SourceTypeName } from '../../src/domain/sourceType.js';
import { WcEvents } from '../../src/domain/wcEvents.js';

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
		transform: () => {}
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			position: positionReducer,
			layers: layersReducer,
			featureInfo: featureInfoReducer
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
					href: '?ec_geometry_srid=25832'
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

	describe('when observed s-o-s changes', () => {
		const runTest = async (store, payload, action, expectExecution = true, optionalMockWindow = {}, testInstanceCallback = () => {}) => {
			const postMessageSpy = jasmine.createSpy();
			const mockWindow = {
				parent: {
					postMessage: postMessageSpy,
					addEventListener: () => {}
				},
				...optionalMockWindow
			};
			const iframeId = 'iframeId';
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
			testInstanceCallback(instanceUnderTest);
			await instanceUnderTest.register(store);
			spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

			action();

			const expectedPayload = { target: iframeId, v: '1', ...payload };

			expectExecution ? expect(postMessageSpy).toHaveBeenCalledOnceWith(expectedPayload, '*') : expect(postMessageSpy).not.toHaveBeenCalled();
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
				const payload = {};
				payload[QueryParameters.LAYER] = [];

				runTest(store, payload, () => removeAndSetLayers([{ id: 'hidden', constraints: { hidden: true } }]), false);
			});
		});

		describe('and the App is NOT embedded as web component', () => {
			it('does nothing', async () => {
				const store = setup();
				spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(false);
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;

				runTest(store, payload, () => changeZoom(2), false);
			});
		});

		describe('`position.zoom`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup({
					position: {
						zoom: 1
					}
				});
				const payload = {};
				payload[QueryParameters.ZOOM] = 2;

				runTest(store, payload, () => changeZoom(2));
			});
		});

		describe('`position.center`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const mapSrid = 3857;
				const targetSrid = 4326;
				const coord = [11, 22];
				const transformedCoord = [88, 99];
				spyOn(coordinateService, 'transform').withArgs(coord, mapSrid, targetSrid).and.returnValue(transformedCoord);
				spyOn(mapService, 'getSrid').and.returnValue(3857);
				const store = setup();
				const payload = {};
				payload[QueryParameters.CENTER] = transformedCoord;
				const testInstanceCallback = (instanceUnderTest) => spyOn(instanceUnderTest, '_getSridFromConfiguration').and.returnValue(4326);

				runTest(store, payload, () => changeCenter(coord), true, {}, testInstanceCallback);
			});
		});

		describe('`position.rotation`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const rotation = 0.42;
				const store = setup();
				const payload = {};
				payload[QueryParameters.ROTATION] = rotation;

				runTest(store, payload, () => changeRotation(rotation));
			});
		});

		describe('`layers.active`', () => {
			it('broadcasts a new value via window: postMessage()', async () => {
				const store = setup({
					position: {
						zoom: 1
					}
				});
				const payload = {};
				payload[QueryParameters.LAYER] = ['foo', 'bar'];

				runTest(store, payload, () => removeAndSetLayers([{ id: 'foo' }, { id: 'bar' }, { id: 'hidden', constraints: { hidden: true } }]));
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
					const payload = {};
					payload[WcEvents.FEATURE_SELECT] = {
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

					await runTest(store, payload, action, true, {}, testInstanceCallback);
					expect(exportVectorDataServiceSpy).toHaveBeenCalledOnceWith(geoJson, SourceType.forEwkt(4326));
				});
			});

			describe('featureInfo properties are NOTavailable', () => {
				it('broadcasts a new value via window: postMessage()', async () => {
					const transformedData = 'trData';
					const exportVectorDataServiceSpy = spyOn(exportVectorDataService, 'forData').and.returnValue(transformedData);
					const coordinate = [21, 42];
					const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
					const queryId = 'queryId';
					const store = setup();
					const payload = {};
					payload[WcEvents.FEATURE_SELECT] = {
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

					await runTest(store, payload, action, true, {}, testInstanceCallback);
					expect(exportVectorDataServiceSpy).toHaveBeenCalledOnceWith(geoJson, SourceType.forEwkt(4326));
				});
			});
		});
	});

	describe('when message received', () => {
		const newMockWindow = () => {
			const eventListener = [];
			const mockWindow = {
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
			const runTest = async (store, payload) => {
				const mockWindow = newMockWindow();
				const iframeId = 'iframeId';
				const instanceUnderTest = new PublicWebComponentPlugin();
				await instanceUnderTest.register(store);
				spyOn(instanceUnderTest, '_getIframeId').and.returnValue(iframeId);

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

			describe('`layers.active`', () => {
				it('updates the correct s-o-s property', async () => {
					const store = setup();
					const payload = {};
					payload[QueryParameters.LAYER] = ['foo', 'bar'].join();

					await runTest(store, payload);

					expect(store.getState().layers.active.map((l) => l.id)).toEqual(['foo', 'bar']);
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
