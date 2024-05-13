import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { initialState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { ToolsPlugin } from '../../src/plugins/ToolsPlugin';
import { Tools } from '../../src/domain/tools.js';
import { indicateAttributeChange } from '../../src/store/wcAttribute/wcAttribute.action.js';
import { wcAttributeReducer } from '../../src/store/wcAttribute/wcAttribute.reducer.js';

describe('ToolsPlugin', () => {
	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams(),
		isEmbedded: () => false,
		isEmbeddedAsWC: () => false
	};

	const setup = () => {
		const store = TestUtils.setupStoreAndDi(
			{},
			{
				tools: toolsReducer,
				wcAttribute: wcAttributeReducer
			}
		);
		$injector.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('register', () => {
		describe('in default mode', () => {
			it('updates the "tools" slice-of-state', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.EXPORT}`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(Tools.EXPORT);
			});

			it('does NOTHING when the ToolId is not available', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(``);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(initialState.current);
			});

			it('does NOTHING when the ToolId is not valid', async () => {
				const store = setup();
				const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=something`);
				const instanceUnderTest = new ToolsPlugin();
				spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);

				await instanceUnderTest.register(store);

				expect(store.getState().tools.current).toBe(initialState.current);
			});
		});

		describe('in embed mode', () => {
			describe('initial setup', () => {
				it('updates the "tools" slice-of-state', async () => {
					const store = setup();
					const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
					const instanceUnderTest = new ToolsPlugin();
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);

					await instanceUnderTest.register(store);

					expect(store.getState().tools.current).toBe(Tools.DRAW);
				});

				it('does NOTHING when the ToolId is not available for embed mode', async () => {
					const store = setup();
					const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.ROUTING}`);
					const instanceUnderTest = new ToolsPlugin();
					spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
					spyOn(environmentServiceMock, 'isEmbedded').and.returnValue(true);

					await instanceUnderTest.register(store);

					expect(store.getState().tools.current).toBe(initialState.current);
				});
			});

			describe('attribute change of the public web component', () => {
				describe('tool id is present', () => {
					it('updates the "tools" slice-of-state', async () => {
						const store = setup();
						const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
						const instanceUnderTest = new ToolsPlugin();
						let getQueryParamsCalls = 0;
						spyOn(environmentServiceMock, 'getQueryParams').and.callFake(() => {
							return getQueryParamsCalls++ === 0 ? new URLSearchParams() : queryParam;
						});
						spyOn(environmentServiceMock, 'isEmbeddedAsWC').and.returnValue(true);
						await instanceUnderTest.register(store);
						expect(store.getState().tools.current).toBeNull();

						indicateAttributeChange();

						expect(store.getState().tools.current).toBe(Tools.DRAW);
					});
				});

				describe('tool id is NOT present', () => {
					it('updates the "tools" slice-of-state', async () => {
						const store = setup();
						const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=${Tools.DRAW}`);
						const instanceUnderTest = new ToolsPlugin();
						let getQueryParamsCalls = 0;
						spyOn(environmentServiceMock, 'getQueryParams').and.callFake(() => {
							return getQueryParamsCalls++ === 0 ? queryParam : new URLSearchParams();
						});
						spyOn(environmentServiceMock, 'isEmbeddedAsWC').and.returnValue(true);
						await instanceUnderTest.register(store);

						expect(store.getState().tools.current).toBe(Tools.DRAW);

						indicateAttributeChange();

						expect(store.getState().tools.current).toBeNull();
					});
				});

				it('does nothing when tool id is not supported for embed mode', async () => {
					const store = setup();
					const queryParam = new URLSearchParams(`${QueryParameters.TOOL_ID}=someToolId`);
					const instanceUnderTest = new ToolsPlugin();
					let getQueryParamsCalls = 0;
					spyOn(environmentServiceMock, 'getQueryParams').and.callFake(() => {
						return getQueryParamsCalls++ === 0 ? new URLSearchParams() : queryParam;
					});
					spyOn(environmentServiceMock, 'isEmbeddedAsWC').and.returnValue(true);
					await instanceUnderTest.register(store);

					expect(store.getState().tools.current).toBeNull();

					indicateAttributeChange();

					expect(store.getState().tools.current).toBeNull();
				});
			});
		});
	});
});
