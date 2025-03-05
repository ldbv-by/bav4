import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection/index.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { BeforeUnloadPlugin } from '../../src/plugins/BeforeUnloadPlugin.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { Tools } from '../../src/domain/tools.js';
import { addLayer } from '../../src/store/layers/layers.action.js';
import { VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../src/domain/geoResources.js';

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
					const addEventListenerSpy = spyOn(window, 'addEventListener');
					const removeEventListenerSpy = spyOn(window, 'removeEventListener');
					const mockEvent = {
						returnValue: null,
						preventDefault: () => {}
					};
					const preventDefaultSpy = spyOn(mockEvent, 'preventDefault');
					const store = setup();
					const instanceUnderTest = new BeforeUnloadPlugin();
					const toolId = 'myTool';
					spyOn(instanceUnderTest, '_getTools').and.returnValue([toolId]);
					await instanceUnderTest.register(store);

					setCurrentTool(toolId);

					expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));

					const beforeunloadFn = addEventListenerSpy.calls.argsFor(0)[1];

					beforeunloadFn(mockEvent);

					expect(mockEvent.returnValue).toBe('string');
					expect(preventDefaultSpy).toHaveBeenCalled();

					setCurrentTool(null);

					expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
				});
			});
		});

		describe('layers', () => {
			describe('one or more layers references a GeoResource containing local data', () => {
				it('registers an "beforeunload" event listener', async () => {
					const addEventListenerSpy = spyOn(window, 'addEventListener');
					const removeEventListenerSpy = spyOn(window, 'removeEventListener');
					const mockEvent = {
						returnValue: null,
						preventDefault: () => {}
					};
					const preventDefaultSpy = spyOn(mockEvent, 'preventDefault');
					const gr0 = new VectorGeoResource('geoResourceId0', 'label', VectorSourceType.GEOJSON).markAsLocalData(true);
					const gr1 = new WmsGeoResource('geoResourceId1', 'label', 'https://some.url', 'layer', 'image/png');
					const store = setup();
					const instanceUnderTest = new BeforeUnloadPlugin();
					spyOn(geoResourceServiceMock, 'resolve').and.returnValue([gr0, gr1]);
					spyOn(geoResourceServiceMock, 'byId').withArgs(gr0.id).and.returnValue(gr0);
					await instanceUnderTest.register(store);

					addLayer('id0', { geoResourceId: gr0.id });

					expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));

					const beforeunloadFn = addEventListenerSpy.calls.argsFor(0)[1];

					beforeunloadFn(mockEvent);

					expect(mockEvent.returnValue).toBe('string');
					expect(preventDefaultSpy).toHaveBeenCalled();

					expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
				});

				describe('and the EXPORT tool is active', () => {
					it('does not call the "beforeunload" event listener', async () => {
						const addEventListenerSpy = spyOn(window, 'addEventListener');
						const mockEvent = {
							returnValue: null,
							preventDefault: () => {}
						};
						const preventDefaultSpy = spyOn(mockEvent, 'preventDefault');
						const gr0 = new VectorGeoResource('geoResourceId0', 'label', VectorSourceType.GEOJSON).markAsLocalData(true);
						const gr1 = new WmsGeoResource('geoResourceId1', 'label', 'https://some.url', 'layer', 'image/png');
						const store = setup({
							tools: { current: Tools.EXPORT }
						});
						const instanceUnderTest = new BeforeUnloadPlugin();
						spyOn(geoResourceServiceMock, 'resolve').and.returnValue([gr0, gr1]);
						spyOn(geoResourceServiceMock, 'byId').withArgs(gr0.id).and.returnValue(gr0);
						await instanceUnderTest.register(store);

						addLayer('id0', { geoResourceId: gr0.id });

						const beforeunloadFn = addEventListenerSpy.calls.argsFor(0)[1];

						beforeunloadFn(mockEvent);

						expect(preventDefaultSpy).not.toHaveBeenCalled();
					});
				});
			});

			describe('no layer references a GeoResource without local data', () => {
				it('does not add an "beforeunload" event listener', async () => {
					const addEventListenerSpy = spyOn(window, 'addEventListener');
					const removeEventListenerSpy = spyOn(window, 'removeEventListener');
					const gr = new VectorGeoResource('geoResourceId', 'label', VectorSourceType.GEOJSON).markAsLocalData(false);
					const store = setup();
					const instanceUnderTest = new BeforeUnloadPlugin();
					spyOn(geoResourceServiceMock, 'resolve').and.returnValue([gr]);
					spyOn(geoResourceServiceMock, 'byId').withArgs(gr.id).and.returnValue(gr);
					await instanceUnderTest.register(store);

					addLayer('id0', { geoResourceId: gr.id });

					expect(removeEventListenerSpy).toHaveBeenCalled();
					expect(addEventListenerSpy).not.toHaveBeenCalled();
				});
			});
		});

		it('does NOTHING when app is embedded', async () => {
			spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
			const removeEventListenerSpy = spyOn(window, 'removeEventListener');
			const addEventListenerSpy = spyOn(window, 'addEventListener');
			const store = setup();
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			spyOn(instanceUnderTest, '_getTools').and.returnValue([toolId]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});

		it('does NOTHING when tool is not relevant', async () => {
			spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);
			const removeEventListenerSpy = spyOn(window, 'removeEventListener');
			const addEventListenerSpy = spyOn(window, 'addEventListener');
			const store = setup();
			const toolId = 'myTool';
			const instanceUnderTest = new BeforeUnloadPlugin();
			spyOn(instanceUnderTest, '_getTools').and.returnValue([]);

			await instanceUnderTest.register(store);

			setCurrentTool(toolId);
			setCurrentTool(null);

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
			expect(addEventListenerSpy).not.toHaveBeenCalled();
		});
	});
});
