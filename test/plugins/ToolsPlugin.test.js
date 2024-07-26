import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { initialState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { ToolsPlugin } from '../../src/plugins/ToolsPlugin';
import { Tools, WcTools } from '../../src/domain/tools.js';
import { indicateAttributeChange } from '../../src/store/wcAttribute/wcAttribute.action.js';
import { wcAttributeReducer } from '../../src/store/wcAttribute/wcAttribute.reducer.js';
import { routingReducer } from '../../src/store/routing/routing.reducer.js';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType } from '../../src/domain/geoResources.js';
import { setRoute } from '../../src/store/routing/routing.action.js';

describe('ToolsPlugin', () => {
	const environmentService = {
		getQueryParams: () => new URLSearchParams(),
		isEmbedded: () => false,
		isEmbeddedAsWC: () => false
	};
	const fileStorageService = {
		isAdminId: () => false,
		isFileId: () => false
	};
	const geoResourceService = {
		byId: () => null,
		addOrReplace: () => null
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				tools: toolsReducer,
				wcAttribute: wcAttributeReducer,
				routing: routingReducer
			}
		);
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('FileStorageService', fileStorageService)
			.registerSingleton('GeoResourceService', geoResourceService);

		return store;
	};

	describe('register', () => {
		it('calls the handlers in the correct order', async () => {
			const store = setup();
			const toolId = 'foo';
			const callOrder = [];
			const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${toolId}`);
			const instanceUnderTest = new ToolsPlugin();
			const fileStorageHandlerSpy = spyOn(instanceUnderTest, '_fileStorageHandler').and.callFake(() => {
				callOrder.push('_fileStorageHandler');
				return false;
			});
			const routingHandlerSpy = spyOn(instanceUnderTest, '_routingHandler').and.callFake(() => {
				callOrder.push('_routingHandler');
				return false;
			});
			const defaultHandlerSpy = spyOn(instanceUnderTest, '_defaultHandler').and.callFake(() => {
				callOrder.push('_defaultHandler');
				return false;
			});
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(fileStorageHandlerSpy).toHaveBeenCalledWith(toolId, queryParam, store);
			expect(routingHandlerSpy).toHaveBeenCalledWith(toolId, queryParam, store);
			expect(defaultHandlerSpy).toHaveBeenCalledWith(toolId, queryParam, store);
			expect(callOrder).toEqual(['_fileStorageHandler', '_routingHandler', '_defaultHandler']);
		});

		it('stops calling the handlers when a handler resolves', async () => {
			const store = setup();
			const toolId = 'foo';
			const callOrder = [];
			const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${toolId}`);
			const instanceUnderTest = new ToolsPlugin();
			const fileStorageHandlerSpy = spyOn(instanceUnderTest, '_fileStorageHandler').and.callFake(() => {
				callOrder.push('_fileStorageHandler');
				return false;
			});
			const routingHandlerSpy = spyOn(instanceUnderTest, '_routingHandler').and.callFake(() => {
				callOrder.push('_routingHandler');
				return true;
			});
			const defaultHandlerSpy = spyOn(instanceUnderTest, '_defaultHandler').and.callFake(() => {
				callOrder.push('_defaultHandler');
				return false;
			});
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(fileStorageHandlerSpy).toHaveBeenCalled();
			expect(routingHandlerSpy).toHaveBeenCalled();
			expect(defaultHandlerSpy).not.toHaveBeenCalled();
			expect(callOrder).toEqual(['_fileStorageHandler', '_routingHandler']);
		});

		it('does NOT call the handlers when tool id is not available', async () => {
			const store = setup();
			const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=`);
			const instanceUnderTest = new ToolsPlugin();
			const fileStorageHandlerSpy = spyOn(instanceUnderTest, '_fileStorageHandler');
			const routingHandlerSpy = spyOn(instanceUnderTest, '_routingHandler');
			const defaultHandlerSpy = spyOn(instanceUnderTest, '_defaultHandler');
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);

			await instanceUnderTest.register(store);

			expect(fileStorageHandlerSpy).not.toHaveBeenCalled();
			expect(routingHandlerSpy).not.toHaveBeenCalled();
			expect(defaultHandlerSpy).not.toHaveBeenCalled();
		});

		describe('embedded as web component', () => {
			describe('registers an observer for wcAttribute `changed` property changes', () => {
				describe('the tool id is present', () => {
					it('updates the "tools" slice-of-state', async () => {
						const store = setup();
						const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
						const instanceUnderTest = new ToolsPlugin();
						let getQueryParamsCalls = 0;
						spyOn(environmentService, 'getQueryParams').and.callFake(() => {
							return getQueryParamsCalls++ === 0 ? new URLSearchParams() : queryParam;
						});
						spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
						await instanceUnderTest.register(store);
						expect(store.getState().tools.current).toBeNull();

						indicateAttributeChange();

						expect(store.getState().tools.current).toBe(Tools.DRAW);
					});
				});

				describe('the tool id is NOT present', () => {
					it('updates the "tools" slice-of-state', async () => {
						const store = setup();
						const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
						const instanceUnderTest = new ToolsPlugin();
						let getQueryParamsCalls = 0;
						spyOn(environmentService, 'getQueryParams').and.callFake(() => {
							return getQueryParamsCalls++ === 0 ? queryParam : new URLSearchParams();
						});
						spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
						await instanceUnderTest.register(store);

						expect(store.getState().tools.current).toBe(Tools.DRAW);

						indicateAttributeChange();

						expect(store.getState().tools.current).toBeNull();
					});
				});

				it('does nothing when the tool id is not supported for embed mode', async () => {
					const store = setup();
					const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=someToolId`);
					const instanceUnderTest = new ToolsPlugin();
					let getQueryParamsCalls = 0;
					spyOn(environmentService, 'getQueryParams').and.callFake(() => {
						return getQueryParamsCalls++ === 0 ? new URLSearchParams() : queryParam;
					});
					spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(true);
					await instanceUnderTest.register(store);

					expect(store.getState().tools.current).toBeNull();

					indicateAttributeChange();

					expect(store.getState().tools.current).toBeNull();
				});
			});
		});
	});

	describe('_routingHandler', () => {
		it('checks the query params for the presence of route waypoints and registers an observer that activates the tool', async () => {
			const store = setup();
			const toolId = Tools.EXPORT;
			const queryParam = new URLSearchParams(`${QueryParameters.ROUTE_WAYPOINTS}=1,2,3,4`);
			const instanceUnderTest = new ToolsPlugin();
			spyOn(environmentService, 'getQueryParams').and.returnValue(queryParam);

			expect(instanceUnderTest._routingHandler(toolId, new URLSearchParams())).toBeFalse();

			expect(instanceUnderTest._routingHandler(toolId, new URLSearchParams(`${QueryParameters.ROUTE_WAYPOINTS}=1,2,3,4`), store)).toBeTrue();

			setRoute({});

			expect(store.getState().tools.current).toBe(toolId);
		});
	});

	describe('_defaultHandler', () => {
		describe('in embed mode', () => {
			it('set the current tool', async () => {
				const store = setup();
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentService, 'isEmbedded').and.returnValue(true);

				let result = instanceUnderTest._defaultHandler();

				expect(store.getState().tools.current).toBe(initialState.current);
				expect(result).toBeTrue();

				result = instanceUnderTest._defaultHandler(WcTools[0]);

				expect(store.getState().tools.current).toBe(Tools.DRAW);
				expect(result).toBeTrue();
			});
		});

		describe('in default mode', () => {
			it('set the current tool', async () => {
				const store = setup();
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentService, 'isEmbedded').and.returnValue(false);

				let result = instanceUnderTest._defaultHandler();

				expect(store.getState().tools.current).toBe(initialState.current);
				expect(result).toBeTrue();

				result = instanceUnderTest._defaultHandler(Tools.DRAW);

				expect(store.getState().tools.current).toBe(Tools.DRAW);
				expect(result).toBeTrue();
			});
		});
	});

	describe('_setToolActiveAfterGeoResourceIsLoaded', () => {
		describe('the corresponding GeoResource is NOT a GeoResourceFuture', () => {
			it('activates the requested DRAW tool after the GeoResource was loaded', async () => {
				const store = setup();
				const fileId = 'fileId';
				const instanceUnderTest = new ToolsPlugin();
				spyOn(geoResourceService, 'byId').and.returnValue(new VectorGeoResource(fileId, 'label', VectorSourceType.KML));

				instanceUnderTest._setToolActiveAfterGeoResourceIsLoaded(fileId, Tools.DRAW);

				expect(store.getState().tools.current).toBe(Tools.DRAW);
			});
		});

		describe('the corresponding GeoResource is GeoResourceFuture', () => {
			it('activates the requested DRAW tool after the GeoResourceFuture was loaded', async () => {
				const store = setup();
				const fileId = 'fileId';
				const instanceUnderTest = new ToolsPlugin();
				const loader = jasmine
					.createSpy()
					.withArgs(fileId)
					.and.resolveTo(new VectorGeoResource(fileId, 'label', VectorSourceType.KML));
				const future = new GeoResourceFuture(fileId, loader);
				spyOn(geoResourceService, 'byId').and.returnValue(future);

				instanceUnderTest._setToolActiveAfterGeoResourceIsLoaded(fileId, Tools.DRAW);

				await future.get();

				expect(store.getState().tools.current).toBe(Tools.DRAW);
			});
		});

		describe('the corresponding GeoResource is unknown', () => {
			it('does nothing', async () => {
				const store = setup();
				const fileId = 'fileId';
				const instanceUnderTest = new ToolsPlugin();
				spyOn(geoResourceService, 'byId').and.returnValue(null);

				instanceUnderTest._setToolActiveAfterGeoResourceIsLoaded(fileId, Tools.DRAW);

				expect(store.getState().tools.current).toBe(initialState.current);
			});
		});
	});

	describe('_fileStorageHandler', () => {
		describe('layer query parameter denotes a file id and the DRAW should be initially active', () => {
			it('calls `_setToolActiveAfterGeoResourceIsLoaded`', async () => {
				setup();
				const fileId = 'fileId';
				const toolId = Tools.DRAW;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');
				spyOn(fileStorageService, 'isAdminId').and.returnValue(false);
				spyOn(fileStorageService, 'isFileId').and.callFake((id) => id === fileId);

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams(`${QueryParameters.LAYER}=foo,${fileId}`));

				expect(result).toBeTrue();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).toHaveBeenCalledWith(fileId, toolId);
			});
		});

		describe('layer query parameter denotes a file id and the MEASURE should be initially active', () => {
			it('calls `_setToolActiveAfterGeoResourceIsLoaded`', async () => {
				setup();
				const fileId = 'fileId';
				const toolId = Tools.MEASURE;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');
				spyOn(fileStorageService, 'isAdminId').and.returnValue(false);
				spyOn(fileStorageService, 'isFileId').and.callFake((id) => id === fileId);

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams(`${QueryParameters.LAYER}=foo,${fileId}`));

				expect(result).toBeTrue();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).toHaveBeenCalledWith(fileId, toolId);
			});
		});

		describe('tool id is not relevant', () => {
			it('does nothing if the tool is not supported', async () => {
				setup();
				const fileId = 'fileId';
				const toolId = Tools.ROUTING;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');
				spyOn(fileStorageService, 'isAdminId').and.returnValue(false);
				spyOn(fileStorageService, 'isFileId').and.callFake((id) => id === fileId);

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams(`${QueryParameters.LAYER}=foo,${fileId}`));

				expect(result).toBeFalse();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).not.toHaveBeenCalled();
			});
		});

		describe('layer query parameter denotes an admin id', () => {
			it('calls `_setToolActiveAfterGeoResourceIsLoaded`', async () => {
				setup();
				const adminId = 'adminId';
				const toolId = Tools.DRAW;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');
				spyOn(fileStorageService, 'isFileId').and.returnValue(false);
				spyOn(fileStorageService, 'isAdminId').and.callFake((id) => id === adminId);

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams(`${QueryParameters.LAYER}=foo,${adminId}`));

				expect(result).toBeTrue();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).toHaveBeenCalledWith(adminId, toolId);
			});
		});

		describe('layer query parameter denotes neither an admin id nor a file id', () => {
			it('does nothing', async () => {
				setup();
				const toolId = Tools.DRAW;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');
				spyOn(fileStorageService, 'isFileId').and.returnValue(false);
				spyOn(fileStorageService, 'isAdminId').and.returnValue(false);

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams(`${QueryParameters.LAYER}=foo`));

				expect(result).toBeFalse();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).not.toHaveBeenCalled();
			});
		});

		describe('layer query parameter not available', () => {
			it('does nothing', async () => {
				setup();
				const toolId = Tools.DRAW;
				const instanceUnderTest = new ToolsPlugin();
				const setToolActiveAfterGeoResourceIsLoadedSpy = spyOn(instanceUnderTest, '_setToolActiveAfterGeoResourceIsLoaded');

				const result = instanceUnderTest._fileStorageHandler(toolId, new URLSearchParams());

				expect(result).toBeFalse();
				expect(setToolActiveAfterGeoResourceIsLoadedSpy).not.toHaveBeenCalled();
			});
		});
	});
});
