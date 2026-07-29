import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { toolsReducer } from '@src/store/tools/tools.reducer.js';
import { layersReducer } from '@src/store/layers/layers.reducer.js';
import { BeforeUnloadPlugin } from '@src/plugins/BeforeUnloadPlugin.js';
import { setCurrentTool } from '@src/store/tools/tools.action.js';
import { Tools } from '@src/domain/tools.js';
import { addLayer } from '@src/store/layers/layers.action.js';
import { VectorGeoResource, VectorSourceType, WmsGeoResource } from '@src/domain/geoResources.js';

describe('BeforeUnloadPlugin', () => {
	const environmentServiceMock = {
		isEmbedded: () => false
	};
	const geoResourceServiceMock = {
		resolve: () => [],
		byId: () => null
	};

	const setup = (state = {}) => {
		const store = TestUtils.setupStoreAndDi(state, {
			tools: toolsReducer,
			layers: layersReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentServiceMock).registerSingleton('GeoResourceService', geoResourceServiceMock);

		return store;
	};

	describe('_getTools', () => {
		it('returns a list of relevant tool ids', async () => {
			const store = setup();
			const instanceUnderTest = new BeforeUnloadPlugin();
			await instanceUnderTest.register(store);

			expect(instanceUnderTest._getTools()).toEqual([Tools.DRAW, Tools.MEASURE, Tools.ROUTING]);
		});
	});

	describe('register', () => {
		describe('tools', () => {
			describe('one of the relevant tool is activated', () => {
				it('registers an "beforeunload" event listener', async () => {
					const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
					const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
					const mockEvent = {
						returnValue: null,
						preventDefault: () => {}
					};
					const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault').mockImplementation(() => {});
					const store = setup();
					const instanceUnderTest = new BeforeUnloadPlugin();
					const toolId = 'myTool';
					vi.spyOn(instanceUnderTest, '_getTools').mockReturnValue([toolId]);
					await instanceUnderTest.register(store);

					setCurrentTool(toolId);

					expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

					const beforeunloadFn = addEventListenerSpy.mock.calls[0][1];
					beforeunloadFn(mockEvent);

					expect(mockEvent.returnValue).toBe('string');
					expect(preventDefaultSpy).toHaveBeenCalled();

					setCurrentTool(null);

					expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
				});
			});
		});

		describe('layers', () => {
			describe('one or more layers references a GeoResource containing local data', () => {
				it('registers an "beforeunload" event listener', async () => {
					const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
					const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
					const mockEvent = {
						returnValue: null,
						preventDefault: () => {}
					};
					const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault').mockImplementation(() => {});
					const gr0 = new VectorGeoResource('geoResourceId0', 'label', VectorSourceType.GEOJSON).markAsLocalData(true);
					const gr1 = new WmsGeoResource('geoResourceId1', 'label', 'https://some.url', 'layer', 'image/png');
					const store = setup({
						tools: { current: Tools.COMPARE }
					});
					const instanceUnderTest = new BeforeUnloadPlugin();
					vi.spyOn(geoResourceServiceMock, 'resolve').mockReturnValue([gr0, gr1]);
					const byIdSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(gr0);

					await instanceUnderTest.register(store);

					addLayer('id0', { geoResourceId: gr0.id });

					expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
					expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(gr0.id);
					const beforeunloadFn = addEventListenerSpy.mock.calls[0][1];

					beforeunloadFn(mockEvent);

					expect(mockEvent.returnValue).toBe('string');
					expect(preventDefaultSpy).toHaveBeenCalled();

					expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
				});

				describe('and the EXPORT tool is active', () => {
					it('does not call the "beforeunload" event listener', async () => {
						const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
						const mockEvent = {
							returnValue: null,
							preventDefault: () => {}
						};
						const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault').mockImplementation(() => {});
						const gr0 = new VectorGeoResource('geoResourceId0', 'label', VectorSourceType.GEOJSON).markAsLocalData(true);
						const gr1 = new WmsGeoResource('geoResourceId1', 'label', 'https://some.url', 'layer', 'image/png');
						const store = setup({
							tools: { current: Tools.EXPORT }
						});
						const instanceUnderTest = new BeforeUnloadPlugin();
						vi.spyOn(geoResourceServiceMock, 'resolve').mockReturnValue([gr0, gr1]);
						const byIdSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(gr0);
						await instanceUnderTest.register(store);

						addLayer('id0', { geoResourceId: gr0.id });

						const beforeunloadFn = addEventListenerSpy.mock.calls[0][1];

						beforeunloadFn(mockEvent);
						expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(gr0.id);
						expect(preventDefaultSpy).not.toHaveBeenCalled();
					});
				});
			});

			describe('no layer references a GeoResource without local data', () => {
				it('does not add an "beforeunload" event listener', async () => {
					const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
					const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
					const gr = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.GEOJSON).markAsLocalData(false);
					const store = setup();
					const instanceUnderTest = new BeforeUnloadPlugin();
					vi.spyOn(geoResourceServiceMock, 'resolve').mockReturnValue([gr]);
					const byIdSpy = vi.spyOn(geoResourceServiceMock, 'byId').mockReturnValue(gr);

					await instanceUnderTest.register(store);

					addLayer('id0', { geoResourceId: gr.id });

					expect(removeEventListenerSpy).toHaveBeenCalled();
					expect(addEventListenerSpy).not.toHaveBeenCalled();
					expect(byIdSpy).toHaveBeenCalledExactlyOnceWith(gr.id);
				});
			});
		});

		it('does NOTHING when app is embedded', async () => {
			vi.spyOn(environmentServiceMock, 'isEmbedded').mockReturnValue(true);
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
			const store = setup();
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			vi.spyOn(instanceUnderTest, '_getTools').mockReturnValue([toolId]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});

		it('does NOTHING when tool is not relevant', async () => {
			vi.spyOn(environmentServiceMock, 'isEmbedded').mockReturnValue(true);
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
			const store = setup();
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			vi.spyOn(instanceUnderTest, '_getTools').mockReturnValue([]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});
	});
});
