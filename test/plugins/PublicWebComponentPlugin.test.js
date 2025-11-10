import { QueryParameters } from '../../src/domain/queryParameters.js';
import { $injector } from '../../src/injection/index.js';
import { PublicWebComponentPlugin } from '../../src/plugins/PublicWebComponentPlugin';
import { removeAndSetLayers } from '../../src/store/layers/layers.action.js';
import { createDefaultLayerProperties, createDefaultLayersConstraints, layersReducer } from '../../src/store/layers/layers.reducer.js';
import { changeZoom } from '../../src/store/position/position.action.js';
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

	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const setup = (initialState = {}) => {
		const store = TestUtils.setupStoreAndDi(initialState, {
			position: positionReducer,
			layers: layersReducer,
			featureInfo: featureInfoReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentService).registerSingleton('MapService', mapServiceMock);

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

	describe('when observed s-o-s changes', () => {
		const runTest = async (store, payload, action, expectExecution = true) => {
			const postMessageSpy = jasmine.createSpy();
			const mockWindow = {
				parent: {
					postMessage: postMessageSpy,
					addEventListener: () => {}
				}
			};
			const iframeId = 'iframeId';
			spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);
			const instanceUnderTest = new PublicWebComponentPlugin();
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
			it('broadcasts a new value via window: postMessage()', async () => {
				const coordinate = [21, 42];
				const geoJson = '{"type":"Point","coordinates":[1224514.3987260093,6106854.83488507]}';
				const queryId = 'queryId';
				const store = setup();
				const payload = {};
				payload[WcEvents.FEATURE_SELECT] = { items: [{ label: 'title1', geometry: geoJson, type: SourceTypeName.GEOJSON, srid: 3857 }], coordinate };
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

				runTest(store, payload, action);
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
